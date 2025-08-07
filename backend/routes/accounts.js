const express = require('express');
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../authMiddleware');

// Signup request
router.post('/signup', async (req, res) => {
    try {
        // Checks if the user already exists so it doesn't throw an error if its the case
        const exists = (await db.query('SELECT * FROM users WHERE username = $1', [req.body.username])).rows[0];
        if (exists){
            return res.sendStatus(403);
        } 

        const username = req.body.username;
        const hash = await bcrypt.hash(req.body.password, 10);
        await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);

        const user = (await db.query('SELECT id, username FROM users WHERE username = $1', [username])).rows[0];

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({ token });
    } catch(err) {
        console.error("Error signing up user");
        res.sendStatus(500)
    }
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

router.patch('/password', authMiddleware, async (req, res) => {
    const {currentPassword, newPassword} = req.body;
    if (!(currentPassword) || !(newPassword)) return res.sendStatus(403);

    const result = (await db.query('SELECT password FROM users WHERE id = $1', [req.user.id])).rows[0];
    const match = await bcrypt.compare(currentPassword, result.password);
    if (!match) {
        return res.status(401).json( {error: 'Wrong password'});
    }
    try {
        const newHash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, req.user.id]);
        res.status(202).json({msg: 'Succesfully changed password'});
    } catch (err) {
        console.error('Error changing password: ', err);
        res.status(500).json({error: "Couldn't change password"});
    }
});

// get onboarding informations
router.get('/userinfo', authMiddleware, async (req, res) => {
    try {
        const result = (await db.query('SELECT first_name, last_name, phone_number, country FROM users WHERE id = $1', [req.user.id])).rows[0];
        res.status(200).json({
            firstName: result.first_name,
            lastName: result.last_name,
            phone: result.phone_number,
            country: result.country,
        });
    } catch (err) {
        res.status(500).json({err: 'Failed to get user info'});
    }
});

// Onboarding update
router.patch('/userinfo', authMiddleware, async (req, res) => {
    if (!(req.body.firstName) || !(req.body.lastName)) return res.sendStatus(403);
    
    try {
        await db.query('UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, country = $4 WHERE id = $5',
            [req.body.firstName, req.body.lastName, req.body.phone, req.body.country, req.user.id]
        );
        res.status(202).json({msg: 'Succesfully updated informations'});
    } catch (err) {
        console.error("Error adding onboard informations")
        return res.status(500).json({err: 'failed to update informations'});
    }
    
});

module.exports = router;