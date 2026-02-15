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
    getMyApplications,
    getMyOpportunities
} = require('../controllers/opportunityController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

router.use(protect); // All routes are protected

router
    .route('/')
    .get(getOpportunities)
    .post(authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), createOpportunity);

router
    .route('/applications/me')
    .get(authorize(ROLES.STUDENT), getMyApplications);

router
    .route('/mine')
    .get(authorize(ROLES.FACULTY), getMyOpportunities);

router
    .route('/:id')
    .get(getOpportunity)
    .put(authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), updateOpportunity)
    .delete(authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), deleteOpportunity);

router
    .route('/:id/apply')
    .post(authorize(ROLES.STUDENT), applyForOpportunity);

router
    .route('/:id/applications')
    .get(authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), getOpportunityApplications);

router
    .route('/applications/:id/status')
    .put(authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), updateApplicationStatus);

module.exports = router;
