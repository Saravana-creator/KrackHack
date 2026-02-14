const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');

// @desc      Get all opportunities (filtered)
// @route     GET /api/v1/opportunities
// @access    Private
exports.getOpportunities = asyncHandler(async (req, res, next) => {
    let query;

    // Optional filtering (type, stipend, skills)
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Remove fields with empty values or default ignored fields
    Object.keys(reqQuery).forEach(key => {
        if (removeFields.includes(key) || reqQuery[key] === '') {
            delete reqQuery[key];
        }
    });

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Allow search by skills
    if (req.query.skills) {
        const skills = req.query.skills.split(',');
        query = Opportunity.find({ ...JSON.parse(queryStr), requiredSkills: { $in: skills } });
    } else {
        query = Opportunity.find(JSON.parse(queryStr));
    }

    query = query.populate({
        path: 'postedBy',
        select: 'username email'
    });

    const opportunities = await query;

    res.status(200).json({
        success: true,
        count: opportunities.length,
        data: opportunities
    });
});

// @desc      Get single opportunity
// @route     GET /api/v1/opportunities/:id
// @access    Private
exports.getOpportunity = asyncHandler(async (req, res, next) => {
    const opportunity = await Opportunity.findById(req.params.id).populate('postedBy', 'username email');

    if (!opportunity) {
        return next(new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: opportunity
    });
});

// @desc      Create new opportunity
// @route     POST /api/v1/opportunities
// @access    Private (Faculty)
exports.createOpportunity = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.postedBy = req.user.id;

    // Check role
    if (req.user.role !== 'faculty' && req.user.role !== 'admin' && req.user.role !== 'authority') {
        return next(new ErrorResponse(`Role ${req.user.role} is not authorized to post opportunities`, 403));
    }

    const opportunity = await Opportunity.create(req.body);

    res.status(201).json({
        success: true,
        data: opportunity
    });
});

// @desc      Update opportunity
// @route     PUT /api/v1/opportunities/:id
// @access    Private (Faculty/Admin)
exports.updateOpportunity = asyncHandler(async (req, res, next) => {
    let opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        return next(new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404));
    }

    // Check ownership
    if (opportunity.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this opportunity`, 401));
    }

    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: opportunity
    });
});

// @desc      Delete opportunity
// @route     DELETE /api/v1/opportunities/:id
// @access    Private (Faculty/Admin)
exports.deleteOpportunity = asyncHandler(async (req, res, next) => {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        return next(new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404));
    }

    // Check ownership
    if (opportunity.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this opportunity`, 401));
    }

    await opportunity.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// ----- Application Handlers -----

// @desc      Apply for an opportunity
// @route     POST /api/v1/opportunities/:id/apply
// @access    Private (Student)
exports.applyForOpportunity = asyncHandler(async (req, res, next) => {
    // Check if opportunity exists
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
        return next(new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404));
    }

    // Verify role
    if (req.user.role !== 'student') {
        return next(new ErrorResponse(`User role ${req.user.role} is not authorized to apply`, 403));
    }

    // Create Application
    req.body.opportunity = req.params.id;
    req.body.student = req.user.id;
    // resumeURL should be in body

    // Check if already applied
    const existingApp = await Application.findOne({ opportunity: req.params.id, student: req.user.id });
    if (existingApp) {
        return next(new ErrorResponse('You have already applied to this opportunity', 400));
    }

    const application = await Application.create(req.body);

    // Notify Opportunity Creator
    if (req.io) {
        req.io.to(opportunity.postedBy.toString()).emit('notification', {
            message: `New application for: ${opportunity.title}`,
            applicationId: application._id
        });
    }

    res.status(201).json({
        success: true,
        data: application
    });
});

// @desc      Get applications for a specific opportunity (For Creator)
// @route     GET /api/v1/opportunities/:id/applications
// @access    Private (Creator/Admin)
exports.getOpportunityApplications = asyncHandler(async (req, res, next) => {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        return next(new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404));
    }

    // Verify ownership
    if (opportunity.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to view applications for this opportunity`, 401));
    }

    const applications = await Application.find({ opportunity: req.params.id }).populate({
        path: 'student',
        select: 'username email department'
    });

    res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
    });
});

// @desc      Update Application Status (Creator/Admin)
// @route     PUT /api/v1/applications/:id/status
// @access    Private (Creator/Admin)
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
    let application = await Application.findById(req.params.id).populate('opportunity');

    if (!application) {
        // Try finding internship application if not opportunity application (legacy support if needed)
        // For simplicity, strictly checking opportunity here as this is new module
        return next(new ErrorResponse(`No application found with id ${req.params.id}`, 404));
    }

    if (!application.opportunity) {
         return next(new ErrorResponse(`This application is not linked to an opportunity`, 400));
    }

    // Verify ownership of the *opportunity* associated with this application
    if (application.opportunity.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this application`, 401));
    }

    application = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
        new: true,
        runValidators: true
    });

    // Notify Student
    if (req.io) {
        req.io.to(application.student.toString()).emit('notification', {
            message: `Your application status for ${application.opportunity.title} has been updated to ${req.body.status}`,
            applicationId: application._id
        });
    }

    res.status(200).json({
        success: true,
        data: application
    });
});

// @desc      Get My Applications (Student)
// @route     GET /api/v1/opportunities/applications/me
// @access    Private (Student)
exports.getMyApplications = asyncHandler(async (req, res, next) => {
    const applications = await Application.find({ student: req.user.id, opportunity: { $exists: true } }).populate('opportunity');

    res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
    });
});
