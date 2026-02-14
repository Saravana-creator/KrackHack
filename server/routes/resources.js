const express = require('express');
const {
    getResources,
    getResource,
    addResource
} = require('../controllers/resourceController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getResources)
    .post(protect, authorize('faculty', 'admin', 'authority'), addResource);

router
    .route('/:id')
    .get(getResource);

module.exports = router;
