const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');

// Load Seeding Functions
const seedOpportunities = require('./opportunitySeeder');
const seedLostFound = require('./lostFoundSeeder');
const seedGrievance = require('./grievanceSeeder');
const seedAcademic = require('./academicSeeder');

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

const runSeeders = async () => {
    await connectDB();

    try {
        console.log('Checking/Creating Users...');
        
        // 1. Ensure Admin
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('Creating Admin User...');
            admin = await User.create({
                username: 'System Admin',
                email: 'admin@aegis.com',
                password: 'password123',
                role: 'admin',
                department: 'None'
            });
        }

        // 2. Ensure Faculty (Dr. Alan Turing)
        let faculty = await User.findOne({ email: 'alan@aegis.com' }); // Check by email to be specific
        if (!faculty) {
            console.log('Creating Faculty User...');
            faculty = await User.create({
                username: 'Dr. Alan Turing',
                email: 'alan@aegis.com',
                password: 'password123',
                role: 'faculty',
                department: 'CSE'
            });
        }

        // 3. Ensure Student (John Doe)
        let student = await User.findOne({ email: 'john@student.aegis.com' });
        if (!student) {
            console.log('Creating Student User...');
            student = await User.create({
                username: 'John Doe',
                email: 'john@student.aegis.com',
                password: 'password123',
                role: 'student',
                department: 'CSE'
            });
        }
        
        console.log('Users Ready.');

        // Run Seeders with correct users
        await seedOpportunities(faculty);  // Posted by Faculty
        await seedLostFound(student);      // Posted by Student (or anyone)
        await seedGrievance(student, faculty); // Student submits, Faculty assigned
        await seedAcademic(faculty);       // Faculty creates courses

        console.log('All Seeders Completed Successfully.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runSeeders();
