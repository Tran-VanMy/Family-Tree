import pool from '../db/connection.js'
const getUserId = (req) => req.headers['x-user-id'] || null
const getFamilyId = (req) => req.headers['x-family-id'] || null

export const getAll = async (req, res) => {
  const userId = getUserId(req)
  const familyId = getFamilyId(req)
  try {
    const result = await pool.query(
      `SELECT m.*, p1.name AS spouse1_name, p2.name AS spouse2_name
       FROM marriages m
       LEFT JOIN persons p1 ON m.spouse1_id = p1.person_id
       LEFT JOIN persons p2 ON m.spouse2_id = p2.person_id`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

export const create = async (req, res) => {
  const { spouse1_id, spouse2_id, start_date, end_date, status, note } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO marriages (spouse1_id, spouse2_id, start_date, end_date, status, note)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [spouse1_id, spouse2_id, start_date, end_date, status, note]
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
    await pool.query(`DELETE FROM marriages WHERE marriage_id=$1`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
