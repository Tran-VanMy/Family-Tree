// server/controllers/personController.js
import pool from '../db/connection.js'

// Lấy tất cả người (không lấy is_deleted)
export const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM persons WHERE is_deleted = false')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

// Tạo người mới
export const create = async (req, res) => {
  // bây giờ chấp nhận thêm gender và notes (tùy chọn)
  const { name, position_x, position_y, birth_date, death_date, avatar_url, gender, notes } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO persons (name, position_x, position_y, birth_date, death_date, avatar_url, gender, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        name,
        position_x ?? 200,
        position_y ?? 200,
        birth_date ?? null,
        death_date ?? null,
        avatar_url ?? null,
        gender ?? null,
        notes ?? null,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Insert failed' })
  }
}

// Cập nhật thông tin người
export const update = async (req, res) => {
  const { id } = req.params
  const { name, position_x, position_y, birth_date, death_date, avatar_url, gender, notes } = req.body
  try {
    const result = await pool.query(
      `UPDATE persons
       SET
         name = COALESCE($1,name),
         position_x = COALESCE($2,position_x),
         position_y = COALESCE($3,position_y),
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

// Xóa mềm người (đánh dấu is_deleted) và xóa quan hệ liên quan
export const softDelete = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('UPDATE persons SET is_deleted = true WHERE id=$1', [id])
    await pool.query('DELETE FROM relations WHERE source_id=$1 OR target_id=$1', [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
