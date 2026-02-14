const mongoose = require('mongoose');

const LostFoundItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Please add an item name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Electronics', 'Books', 'Clothing', 'ID Cards', 'Other']
    },
    imageURL: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    location: {
        type: String,
        required: [true, 'Where was it lost or found?']
    },
    status: {
        type: String,
        enum: ['Lost', 'Found', 'Claimed'],
        default: 'Lost'
    },
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LostFoundItem', LostFoundItemSchema);
