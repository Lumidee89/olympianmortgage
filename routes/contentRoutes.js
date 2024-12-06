const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/add-content', verifyToken, contentController.addContent);
router.get('/all', verifyToken, contentController.getAllContents);

module.exports = router;
