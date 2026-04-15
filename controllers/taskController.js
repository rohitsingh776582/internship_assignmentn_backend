
const pool = require("../config/db");

exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    console.log(userId);


    const result = await pool.query(
      `INSERT INTO tasks (title, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, userId]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE tasks 
       SET title=$1, description=$2, updated_at=CURRENT_TIMESTAMP
       WHERE id=$3 AND user_id=$4
       RETURNING *`,
      [title, description, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE tasks 
       SET status = NOT status, updated_at=CURRENT_TIMESTAMP
       WHERE id=$1 AND user_id=$2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
