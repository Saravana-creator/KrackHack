const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('Error: MONGO_URI environment variable is not defined.');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connection established successfully.');
        logger.info('MongoDB Connected');
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        logger.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
