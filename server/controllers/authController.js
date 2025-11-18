// server/controllers/authController.js
import pool from '../db/connection.js'
import bcrypt from 'bcryptjs'

export const register = async (req, res) => {
  const { email, password, username } = req.body
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Thiếu email / password / username' })
  }

  try {
    const hashed = await bcrypt.hash(password, 10)

    // tạo user
    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, username) VALUES ($1,$2,$3) RETURNING id,email,username,created_at`,
      [email, hashed, username]
    )
    const user = userRes.rows[0]

    // tạo family mặc định cho user
    const famRes = await pool.query(
      `INSERT INTO families (owner_id, name, description) VALUES ($1,$2,$3)
       RETURNING family_id, name, description, owner_id, created_at`,
      [user.id, 'default families', 'Root family'] // ✅ đổi tên mặc định
    )
    const family = famRes.rows[0]

    res.status(201).json({ user, family })
  } catch (err) {
    console.error('Register error', err)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email đã tồn tại' })
    }
    res.status(500).json({ error: 'Register failed' })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc password' })

  try {
    const userRes = await pool.query(
      `SELECT id, email, username, password_hash FROM users WHERE email=$1 LIMIT 1`,
      [email]
    )
    const userRow = userRes.rows[0]
    if (!userRow) return res.status(401).json({ error: 'Email hoặc password không đúng' })

    const ok = await bcrypt.compare(password, userRow.password_hash)
    if (!ok) return res.status(401).json({ error: 'Email hoặc password không đúng' })

    const famRes = await pool.query(
      `SELECT family_id, name, description, owner_id, created_at
       FROM families WHERE owner_id=$1 ORDER BY created_at LIMIT 1`,
      [userRow.id]
    )
    const family = famRes.rows[0] || null
    const user = { id: userRow.id, email: userRow.email, username: userRow.username }

    res.json({ user, family })
  } catch (err) {
    console.error('Login error', err)
    res.status(500).json({ error: 'Login failed' })
  }
}
