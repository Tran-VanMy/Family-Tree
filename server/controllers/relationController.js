// server/controllers/relationController.js
const pool = require('../db/connection');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM relations');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.create = async (req, res) => {
  const { source_id, target_id, type, label } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO relations (source_id, target_id, type, label) VALUES ($1,$2,$3,$4) RETURNING *`,
      [source_id, target_id, type || 'custom', label || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM relations WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};
