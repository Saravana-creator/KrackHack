const express = require('express');
const { 
    getSystemAnalytics, 
    getAuthorityAnalytics, 
    getAdminAnalytics, 
    getFacultyAnalytics 
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

router.get('/authority', protect, authorize(ROLES.AUTHORITY), getAuthorityAnalytics);
router.get('/admin', protect, authorize(ROLES.ADMIN), getAdminAnalytics);
router.get('/faculty', protect, authorize(ROLES.FACULTY), getFacultyAnalytics);

router
    .route('/')
    .get(protect, authorize(ROLES.ADMIN, ROLES.AUTHORITY), getSystemAnalytics);

module.exports = router;
