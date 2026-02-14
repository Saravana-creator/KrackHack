const Resource = require('../models/Resource');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');

// @desc      Get resources for a course
// @route     GET /api/v1/courses/:courseId/resources
// @access    Public
exports.getResources = asyncHandler(async (req, res, next) => {
    let query;

    if (req.params.courseId) {
        query = Resource.find({ course: req.params.courseId });
    } else {
        query = Resource.find().populate({
            path: 'course',
            select: 'title description'
        });
    }

    const resources = await query;

    res.status(200).json({
        success: true,
        count: resources.length,
        data: resources
    });
});

// @desc      Get single resource
// @route     GET /api/v1/resources/:id
// @access    Public
exports.getResource = asyncHandler(async (req, res, next) => {
    const resource = await Resource.findById(req.params.id).populate({
        path: 'course',
        select: 'title description'
    });

    if (!resource) {
        return next(new ErrorResponse(`No resource found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: resource
    });
});

// @desc      Add resource
// @route     POST /api/v1/courses/:courseId/resources
// @access    Private (Admin, Authority, Faculty)
exports.addResource = asyncHandler(async (req, res, next) => {
    req.body.course = req.params.courseId;
    req.body.uploadedBy = req.user.id; // User who uploaded it

    const course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.courseId}`, 404));
    }

    // Check ownership of course
    if (course.faculty.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'authority') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a resource to course ${course._id}`, 401));
    }

    const resource = await Resource.create(req.body);

    res.status(200).json({
        success: true,
        data: resource
    });
});
