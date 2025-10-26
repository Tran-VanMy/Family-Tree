import pool from '../db/connection.js'

export const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pc.*, p1.name AS parent_name, p2.name AS child_name
       FROM parent_child pc
       LEFT JOIN persons p1 ON pc.parent_id = p1.person_id
       LEFT JOIN persons p2 ON pc.child_id = p2.person_id`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

export const create = async (req, res) => {
  const { parent_id, child_id, relationship } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO parent_child (parent_id, child_id, relationship)
       VALUES ($1,$2,$3) RETURNING *`,
      [parent_id, child_id, relationship]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Insert failed' })
  }
}

export const remove = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query(`DELETE FROM parent_child WHERE parent_child_id=$1`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
