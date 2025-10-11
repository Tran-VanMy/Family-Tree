// server/controllers/relationController.js
import pool from '../db/connection.js'

const getUserId = (req) => req.headers['x-user-id'] || null
const getTreeIdHeader = (req) => req.headers['x-tree-id'] || null

async function resolveTreeIdForUser(userId, treeIdFromHeader = null) {
  if (treeIdFromHeader) {
    const r = await pool.query(`SELECT id FROM family_trees WHERE id=$1 AND owner_id=$2`, [treeIdFromHeader, userId])
    if (r.rows.length === 0) return null
    return treeIdFromHeader
  }
  const r = await pool.query(`SELECT id FROM family_trees WHERE owner_id=$1 ORDER BY created_at LIMIT 1`, [userId])
  return r.rows[0]?.id ?? null
}

// GET all relations for tree
export const getAll = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  try {
    const treeId = await resolveTreeIdForUser(userId, getTreeIdHeader(req))
    if (!treeId) return res.status(400).json({ error: 'No tree found for user' })

    const result = await pool.query(`SELECT * FROM relations WHERE tree_id=$1`, [treeId])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

// CREATE relation: require source_id and target_id belong to same tree and tree belongs to user
export const create = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { source_id, target_id, type, label } = req.body
  if (!source_id || !target_id) return res.status(400).json({ error: 'Missing source_id/target_id' })

  try {
    const treeId = await resolveTreeIdForUser(userId, getTreeIdHeader(req))
    if (!treeId) return res.status(400).json({ error: 'No tree found for user' })

    // ensure source and target are in this tree
    const resSrc = await pool.query(`SELECT id FROM persons WHERE id=$1 AND tree_id=$2`, [source_id, treeId])
    const resTgt = await pool.query(`SELECT id FROM persons WHERE id=$1 AND tree_id=$2`, [target_id, treeId])
    if (resSrc.rows.length === 0 || resTgt.rows.length === 0) {
      return res.status(400).json({ error: 'source or target does not belong to your tree' })
    }

    const allowed = new Set(['parent_child', 'spouse', 'sibling', 'custom'])
    const relType = allowed.has(type) ? type : 'custom'

    const result = await pool.query(
      `INSERT INTO relations (tree_id, source_id, target_id, type, label) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [treeId, source_id, target_id, relType, label ?? '']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Relation already exists' })
    }
    res.status(500).json({ error: 'Insert failed' })
  }
}

// DELETE relation by id (must belong to user's tree)
export const remove = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { id } = req.params
  try {
    // check relation belongs to a tree owned by user
    const r = await pool.query(`SELECT r.id FROM relations r JOIN family_trees t ON r.tree_id = t.id WHERE r.id=$1 AND t.owner_id=$2`, [id, userId])
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found or not allowed' })

    await pool.query(`DELETE FROM relations WHERE id=$1`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
