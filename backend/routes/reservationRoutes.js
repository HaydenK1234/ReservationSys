const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  getAllReservations
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createReservation);

// Admin routes
router.get('/', protect, adminOnly, getAllReservations);
router.put('/:id', protect, adminOnly, updateReservation);
router.delete('/:id', protect, adminOnly, deleteReservation);
router.get('/:id', getReservationById);

module.exports = router;