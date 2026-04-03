const mongoose = require('mongoose');

// Reservation data schema containing the fields for a sole reservation
const reservationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true
  },
  phoneNum: {
    type: String,
    required: [true, 'Phone number is required']
  },
  reservedDate: {
    type: Date,
    required: [true, 'Reservation date is required']
  },
  numGuests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Must have at least 1 guest']
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: [true, 'Table selection is required']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);