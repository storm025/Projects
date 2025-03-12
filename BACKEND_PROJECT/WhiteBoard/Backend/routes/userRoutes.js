const express = require('express');
const router = express.Router();
const { registerUser, getUserProfile,deleteUser,loginUser} = require('../controllers/userController');
const { validateUser } = require('../middleware/validation');
const {authenticateUser} = require('../middleware/authenticate'); 

router.post('/register', validateUser,registerUser);
router.get('/profile',getUserProfile);
router.delete('/delete/:id', deleteUser);
router.post('/login',loginUser);

module.exports = router;

