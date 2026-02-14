const Grievance = require('../models/Grievance');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');

// @desc      Get all grievances (Admin/Authority only)
// @route     GET /api/v1/grievances
// @access    Private (Admin, Authority)
exports.getGrievances = asyncHandler(async (req, res, next) => {
    let query;

    if (req.user.role === 'admin' || req.user.role === 'authority') {
        const grievances = await Grievance.find();
        res.status(200).json({ success: true, count: grievances.length, data: grievances });
    } else if (req.user.role === 'student') {
        const grievances = await Grievance.find({ user: req.user.id });
        res.status(200).json({ success: true, count: grievances.length, data: grievances });
    } else {
        return next(new ErrorResponse('Not authorized to access grievances', 403));
    }
});

// @desc      Create a grievance (Student only)
// @route     POST /api/v1/grievances
// @access    Private (Student)
exports.createGrievance = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if user is a student
    if (req.user.role !== 'student') {
        return next(new ErrorResponse(`User with role ${req.user.role} is not authorized to submit a grievance`, 403));
    }

    const grievance = await Grievance.create(req.body);

    // Notify Admins and Authorities
    req.io.to('admin').to('authority').emit('notification', {
        message: `New Grievance Submitted by ${req.user.username}`,
        grievance
    });

    res.status(201).json({
        success: true,
        data: grievance
    });
});

// @desc      Get single grievance
// @route     GET /api/v1/grievances/:id
// @access    Private (Student, Admin, Authority)
exports.getGrievance = asyncHandler(async (req, res, next) => {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
        return next(new ErrorResponse(`No grievance found with the id of ${req.params.id}`, 404));
    }

    // Identify if the user is the owner or an admin/authority
    if (grievance.user.toString() !== req.user.id && req.user.role === 'student') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to view this grievance`, 401));
    }

    res.status(200).json({
        success: true,
        data: grievance
    });
});

// @desc      Update grievance status
// @route     PUT /api/v1/grievances/:id
// @access    Private (Admin, Authority)
exports.updateGrievance = asyncHandler(async (req, res, next) => {
    let grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
        return next(new ErrorResponse(`No grievance found with the id of ${req.params.id}`, 404));
    }

    // Check ownership
    if (req.user.role === 'student' && grievance.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this grievance`, 401));
    }

    if (req.user.role === 'student') {
        // Students can only update category or title, NOT status
        delete req.body.status;
        delete req.body.assignedTo;
    }

    grievance = await Grievance.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // Notify the user who submitted the grievance
    req.io.to(grievance.user.toString()).emit('notification', {
        message: `Your grievance status has been updated to ${grievance.status}`,
        grievance
    });

    res.status(200).json({
        success: true,
        data: grievance
    });
});
