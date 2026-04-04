const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const sendSMS = require('../utils/smsService');

/**
 * POST /api/reservations
 * Create a new reservation.
 * Checks table availability before confirming.
 */
const createReservation = async (req, res) => {
  try {
    const { customerName, email, phoneNum, reservedDate, numGuests, tableId } = req.body;

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.status !== 'available') {
      return res.status(400).json({ message: 'Table is not available' });
    }

    const requestedTime = new Date(reservedDate).getTime();
    const ONE_HOUR = 60 * 60 * 1000;

    const alreadyBooked = table.bookedSlots.some(
      slot => Math.abs(new Date(slot).getTime() - requestedTime) < ONE_HOUR
    );
    if (alreadyBooked) {
      return res.status(400).json({ message: 'Table already booked at this time' });
    }

    const hasUnavailableConflict = table.unavailableSlots.some(slot => {
      const start = new Date(slot.start).getTime();
      const end = new Date(slot.end).getTime();
      return requestedTime >= start && requestedTime < end;
    });
    if (hasUnavailableConflict) {
      return res.status(400).json({ message: 'Table is unavailable at this time' });
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
      `Please show this ID to staff upon arrival. Must be kept on person.`
    );

    return res.status(201).json({ message: 'Reservation created', reservation });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/reservations/:id
 * Retrieve a reservation by ID.
 * Used for customer lookup without login.
 */
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('tableId');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    return res.status(200).json(reservation);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * PUT /api/reservations/:id
 * Update an existing reservation.
 * Checks new slot availability if date is changing.
 */
const updateReservation = async (req, res) => {
  try {
    const existing = await Reservation.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Reservation not found' });

    if (req.body.reservedDate) {
      const table = await Table.findById(existing.tableId);
      const requestedTime = new Date(req.body.reservedDate).getTime();
      const currentTime = new Date(existing.reservedDate).getTime();
      const ONE_HOUR = 60 * 60 * 1000;

      const hasConflict = table.bookedSlots.some(slot => {
        const slotTime = new Date(slot).getTime();
        if (slotTime === currentTime) return false;
        return Math.abs(requestedTime - slotTime) < ONE_HOUR;
      });

      if (hasConflict) {
        return res.status(400).json({ message: 'Table is not available at the new time' });
      }

      const hasUnavailableConflict = table.unavailableSlots.some(slot => {
        const start = new Date(slot.start).getTime();
        const end = new Date(slot.end).getTime();
        return requestedTime >= start && requestedTime < end;
      });

      if (hasUnavailableConflict) {
        return res.status(400).json({ message: 'Table is unavailable at the new time' });
      }

      table.bookedSlots = table.bookedSlots.filter(
        slot => new Date(slot).getTime() !== currentTime
      );
      table.bookedSlots.push(req.body.reservedDate);
      await table.save();
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tableId');

    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    await sendSMS(
      reservation.phoneNum,
      `This is an update for your reservation at MyRestaurant. ` +
      `New time: ${new Date(reservation.reservedDate).toLocaleString()}. ` +
      `Table: ${reservation.tableId.location} (${reservation.tableId.seats} seats). ` +
      `Expected guests: ${reservation.numGuests}. ` +
      `Reservation ID: ${reservation._id}.`
    );

    return res.status(200).json({ message: 'Reservation updated', reservation });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * DELETE /api/reservations/:id
 * Cancel a reservation and remove its slot from the table.
 */
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
    return res.status(200).json({ message: 'Reservation cancelled' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/reservations
 * Admin only — get all reservations.
 */
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('tableId');
    return res.status(200).json(reservations);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  getAllReservations
};