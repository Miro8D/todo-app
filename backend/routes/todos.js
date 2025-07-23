const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../authMiddleware');

// Get all todos
router.get('/', authMiddleware, async (req, res) => {
  const result = await db.query('SELECT * FROM todos WHERE user_id = $1', [req.user.id]);
  res.json(result.rows);
});

// Create a new todo
router.post('/',authMiddleware, async (req, res) => {
  const { text } = req.body;
  const result = await db.query('INSERT INTO todos (text, user_id) VALUES ($1, $2) RETURNING *', [text, req.user.id]);
  res.json(result.rows[0]);
});

// Delete a todo
router.delete('/:id',authMiddleware, async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  res.sendStatus(204);
});

// Modify a todo
router.patch('/:id',authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const result = await db.query('UPDATE todos SET text = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [text, id, req.user.id]);
  res.status(201).json(result.rows[0]);
});

module.exports = router;
