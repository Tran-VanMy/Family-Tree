import pool from '../db/connection.js'
const getUserId = (req) => req.headers['x-user-id'] || null

export const getAll = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  try {
    const result = await pool.query(
      `SELECT family_id, name, description, owner_id, created_at
       FROM families WHERE owner_id=$1 ORDER BY created_at`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

export const create = async (req, res) => {
  const userId = getUserId(req)
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'Missing name' })
  try {
    const result = await pool.query(
      `INSERT INTO families (owner_id, name, description)
       VALUES ($1,$2,$3) RETURNING family_id,name,description,owner_id,created_at`,
      [userId, name, description ?? '']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Create family failed' })
  }
}

export const remove = async (req, res) => {
  const userId = getUserId(req)
  const { id } = req.params
  try {
    const row = await pool.query(`SELECT owner_id FROM families WHERE family_id=$1`, [id])
    if (row.rows.length === 0) return res.status(404).json({ error: 'Family not found' })
    if (row.rows[0].owner_id !== Number(userId)) return res.status(403).json({ error: 'Not allowed' })
    await pool.query(`DELETE FROM families WHERE family_id=$1`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
