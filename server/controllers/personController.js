// server/controllers/personController.js
import pool from '../db/connection.js'

// Helper: lấy userId + treeId (treeId optional)
const getUserId = (req) => req.headers['x-user-id'] || null
const getTreeIdHeader = (req) => req.headers['x-tree-id'] || null

// Nếu treeId không được truyền, lấy tree đầu tiên của user
async function resolveTreeIdForUser(userId, treeIdFromHeader = null) {
  if (treeIdFromHeader) {
    // kiểm tra tree thuộc user
    const r = await pool.query(`SELECT id FROM family_trees WHERE id=$1 AND owner_id=$2`, [treeIdFromHeader, userId])
    if (r.rows.length === 0) return null
    return treeIdFromHeader
  }
  const r = await pool.query(`SELECT id FROM family_trees WHERE owner_id=$1 ORDER BY created_at LIMIT 1`, [userId])
  return r.rows[0]?.id ?? null
}

// GET all persons for the resolved tree
export const getAll = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  try {
    const treeId = await resolveTreeIdForUser(userId, getTreeIdHeader(req))
    if (!treeId) return res.status(400).json({ error: 'No tree found for user' })

    const result = await pool.query(`SELECT * FROM persons WHERE tree_id=$1 AND is_deleted = false`, [treeId])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

// CREATE person in resolved tree
export const create = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { name, position_x, position_y, birth_date, death_date, avatar_url, gender, notes } = req.body
  if (!name) return res.status(400).json({ error: 'Missing name' })

  try {
    const treeId = await resolveTreeIdForUser(userId, getTreeIdHeader(req))
    if (!treeId) return res.status(400).json({ error: 'No tree found for user' })

    const result = await pool.query(
      `INSERT INTO persons (tree_id, name, position_x, position_y, birth_date, death_date, avatar_url, gender, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [treeId, name, position_x ?? 200, position_y ?? 200, birth_date ?? null, death_date ?? null, avatar_url ?? null, gender ?? null, notes ?? null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Insert failed' })
  }
}

// UPDATE person (ensure person belongs to tree owned by user)
export const update = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { id } = req.params
  const { name, position_x, position_y, birth_date, death_date, avatar_url, gender, notes } = req.body
  try {
    // check person exists and belongs to a tree of user
    const personRes = await pool.query(
      `SELECT p.id, p.tree_id, t.owner_id FROM persons p JOIN family_trees t ON p.tree_id = t.id WHERE p.id=$1`,
      [id]
    )
    const person = personRes.rows[0]
    if (!person) return res.status(404).json({ error: 'Person not found' })
    if (person.owner_id !== userId) return res.status(403).json({ error: 'Not allowed' })

    const result = await pool.query(
      `UPDATE persons
       SET
         name = COALESCE($1, name),
         position_x = COALESCE($2, position_x),
         position_y = COALESCE($3, position_y),
         birth_date = COALESCE($4, birth_date),
         death_date = COALESCE($5, death_date),
         avatar_url = COALESCE($6, avatar_url),
         gender = COALESCE($7, gender),
         notes = COALESCE($8, notes),
         updated_at = now()
       WHERE id = $9
       RETURNING *`,
      [name, position_x, position_y, birth_date, death_date, avatar_url, gender, notes, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Update failed' })
  }
}

// SOFT DELETE person + delete relations involving it
export const softDelete = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { id } = req.params
  try {
    const personRes = await pool.query(
      `SELECT p.id, p.tree_id, t.owner_id FROM persons p JOIN family_trees t ON p.tree_id = t.id WHERE p.id=$1`,
      [id]
    )
    const person = personRes.rows[0]
    if (!person) return res.status(404).json({ error: 'Person not found' })
    if (person.owner_id !== userId) return res.status(403).json({ error: 'Not allowed' })

    await pool.query('UPDATE persons SET is_deleted = true WHERE id=$1', [id])
    await pool.query('DELETE FROM relations WHERE source_id=$1 OR target_id=$1', [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
