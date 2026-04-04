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

router.post('/', createReservation);
router.get('/', protect, adminOnly, getAllReservations);
router.get('/:id', getReservationById);
router.put('/:id', updateReservation);
router.delete('/:id', protect, adminOnly, deleteReservation);

module.exports = router;