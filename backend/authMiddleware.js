const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    try{
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        res.sendStatus(403);
    }

}

module.exports = { authMiddleware };