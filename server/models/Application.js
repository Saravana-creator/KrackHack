const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    opportunity: {
        type: mongoose.Schema.ObjectId,
        ref: 'Opportunity'
    },
    internship: {
        type: mongoose.Schema.ObjectId,
        ref: 'Internship'
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    resumeURL: {
        type: String,
        required: [true, 'Please provide a resume URL']
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Rejected', 'Accepted'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent multiple applications for the same opportunity/internship by the same student
ApplicationSchema.index({ opportunity: 1, student: 1 }, { unique: true, sparse: true });
ApplicationSchema.index({ internship: 1, student: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Application', ApplicationSchema);
