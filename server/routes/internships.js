const express = require('express');
const {
    getInternships,
    getInternship,
    createInternship,
    updateInternship,
    deleteInternship,
    applyForInternship,
    getInternshipApplications
} = require('../controllers/internshipController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

// Public route for internships - Everyone can see
router
    .route('/')
    .get(getInternships)
    .post(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), createInternship);

router
    .route('/:id')
    .get(getInternship)
    .put(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), updateInternship)
    .delete(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), deleteInternship);

// Application routes
router
    .route('/:id/apply')
    .post(protect, authorize(ROLES.STUDENT), applyForInternship);

router
    .route('/:id/applications')
    .get(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), getInternshipApplications);

// Status updates and my applications
// Note: These might be better served under a separate /applications resource, but for simplicity here:
// We will mount this router on /api/v1/internships, so we need to be careful with paths.
// Let's create a separate router instance for applications or handle "me" carefully?
// Actually, let's keep "me" under a separate endpoint logic in server.js or just handle strict matching here.

// But wait, standard REST usually puts /applications as a top level resource if heavily used.
// Let's stick to simple paths for now.

module.exports = router;
