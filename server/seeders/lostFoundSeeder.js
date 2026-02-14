const LostFoundItem = require('../models/LostFoundItem');

const items = [
    {
        itemName: 'Dell XPS 13 Charger',
        description: 'Black Dell charger found near the library entrance.',
        category: 'Electronics',
        location: 'Library',
        status: 'Found',
        imageURL: 'https://via.placeholder.com/150/0000FF/808080?text=Dell+Charger'
    },
    {
        itemName: 'Blue Jansport Backpack',
        description: 'Lost my blue backpack containing notebooks and a water bottle.',
        category: 'Clothing',
        location: 'Cafeteria',
        status: 'Lost',
        imageURL: 'https://via.placeholder.com/150/008000/FFFFFF?text=Backpack'
    },
    {
        itemName: 'Student ID Card - CSE Dept',
        description: 'Found an ID card belonging to a 2nd year CSE student.',
        category: 'ID Cards',
        location: 'Main Block Hallway',
        status: 'Found',
        imageURL: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=ID+Card'
    },
    {
        itemName: 'Mechanical Engineering Textbook',
        description: 'Left on a bench in the courtyard. Advanced Thermodynamics.',
        category: 'Books',
        location: 'Courtyard',
        status: 'Found',
        imageURL: 'https://via.placeholder.com/150/FFFF00/000000?text=Textbook'
    },
    {
        itemName: 'Silver Wristwatch',
        description: 'Lost my silver wristwatch during the Sports Meet.',
        category: 'Other',
        location: 'Sports Ground',
        status: 'Lost',
        imageURL: 'https://via.placeholder.com/150/000000/FFFFFF?text=Watch'
    },
    {
        itemName: 'Reading Glasses - Black Frame',
        description: 'Found near the canteen billing counter.',
        category: 'Other',
        location: 'Canteen',
        status: 'Found',
        imageURL: 'https://via.placeholder.com/150/800080/FFFFFF?text=Glasses'
    },
    {
        itemName: 'Scientific Calculator fx-991EX',
        description: 'Lost during Chemistry Lab practicals.',
        category: 'Electronics',
        location: 'Chemistry Lab',
        status: 'Lost',
        imageURL: 'https://via.placeholder.com/150/FFA500/000000?text=Calculator'
    },
    {
        itemName: 'Black Hoodie (Gap)',
        description: 'Found hanging on the back of a chair in Lecture Hall 3.',
        category: 'Clothing',
        location: 'Lecture Hall 3',
        status: 'Claimed',
        imageURL: 'https://via.placeholder.com/150/008080/FFFFFF?text=Hoodie'
    }
];

const seed = async (user) => {
    console.log('Seeding Lost & Found Items...');
    for (const item of items) {
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
};

module.exports = seed;
