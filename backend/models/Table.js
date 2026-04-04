const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  seats: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  babyHighChair: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'maintenance', 'closed'],
    default: 'available'
  },
  bookedSlots: {
    type: [Date],
    default: []
  },
  unavailableSlots: [
    {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      reason: { type: String, default: 'maintenance' }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);