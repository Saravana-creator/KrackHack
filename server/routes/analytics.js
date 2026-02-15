const express = require('express');
const { getSystemAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

router
    .route('/')
    .get(protect, authorize(ROLES.ADMIN, ROLES.AUTHORITY), getSystemAnalytics);

module.exports = router;
