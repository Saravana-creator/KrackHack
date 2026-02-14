const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the resource'],
        trim: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: [true, 'Please provide a file URL or link']
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link', 'other'],
        default: 'pdf'
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', ResourceSchema);
