import pool from '../db/connection.js'
const getUserId = (req) => req.headers['x-user-id'] || null
const getFamilyIdHeader = (req) => req.headers['x-family-id'] || null

async function resolveFamilyIdForUser(userId, familyIdHeader = null) {
  if (familyIdHeader) {
    const r = await pool.query(
      `SELECT family_id FROM families WHERE family_id=$1 AND owner_id=$2`,
      [familyIdHeader, userId]
    )
    if (r.rows.length === 0) return null
    return familyIdHeader
  }
  const r = await pool.query(
    `SELECT family_id FROM families WHERE owner_id=$1 ORDER BY created_at LIMIT 1`,
    [userId]
  )
  return r.rows[0]?.family_id ?? null
}

export const getAll = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })

  try {
    const familyId = await resolveFamilyIdForUser(userId, getFamilyIdHeader(req))
    if (!familyId) return res.status(400).json({ error: 'No family found for user' })

    const result = await pool.query(
      `SELECT m.*, p1.name AS spouse1_name, p2.name AS spouse2_name
       FROM marriages m
       LEFT JOIN persons p1 ON m.spouse1_id = p1.person_id
       LEFT JOIN persons p2 ON m.spouse2_id = p2.person_id
       WHERE p1.family_id = $1 AND p2.family_id = $1`,
      [familyId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

export const create = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })

  const { spouse1_id, spouse2_id, start_date, end_date, status, note } = req.body
  try {
    const familyId = await resolveFamilyIdForUser(userId, getFamilyIdHeader(req))
    if (!familyId) return res.status(400).json({ error: 'No family found for user' })

    const persons = await pool.query(
      `SELECT person_id, family_id FROM persons WHERE person_id = ANY($1::int[])`,
      [[spouse1_id, spouse2_id]]
    )
    if (persons.rows.length !== 2 || persons.rows.some((p) => p.family_id !== Number(familyId))) {
      return res.status(400).json({ error: 'Persons not in this family' })
    }

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
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' })

  const { id } = req.params
  try {
    const r = await pool.query(
      `SELECT m.marriage_id
       FROM marriages m
       JOIN persons p1 ON m.spouse1_id = p1.person_id
       JOIN families f ON p1.family_id = f.family_id
       WHERE m.marriage_id=$1 AND f.owner_id=$2`,
      [id, userId]
    )
    if (r.rows.length === 0) return res.status(404).json({ error: 'Marriage not found' })

    await pool.query(`DELETE FROM marriages WHERE marriage_id=$1`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
