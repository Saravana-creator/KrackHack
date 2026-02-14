const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Please add a company or lab name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    type: {
        type: String,
        enum: ['internship', 'research', 'project'],
        default: 'internship'
    },
    location: {
        type: String,
        required: [true, 'Please add a location (or Remote)']
    },
    stipend: {
        type: String,
        default: 'Unpaid'
    },
    duration: {
        type: String,
        required: [true, 'Please specify duration']
    },
    deadline: {
        type: Date,
        required: [true, 'Please add a deadline']
    },
    requirements: {
        type: [String],
        default: []
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Internship', InternshipSchema);
