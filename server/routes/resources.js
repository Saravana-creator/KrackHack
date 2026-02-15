const express = require('express');
const {
    getResources,
    getResource,
    addResource
} = require('../controllers/resourceController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

router
    .route('/')
    .get(getResources)
    .post(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), addResource);

router
    .route('/:id')
    .get(getResource);

module.exports = router;
