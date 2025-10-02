// server/controllers/personController.js
const pool = require('../db/connection');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM persons WHERE is_deleted = false');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.create = async (req, res) => {
  const { name, position_x, position_y } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO persons (name, position_x, position_y) VALUES ($1,$2,$3) RETURNING *`,
      [name, position_x || 200, position_y || 200]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { position_x, position_y, name } = req.body;
  try {
    const result = await pool.query(
      `UPDATE persons SET name = COALESCE($1,name), position_x = COALESCE($2,position_x), position_y = COALESCE($3,position_y), updated_at=now() WHERE id = $4 RETURNING *`,
      [name, position_x, position_y, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.softDelete = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE persons SET is_deleted = true WHERE id=$1', [id]);
    await pool.query('DELETE FROM relations WHERE source_id=$1 OR target_id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};
