const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    internship: {
        type: mongoose.Schema.ObjectId,
        ref: 'Internship',
        required: true
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    resumeLink: {
        type: String,
        // In a real app, this would be a file upload URL. 
        // For now, we'll treat it as a string (e.g., Google Drive link) or remove strict requirement for demo.
        required: [true, 'Please provide a resume link']
    },
    coverLetter: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate applications for the same internship by the same student
ApplicationSchema.index({ internship: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
