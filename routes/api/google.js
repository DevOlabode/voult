const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/google');

router.get('/register', controller.googleRegister);

router.post('/login', controller.googleLogin);

module.exports = router;