const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database Connection Failed:', err.message);
        process.exit(1);
    }
};

const cleanup = async () => {
    await connectDB();
    
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        console.log('Existing Collections:', collectionNames.join(', '));
        
        if (collectionNames.includes('internships')) {
            console.log('Dropping unused collection: internships');
            await mongoose.connection.db.dropCollection('internships');
            console.log('Dropped successfully.');
        } else {
            console.log('Collection internships not found, skipping.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Cleanup Failed:', err);
        process.exit(1);
    }
};

cleanup();
