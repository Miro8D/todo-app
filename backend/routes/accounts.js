const express = require('express');
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Signup request
router.post('/signup', async (req, res) => {
    // Checks if the user already exists so it doesn't throw an error if its the case
    const exists = (await db.query('SELECT * FROM users WHERE username = $1', [req.body.username])).rows[0];
    if (exists===0){
        return res.sendStatus(403);
    } 

    const username = req.body.username;
    const hash = await bcrypt.hash(req.body.password, 10);
    await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);
    
    const userid = (await db.query('SELECT id FROM users WHERE username = $1', [username])).rows[0].id;
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h'})

    return res.status(201).json({ token });
});


// Login request
router.post('/login', async (req, res) => {
    const password = req.body.password;
    const result = await db.query('SELECT * FROM users WHERE username = $1', [req.body.username]);
    
    if (result.rows.length === 0) return res.sendStatus(401);
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.sendStatus(401);
    
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h'})

    return res.status(202).json( { token })
    
});

module.exports = router;