const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');

    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all todos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM todos WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.log(err);
  }
});

// Create a new todo
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({error: 'title is required'});
  }

  const imagePath = req.file ? req.file.path : null;

  try {
    const result = await db.query('INSERT INTO todos (title, user_id, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *', [title, req.user.id, description, imagePath]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to add Todo"});
  }
});

// Delete a todo
router.delete('/:id',authMiddleware, async (req, res) => {
  const { id } = req.params;
  const imageResult = await db.query('SELECT image_url FROM todos WHERE id = $1', [id]);
  const imagePath = imageResult.rows[0]?.image_url;
  
  if (imagePath) {
    try{
      fs.unlink(path.join(__dirname, '..', imagePath), (err) => {
        if (err) {
          console.error('Error deleting image: ', err);
        }
      })
    } catch (err) console.error(err);
  }

  await db.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  res.sendStatus(204);
});

// Modify a todo
router.patch('/:id',authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const { description } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: "Title is required" });
    }
    
    let result;
    if (req.file) {
      const imageResult = (await db.query('SELECT image_url FROM todos WHERE id = $1', [id])).rows[0]?.image_url;
      if (imageResult) {
        fs.unlink(path.join(__dirname, '..', imageResult), (err) => {
          if (err) {
            console.error('Error deleting the image: ', err);
          }
        })
      }
      const imagePath = req.file.path;
      result = await db.query('UPDATE todos SET title = $1 , description = $2, image_url = $3 WHERE id = $4 AND user_id = $5 RETURNING *', 
        [title, description, imagePath, id, req.user.id]); 
    } else {
      result = await db.query('UPDATE todos SET title = $1 , description = $2 WHERE id = $3 AND user_id = $4 RETURNING *', 
        [title, description, id, req.user.id]); 
    }

    
    if (result.rows.length === 0) {
      return res.status(404).json({error: "Todo not found or unauthorized"});
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Update error: ', err);
    res.status(500).json({error: "Internet server error"});
  } 
});

module.exports = router;
