const asyncHandler = require('express-async-handler');
const AllowedDomain = require('../models/AllowedDomain');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Add allowed email domain
// @route   POST /api/v1/admin/domains
// @access  Private (Admin)
exports.addAllowedDomain = asyncHandler(async (req, res, next) => {
    const { domain } = req.body;
    if (!domain) {
        return next(new ErrorResponse('Please provide a domain (e.g., .edu, .sece.ac.in)', 400));
    }

    // Ensure it starts with dot if not provided, though standard is safer with explicit
    // User requested to remove forced dot check.
    const domainStr = domain;

    // Check if domain already starts with '.' or '@' if that is what they want, but here we just store what they give.
    // If they give 'gmail.com', we store 'gmail.com'. 
    // If they give '.edu', we store '.edu'.

    const newDomain = await AllowedDomain.create({
        domain: domainStr.toLowerCase(),
        addedBy: req.user.id
    });

    res.status(201).json({ success: true, data: newDomain });
});

// @desc    Get all allowed domains
// @route   GET /api/v1/admin/domains
// @access  Private (Admin)
exports.getAllowedDomains = asyncHandler(async (req, res, next) => {
    const domains = await AllowedDomain.find();
    res.status(200).json({ success: true, count: domains.length, data: domains });
});

// @desc    Delete allowed email domain
// @route   DELETE /api/v1/admin/domains/:id
// @access  Private (Admin)
exports.deleteAllowedDomain = asyncHandler(async (req, res, next) => {
    await AllowedDomain.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
});
