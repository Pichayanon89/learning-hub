const express = require('express');
const { login } = require('../controllers/authController');
const { loginRateLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.post('/login', loginRateLimiter, login);

module.exports = router;
