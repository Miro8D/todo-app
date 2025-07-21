const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all todos
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM todos');
  res.json(result.rows);
});

// Create a new todo
router.post('/', async (req, res) => {
  const { text } = req.body;
  const result = await db.query('INSERT INTO todos (text) VALUES ($1) RETURNING *', [text]);
  res.json(result.rows[0]);
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM todos WHERE id = $1', [id]);
  res.sendStatus(204);
});

module.exports = router;
