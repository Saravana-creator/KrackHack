const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aegis_protocol', {
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
