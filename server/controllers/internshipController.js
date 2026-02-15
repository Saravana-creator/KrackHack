const Internship = require('../models/Internship');
const Application = require('../models/Application');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
const ROLES = require('../constants/roles');

// @desc      Get all internships
// @route     GET /api/v1/internships
// @access    Public
exports.getInternships = asyncHandler(async (req, res, next) => {
    let query;

    // Optional filtering (type, location)
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Internship.find(JSON.parse(queryStr)).populate({
        path: 'createdBy',
        select: 'username email'
    });

    // Filtering, sorting, and pagination logic can be added here if needed

    const internships = await query;

    res.status(200).json({
        success: true,
        count: internships.length,
        data: internships
    });
});

// @desc      Get single internship
// @route     GET /api/v1/internships/:id
// @access    Public
exports.getInternship = asyncHandler(async (req, res, next) => {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
        return next(new ErrorResponse(`No internship found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: internship
    });
});

// @desc      Create new internship
// @route     POST /api/v1/internships
// @access    Private (Admin, Authority, Faculty)
exports.createInternship = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check published internship by role
    if (req.user.role === ROLES.STUDENT) {
        return next(new ErrorResponse(`Role ${req.user.role} is not authorized to add an internship`, 403));
    }

    const internship = await Internship.create(req.body);

    res.status(201).json({
        success: true,
        data: internship
    });
});

// @desc      Update internship
// @route     PUT /api/v1/internships/:id
// @access    Private (Admin, Authority, Faculty)
exports.updateInternship = asyncHandler(async (req, res, next) => {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
        return next(new ErrorResponse(`No internship found with id ${req.params.id}`, 404));
    }

    // Check ownership
    if (internship.createdBy.toString() !== req.user.id && req.user.role !== ROLES.ADMIN) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this internship`, 401));
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: internship
    });
});

// @desc      Delete internship
// @route     DELETE /api/v1/internships/:id
// @access    Private (Admin, Authority, Faculty)
exports.deleteInternship = asyncHandler(async (req, res, next) => {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
        return next(new ErrorResponse(`No internship found with id ${req.params.id}`, 404));
    }

    // Check ownership
    if (internship.createdBy.toString() !== req.user.id && req.user.role !== ROLES.ADMIN) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this internship`, 401));
    }

    await internship.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// ----- Application Handlers -----

// @desc      Apply for an internship
// @route     POST /api/v1/internships/:id/applications
// @access    Private (Student)
exports.applyForInternship = asyncHandler(async (req, res, next) => {
    // Check if internship exists
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
        return next(new ErrorResponse(`No internship found with id ${req.params.id}`, 404));
    }

    // Verify role
    if (req.user.role !== ROLES.STUDENT) {
        return next(new ErrorResponse(`User role ${req.user.role} is not authorized to apply`, 403));
    }

    // Create Application
    req.body.internship = req.params.id;
    req.body.student = req.user.id;

    // Check if already applied (handled by unique index too, but cleaner here)
    const existingApp = await Application.findOne({ internship: req.params.id, student: req.user.id });
    if (existingApp) {
        return next(new ErrorResponse('You have already applied to this internship', 400));
    }

    const application = await Application.create(req.body);

    // Notify Internship Creator
    req.io.to(internship.createdBy.toString()).emit('notification', {
        message: `New application for your internship: ${internship.title}`,
        applicationId: application._id
    });

    res.status(201).json({
        success: true,
        data: application
    });
});

// @desc      Get all applications for a specific internship (For Creator)
// @route     GET /api/v1/internships/:id/applications
// @access    Private (Creator/Admin)
exports.getInternshipApplications = asyncHandler(async (req, res, next) => {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
        return next(new ErrorResponse(`No internship found with id ${req.params.id}`, 404));
    }

    // Verify ownership
    if (internship.createdBy.toString() !== req.user.id && req.user.role !== ROLES.ADMIN) {
        return next(new ErrorResponse(`Not authorized to view applications for this internship`, 401));
    }

    const applications = await Application.find({ internship: req.params.id }).populate({
        path: 'student',
        select: 'username email'
    });

    res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
    });
});


