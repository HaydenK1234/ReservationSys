const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        require('../models/Table');
        require('../models/Reservation');

        console.log('Registered models:', Object.keys(mongoose.models));
        
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};
module.exports = connectDB;