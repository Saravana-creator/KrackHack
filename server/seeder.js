const mongoose = require('mongoose');
const dotenv = require('dotenv');

/*
 * Seeder Script for AEGIS Protocol
 * Purpose: Populates the database with sample/demo data for Opportunities, Lost & Found, and Grievances.
 * Usage: 
 *   - To Import Data: node seeder.js -i
 *   - Ensure .env file exists in the same directory with valid MONGO_URI
 */

// Load env vars
dotenv.config();

// Load models
const Opportunity = require('./models/Opportunity');
const LostFoundItem = require('./models/LostFoundItem');
const Grievance = require('./models/Grievance');
const User = require('./models/User');

// Connect to DB
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

// Sample Data
const opportunities = [
    {
        title: 'Full Stack Developer Internship',
        description: 'A 6-month internship focused on building scalable web applications using MERN stack. Mentorship provided.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        stipend: '15,000/month',
        duration: '6 months',
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
        type: 'Internship'
    },
    {
        title: 'Research Assistant - AI Lab',
        description: 'Assist in ongoing research projects related to Natural Language Processing and Computer Vision.',
        requiredSkills: ['Python', 'PyTorch', 'Machine Learning'],
        stipend: '20,000/month',
        duration: '1 year',
        deadline: new Date(new Date().setDate(new Date().getDate() + 45)),
        type: 'Research'
    },
    {
        title: 'Frontend Engineer',
        description: 'Full-time position for a skilled frontend developer proficient in React and modern CSS frameworks.',
        requiredSkills: ['React', 'CSS', 'Redux', 'TypeScript'],
        stipend: 'Unpaid', 
        duration: 'Permanent',
        deadline: new Date(new Date().setDate(new Date().getDate() + 60)),
        type: 'Job'
    }
];

const lostFoundItems = [
    {
        itemName: 'Dell XPS 13 Charger',
        description: 'Black Dell charger found near the library entrance.',
        category: 'Electronics',
        location: 'Library',
        status: 'Found',
        imageURL: 'https://via.placeholder.com/150'
    },
    {
        itemName: 'Blue Jansport Backpack',
        description: 'Lost my blue backpack containing notebooks and a water bottle.',
        category: 'Clothing', 
        location: 'Cafeteria',
        status: 'Lost',
        imageURL: 'https://via.placeholder.com/150'
    },
    {
        itemName: 'Student ID Card - CSE Dept',
        description: 'Found an ID card belonging to a 2nd year CSE student.',
        category: 'ID Cards',
        location: 'Main Block Hallway',
        status: 'Found',
        imageURL: 'https://via.placeholder.com/150'
    }
];

const grievances = [
    {
        title: 'Water Cooler Malfunction',
        description: 'The water cooler on the 3rd floor of the CS block is not cooling water properly.',
        category: 'infrastructure',
        status: 'pending',
        priority: 'medium'
    },
    {
        title: 'Exam Schedule Clash',
        description: 'I have two exams scheduled at the same time on Monday.',
        category: 'academic',
        status: 'in-progress',
        priority: 'high'
    }
];

const importData = async () => {
    await connectDB();

    try {
        console.log('Checking for existing users...');
        // Try to find an admin or authority first, then fallback to any user
        let user = await User.findOne({ role: { $in: ['admin', 'faculty', 'authority'] } });
        
        if (!user) {
            console.log('No users found. Creating default admin user...');
            user = await User.create({
                username: 'Aegis Admin',
                email: 'admin@aegis.com',
                password: 'password123',
                role: 'admin',
                department: 'CSE'
            });
            console.log('Default Admin User Created:');
            console.log('Email: admin@aegis.com');
            console.log('Password: password123');
        }

        console.log(`Seeding data using user: ${user.username} (${user._id})`);

        // 1. Seed Opportunities
        console.log('Seeding Opportunities...');
        for (const opp of opportunities) {
            const exists = await Opportunity.findOne({ title: opp.title });
            if (!exists) {
                await Opportunity.create({
                    ...opp,
                    postedBy: user._id
                });
                console.log(`Created Opportunity: ${opp.title}`);
            } else {
                console.log(`Skipped (Exists): ${opp.title}`);
            }
        }

        // 2. Seed Lost & Found
        console.log('Seeding Lost & Found Items...');
        for (const item of lostFoundItems) {
            const exists = await LostFoundItem.findOne({ itemName: item.itemName });
            if (!exists) {
                await LostFoundItem.create({
                    ...item,
                    postedBy: user._id
                });
                console.log(`Created Item: ${item.itemName}`);
            } else {
                console.log(`Skipped (Exists): ${item.itemName}`);
            }
        }

        // 3. Seed Grievances
        console.log('Seeding Grievances...');
        for (const g of grievances) {
            const exists = await Grievance.findOne({ title: g.title });
            if (!exists) {
                await Grievance.create({
                    ...g,
                    user: user._id
                }); // assignedTo is optional
                console.log(`Created Grievance: ${g.title}`);
            } else {
                console.log(`Skipped (Exists): ${g.title}`);
            }
        }

        console.log('Seed data import completed successfully.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Check for -i flag
if (process.argv[2] === '-i') {
    importData();
} else {
    console.log('Usage: node seeder.js -i');
    process.exit();
}
