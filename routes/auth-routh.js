const authController = require('../controllers/auth-controller')
const express = require('express')
const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/profile', authController.getProfile);

module.exports = router
