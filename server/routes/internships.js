const express = require('express');
const {
    getInternships,
    getInternship,
    createInternship,
    updateInternship,
    deleteInternship,
    applyForInternship,
    getInternshipApplications,
    updateApplicationStatus,
    getMyApplications
} = require('../controllers/internshipController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public route for internships - Everyone can see
router
    .route('/')
    .get(getInternships)
    .post(protect, authorize('faculty', 'admin', 'authority'), createInternship);

router
    .route('/:id')
    .get(getInternship)
    .put(protect, authorize('faculty', 'admin', 'authority'), updateInternship)
    .delete(protect, authorize('faculty', 'admin', 'authority'), deleteInternship);

// Application routes
router
    .route('/:id/apply')
    .post(protect, authorize('student'), applyForInternship);

router
    .route('/:id/applications')
    .get(protect, authorize('faculty', 'admin', 'authority'), getInternshipApplications);

// Status updates and my applications
// Note: These might be better served under a separate /applications resource, but for simplicity here:
// We will mount this router on /api/v1/internships, so we need to be careful with paths.
// Let's create a separate router instance for applications or handle "me" carefully?
// Actually, let's keep "me" under a separate endpoint logic in server.js or just handle strict matching here.

// But wait, standard REST usually puts /applications as a top level resource if heavily used.
// Let's stick to simple paths for now.

module.exports = router;
