// server/controllers/personController.js
import pool from '../db/connection.js'

const getUserId = (req) => req.headers['x-user-id'] || null
const getFamilyIdHeader = (req) => req.headers['x-family-id'] || null

async function resolveFamilyIdForUser(userId, familyIdHeader = null) {
  if (familyIdHeader) {
    const r = await pool.query(`SELECT family_id FROM families WHERE family_id=$1 AND owner_id=$2`, [familyIdHeader, userId])
    if (r.rows.length === 0) return null
    return familyIdHeader
  }
  const r = await pool.query(`SELECT family_id FROM families WHERE owner_id=$1 ORDER BY created_at LIMIT 1`, [userId])
  return r.rows[0]?.family_id ?? null
}

export const getAll = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  try {
    const familyId = await resolveFamilyIdForUser(userId, getFamilyIdHeader(req))
    if (!familyId) return res.status(400).json({ error: 'No family found for user' })

    const result = await pool.query(`SELECT * FROM persons WHERE family_id=$1 AND is_deleted=false`, [familyId])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

export const create = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { name, gender, birth_date, death_date, notes, position_x, position_y } = req.body
  if (!name) return res.status(400).json({ error: 'Missing name' })

  try {
    const familyId = await resolveFamilyIdForUser(userId, getFamilyIdHeader(req))
    if (!familyId) return res.status(400).json({ error: 'No family found for user' })

    const result = await pool.query(
      `INSERT INTO persons (family_id, name, gender, birth_date, death_date, notes, position_x, position_y)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [familyId, name, gender, birth_date, death_date, notes, position_x ?? 200, position_y ?? 200]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Insert failed' })
  }
}

export const update = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { id } = req.params
  const { name, gender, birth_date, death_date, notes, position_x, position_y } = req.body
  try {
    const p = await pool.query(
      `SELECT p.person_id, f.owner_id FROM persons p
       JOIN families f ON p.family_id=f.family_id WHERE p.person_id=$1`,
      [id]
    )
    const row = p.rows[0]
    if (!row) return res.status(404).json({ error: 'Person not found' })
    if (row.owner_id !== Number(userId)) return res.status(403).json({ error: 'Not allowed' })

    const result = await pool.query(
      `UPDATE persons SET
         name = COALESCE($1, name),
         gender = COALESCE($2, gender),
         birth_date = COALESCE($3, birth_date),
         death_date = COALESCE($4, death_date),
         notes = COALESCE($5, notes),
         position_x = COALESCE($6, position_x),
         position_y = COALESCE($7, position_y)
       WHERE person_id=$8 RETURNING *`,
      [name, gender, birth_date, death_date, notes, position_x, position_y, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Update failed' })
  }
}

export const softDelete = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })
  const { id } = req.params
  try {
    const p = await pool.query(
      `SELECT p.person_id, f.owner_id FROM persons p
       JOIN families f ON p.family_id=f.family_id WHERE p.person_id=$1`,
      [id]
    )
    const row = p.rows[0]
    if (!row) return res.status(404).json({ error: 'Person not found' })
    if (row.owner_id !== Number(userId)) return res.status(403).json({ error: 'Not allowed' })

    await pool.query(`UPDATE persons SET is_deleted=true WHERE person_id=$1`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
