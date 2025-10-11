// server/controllers/authController.js
import pool from '../db/connection.js'
import bcrypt from 'bcryptjs'

// Register: tạo user + tạo 1 family_tree mặc định
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

    // tạo family tree mặc định cho user
    const treeRes = await pool.query(
      `INSERT INTO family_trees (name, description, owner_id) VALUES ($1,$2,$3) RETURNING id,name,description,owner_id,created_at`,
      ['My Family', 'Root family tree', user.id]
    )
    const tree = treeRes.rows[0]

    res.status(201).json({ user, tree })
  } catch (err) {
    console.error('Register error', err)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email đã tồn tại' })
    }
    res.status(500).json({ error: 'Register failed' })
  }
}

// Login: trả về user + (một) tree mặc định (nếu có)
export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc password' })

  try {
    const userRes = await pool.query(`SELECT id, email, username, password_hash FROM users WHERE email = $1 LIMIT 1`, [email])
    const userRow = userRes.rows[0]
    if (!userRow) return res.status(401).json({ error: 'Email hoặc password không đúng' })

    const ok = await bcrypt.compare(password, userRow.password_hash)
    if (!ok) return res.status(401).json({ error: 'Email hoặc password không đúng' })

    // lấy tree đầu tiên của user (nếu có)
    const treeRes = await pool.query(`SELECT id, name, description, owner_id FROM family_trees WHERE owner_id = $1 ORDER BY created_at LIMIT 1`, [userRow.id])
    const tree = treeRes.rows[0] || null

    // trả về user (không có password_hash)
    const user = { id: userRow.id, email: userRow.email, username: userRow.username }
    res.json({ user, tree })
  } catch (err) {
    console.error('Login error', err)
    res.status(500).json({ error: 'Login failed' })
  }
}
