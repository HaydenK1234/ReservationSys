const express = require('express');
const router = express.Router();
const {
  getAllTables,
  getAvailableTables,
  createTable,
  updateTable,
  deleteTable,
  addUnavailableSlot,
  removeUnavailableSlot
} = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/available', getAvailableTables);
router.get('/', getAllTables);
router.post('/', protect, adminOnly, createTable);
router.put('/:id', protect, adminOnly, updateTable);
router.delete('/:id', protect, adminOnly, deleteTable);
router.post('/:id/unavailable', protect, adminOnly, addUnavailableSlot);
router.delete('/:id/unavailable/:slotId', protect, adminOnly, removeUnavailableSlot);

module.exports = router;