const express = require('express');
const {
    getGrievances,
    getGrievance,
    createGrievance,
    updateGrievance
} = require('../controllers/grievanceController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(protect, authorize('admin', 'authority'), getGrievances)
    .post(protect, authorize('student'), createGrievance);

router
    .route('/:id')
    .get(protect, getGrievance)
    .put(protect, authorize('student', 'admin', 'authority'), updateGrievance);

module.exports = router;
