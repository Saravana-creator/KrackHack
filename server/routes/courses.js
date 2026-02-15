const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

// Include other resource router
const resourceRouter = require('./resources');

const router = express.Router();

// Re-route into other resource routers
router.use('/:courseId/resources', resourceRouter);

const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

router
    .route('/')
    .get(getCourses)
    .post(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), createCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), updateCourse)
    .delete(protect, authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY), deleteCourse);

module.exports = router;
