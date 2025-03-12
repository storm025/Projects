const express = require('express');
const router = express.Router();

const { getUserCanvases,createCanvas,loadCanvas,updateCanvas,deleteCanvas,shareCanvas} = require('../controllers/canvasController');
const {authenticateUser}  = require('../middleware/authenticate');

router.get('/list', authenticateUser, getUserCanvases);
router.post('/create',authenticateUser,createCanvas);
router.get('/load/:id',authenticateUser,loadCanvas);
router.put('/update/:id',authenticateUser,updateCanvas);
router.delete('/delete/:id',authenticateUser,deleteCanvas);
router.put('/share/:id',authenticateUser,shareCanvas);

module.exports = router;