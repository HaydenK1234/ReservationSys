const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const sendSMS = require('../utils/smsService');

const createReservation = async (req, res) => {
  try {
    const { customerName, email, phoneNum, reservedDate, numGuests, tableId } = req.body;

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.status !== 'available') {
      return res.status(400).json({ message: 'Table is not available' });
    }

    const requestedTime = new Date(reservedDate).getTime();
    const alreadyBooked = table.bookedSlots.some(
      slot => new Date(slot).getTime() === requestedTime
    );
    if (alreadyBooked) {
      return res.status(400).json({ message: 'Table already booked at this time' });
    }

    if (table.seats < numGuests) {
      return res.status(400).json({ message: 'Table does not have enough seats' });
    }

    const reservation = await Reservation.create({
    customerName, email, phoneNum, reservedDate, numGuests, tableId
    });

    table.bookedSlots.push(reservedDate);
    await table.save();

    await sendSMS(
    phoneNum,
    `This is a confirmation for a reservation at MyRestaurant. ` +
    `Time: ${new Date(reservedDate).toLocaleString()}. ` +
    `Table: ${table.location} (${table.seats} seats). ` +
    `Expected guests: ${numGuests}. ` +
    `Reservation ID: ${reservation._id}. ` +
    `Please show this ID to staff upon arrival.`
    );

    res.status(201).json({ message: 'Reservation created', reservation });

    res.status(201).json({ message: 'Reservation created', reservation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('tableId');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.status(200).json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.status(200).json({ message: 'Reservation updated', reservation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    const table = await Table.findById(reservation.tableId);
    if (table) {
      table.bookedSlots = table.bookedSlots.filter(
        slot => new Date(slot).getTime() !== new Date(reservation.reservedDate).getTime()
      );
      await table.save();
    }

    await reservation.deleteOne();
    res.status(200).json({ message: 'Reservation cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('tableId');
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { 
  createReservation, 
  getReservationById, 
  updateReservation, 
  deleteReservation,
  getAllReservations
};