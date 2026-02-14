const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    requiredSkills: {
        type: [String],
        required: true
    },
    stipend: {
        type: String, // Kept as string to allow ranges or "Unpaid"
        default: 'Unpaid'
    },
    duration: {
        type: String,
        required: [true, 'Please add a duration']
    },
    deadline: {
        type: Date,
        required: [true, 'Please add a deadline']
    },
    type: {
        type: String,
        enum: ['Internship', 'Research', 'Job'],
        default: 'Internship'
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

module.exports = mongoose.model('Opportunity', OpportunitySchema);
