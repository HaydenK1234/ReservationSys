const mongoose = require('mongoose');

// data schema for tables in restaurant, provides definitions for capacity and specific availabilities
const tableSchema = new mongoose.Schema({
  seats: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true  // eg near window, in corner, etc
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);