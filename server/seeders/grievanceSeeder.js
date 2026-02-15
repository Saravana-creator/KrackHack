const Grievance = require('../models/Grievance');

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
        description: 'I have two exams scheduled at the same time on Monday for Data Structures and Mathematics.',
        category: 'academic',
        status: 'in-progress',
        priority: 'high'
    },
    {
        title: 'Delayed Fee Refund',
        description: 'My refund for the bus fee has been delayed by 2 months.',
        category: 'financial',
        status: 'resolved',
        priority: 'medium'
    },
    {
        title: 'Library Access Issue',
        description: 'My ID card is not scanning at the library entrance gate.',
        category: 'other',
        status: 'rejected',
        priority: 'low'
    },
    {
        title: 'Inappropriate Behavior by Staff',
        description: 'A staff member was rude when I asked for directions to the admin office.',
        category: 'harassment',
        status: 'in-progress',
        priority: 'high'
    }
];

const seed = async (studentUser, facultyUser) => {
    console.log('Seeding Grievances...');
    for (const g of grievances) {
        const exists = await Grievance.findOne({ title: g.title });
        if (!exists) {
            await Grievance.create({
                ...g,
                user: studentUser._id,
                assignedTo: facultyUser ? facultyUser._id : null
            });
            console.log(`Created Grievance: ${g.title}`);
        } else {
            console.log(`Skipped (Exists): ${g.title}`);
        }
    }
};

module.exports = seed;
