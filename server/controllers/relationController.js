// server/controllers/relationController.js
import pool from '../db/connection.js'

// Lấy tất cả quan hệ
export const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM relations')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
}

// Tạo quan hệ mới (mong frontend gửi { source_id, target_id, type, label })
export const create = async (req, res) => {
  const { source_id, target_id, type, label } = req.body

  // Kiểm tra type hợp lệ (theo enum DB): parent_child, spouse, sibling, custom
  const allowed = new Set(['parent_child', 'spouse', 'sibling', 'custom'])
  const relType = allowed.has(type) ? type : 'custom'

  try {
    const result = await pool.query(
      `INSERT INTO relations (source_id, target_id, type, label) VALUES ($1,$2,$3,$4) RETURNING *`,
      [source_id, target_id, relType, label ?? '']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    // Nếu vi phạm foreign key hoặc unique constraint, trả lỗi hợp lý
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid person id (foreign key failed)' })
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Relation already exists' })
    }
    res.status(500).json({ error: 'Insert failed' })
  }
}

// Xóa quan hệ
export const remove = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM relations WHERE id=$1', [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Delete failed' })
  }
}
