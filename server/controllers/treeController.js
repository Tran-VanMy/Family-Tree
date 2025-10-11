// server/controllers/treeController.js
import pool from '../db/connection.js'

// Helper: lấy userId từ header
const getUserId = (req) => req.headers['x-user-id'] || null

export const getAll = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  try {
    const result = await pool.query(`SELECT id, name, description, owner_id, created_at FROM family_trees WHERE owner_id=$1 ORDER BY created_at`, [userId])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

export const create = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'Missing name' })
  try {
    const result = await pool.query(
      `INSERT INTO family_trees (name, description, owner_id) VALUES ($1,$2,$3) RETURNING id,name,description,owner_id,created_at`,
      [name, description ?? '', userId]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Create tree failed' })
  }
}

export const remove = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { id } = req.params
  if (!id) return res.status(400).json({ error: 'Missing id' })
  try {
    // ensure owner
    const ownerRes = await pool.query(`SELECT owner_id FROM family_trees WHERE id=$1`, [id])
    const row = ownerRes.rows[0]
    if (!row) return res.status(404).json({ error: 'Tree not found' })
    if (row.owner_id !== userId) return res.status(403).json({ error: 'Not allowed' })

    await pool.query(`DELETE FROM family_trees WHERE id=$1`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
