const express = require('express');
const { login, register, logout } = require('../controllers/authController');
const { userValidation } = require('../utils/validators');

const router = express.Router();

router.post('/login', login);
router.post('/register', userValidation, register);
router.post('/logout', logout);

module.exports = router;