const Course = require('../models/Course');
const Resource = require('../models/Resource');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
const ROLES = require('../constants/roles');

// @desc      Get all courses
// @route     GET /api/v1/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query = Course.find().populate({
        path: 'faculty',
        select: 'username'
    });

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'faculty',
        select: 'username'
    });

    if (!course) {
        return next(new ErrorResponse(`No course found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc      Create new course
// @route     POST /api/v1/courses
// @access    Private (Admin, Authority, Faculty)
exports.createCourse = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.faculty = req.user.id; // Faculty who created it

    // Check published course
    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: course
    });
});

// @desc      Update course
// @route     PUT /api/v1/courses/:id
// @access    Private (Admin, Authority, Faculty)
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No course found with id ${req.params.id}`, 404));
    }

    // Make sure user is course owner
    if (course.faculty.toString() !== req.user.id && req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.AUTHORITY) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc      Delete course
// @route     DELETE /api/v1/courses/:id
// @access    Private (Admin, Authority, Faculty)
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No course found with id ${req.params.id}`, 404));
    }

    // Make sure user is course owner
    if (course.faculty.toString() !== req.user.id && req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.AUTHORITY) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
    }

    await course.deleteOne();
    // Also delete associated resources
    await Resource.deleteMany({ course: req.params.id });

    res.status(200).json({
        success: true,
        data: {}
    });
});
