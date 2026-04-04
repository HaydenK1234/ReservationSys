const Table = require('../models/Table');

/**
 * GET /api/tables
 * Get all tables.
 */
const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find();
    return res.status(200).json(tables);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/tables/available
 * Get tables available at a specific datetime for a given party size.
 * Checks both bookedSlots and unavailableSlots.
 */
const getAvailableTables = async (req, res) => {
  try {
    const { dateTime, numGuests } = req.query;
    const requestedTime = new Date(dateTime).getTime();
    const ONE_HOUR = 60 * 60 * 1000;

    const tables = await Table.find({
      status: 'available',
      seats: { $gte: Number(numGuests) }
    });

    const available = tables.filter(table => {
      const hasBookingConflict = table.bookedSlots.some(slot =>
        Math.abs(new Date(slot).getTime() - requestedTime) < ONE_HOUR
      );

      const hasUnavailableConflict = table.unavailableSlots.some(slot => {
        const start = new Date(slot.start).getTime();
        const end = new Date(slot.end).getTime();
        return requestedTime >= start && requestedTime < end;
      });

      return !hasBookingConflict && !hasUnavailableConflict;
    });

    return res.status(200).json(available);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/tables
 * Admin only — create a new table.
 */
const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    return res.status(201).json(table);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * PUT /api/tables/:id
 * Admin only — update a table.
 */
const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!table) return res.status(404).json({ message: 'Table not found' });
    return res.status(200).json(table);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * DELETE /api/tables/:id
 * Admin only — delete a table.
 */
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    return res.status(200).json({ message: 'Table deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/tables/:id/unavailable
 * Admin only — add an unavailability window to a table.
 */
const addUnavailableSlot = async (req, res) => {
  try {
    const { start, end, reason } = req.body;

    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    table.unavailableSlots.push({ start, end, reason: reason || 'maintenance' });
    await table.save();

    return res.status(201).json({ message: 'Unavailability window added', table });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * DELETE /api/tables/:id/unavailable/:slotId
 * Admin only — remove an unavailability window.
 */
const removeUnavailableSlot = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    table.unavailableSlots = table.unavailableSlots.filter(
      slot => slot._id.toString() !== req.params.slotId
    );
    await table.save();

    return res.status(200).json({ message: 'Unavailability window removed', table });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllTables,
  getAvailableTables,
  createTable,
  updateTable,
  deleteTable,
  addUnavailableSlot,
  removeUnavailableSlot
};