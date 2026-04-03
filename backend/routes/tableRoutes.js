const express = require('express');
const router = express.Router();
const { getAllTables, getAvailableTables, createTable } = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllTables);
router.get('/available', getAvailableTables);
router.post('/', protect, adminOnly, createTable);

module.exports = router;