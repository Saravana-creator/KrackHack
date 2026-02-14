const express = require('express');
const {
    getOpportunities,
    getOpportunity,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    applyForOpportunity,
    getOpportunityApplications,
    updateApplicationStatus,
    getMyApplications
} = require('../controllers/opportunityController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes are protected

router
    .route('/')
    .get(getOpportunities)
    .post(authorize('faculty', 'admin', 'authority'), createOpportunity);

router
    .route('/applications/me')
    .get(authorize('student'), getMyApplications);

router
    .route('/:id')
    .get(getOpportunity)
    .put(authorize('faculty', 'admin', 'authority'), updateOpportunity)
    .delete(authorize('faculty', 'admin', 'authority'), deleteOpportunity);

router
    .route('/:id/apply')
    .post(authorize('student'), applyForOpportunity);

router
    .route('/:id/applications')
    .get(authorize('faculty', 'admin', 'authority'), getOpportunityApplications);

router
    .route('/applications/:id/status')
    .put(authorize('faculty', 'admin', 'authority'), updateApplicationStatus);

module.exports = router;
