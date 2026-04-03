const Table = require('../models/Table');


const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({ status: 'available' });
    res.status(200).json(tables);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const getAvailableTables = async (req, res) => {
  try {
    const { dateTime, numGuests } = req.query;
    const requestedTime = new Date(dateTime).getTime();

    const tables = await Table.find({
      status: 'available',
      seats: { $gte: Number(numGuests) }
    });

    const available = tables.filter(table =>
      !table.bookedSlots.some(slot => new Date(slot).getTime() === requestedTime)
    );

    res.status(200).json(available);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = { getAllTables, getAvailableTables, createTable };