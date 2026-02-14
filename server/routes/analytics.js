const express = require('express');
const { getSystemAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(protect, authorize('admin', 'authority'), getSystemAnalytics);

module.exports = router;
