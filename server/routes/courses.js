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

router
    .route('/')
    .get(getCourses)
    .post(protect, authorize('faculty', 'admin', 'authority'), createCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('faculty', 'admin', 'authority'), updateCourse)
    .delete(protect, authorize('faculty', 'admin', 'authority'), deleteCourse);

module.exports = router;
