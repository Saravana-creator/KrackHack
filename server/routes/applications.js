const express = require('express');
const {
    updateApplicationStatus,
    getMyApplications
} = require('../controllers/internshipController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/my')
    .get(protect, authorize('student'), getMyApplications);

router
    .route('/:id')
    .put(protect, authorize('faculty', 'admin', 'authority'), updateApplicationStatus);

module.exports = router;
