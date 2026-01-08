const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth');

router.get('/login', (req, res)=>{
    res.send('The Login Form')
})


module.exports = router;