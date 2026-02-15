const mongoose = require('mongoose');

const AllowedDomainSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: [true, 'Please add a domain'],
        unique: true,
        trim: true,
        lowercase: true
    },
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AllowedDomain', AllowedDomainSchema);
