const asyncHandler = require('express-async-handler');
const AllowedDomain = require('../models/AllowedDomain');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
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

// @desc    Get system stats for dashboard
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
exports.getAdminStats = asyncHandler(async (req, res, next) => {
    // 1. Users Breakdown
    const users = await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const userStats = {
        student: 0,
        faculty: 0,
        authority: 0,
        admin: 0
    };
    users.forEach(u => {
        if (userStats[u._id] !== undefined) {
            userStats[u._id] = u.count;
        }
    });

    // 2. Total Grievances
    const totalGrievances = await Grievance.countDocuments();

    // 3. Average Resolution Time
    const resolvedGrievances = await Grievance.find({ status: 'Resolved' });
    let totalTime = 0;
    let count = 0;
    
    resolvedGrievances.forEach(g => {
        // Find resolved event in timeline
        const resolvedEvent = g.timeline.find(t => t.status === 'Resolved');
        if (resolvedEvent) {
             const resolvedDate = new Date(resolvedEvent.date || resolvedEvent.updatedAt); // Support legacy structure
             const createdDate = new Date(g.createdAt);
             const diffTime = Math.abs(resolvedDate - createdDate);
             const diffDays = diffTime / (1000 * 60 * 60 * 24); 
             totalTime += diffDays;
             count++;
        } else {
             // Fallback if not in timeline (should not happen with new logic, but for old data)
             // Or maybe rely on updatedAt?
             const diffTime = Math.abs(new Date(g.updatedAt) - new Date(g.createdAt));
             const diffDays = diffTime / (1000 * 60 * 60 * 24);
             totalTime += diffDays;
             count++;
        }
    });
    
    const avgResolutionTime = count > 0 ? (totalTime / count).toFixed(1) + " days" : "N/A";

    // 4. Allowed Domains
    const allowedDomains = await AllowedDomain.countDocuments();

    res.status(200).json({
        success: true,
        data: {
            users: userStats,
            totalGrievances,
            avgResolutionTime,
            allowedDomains
        }
    });
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Update user (Role or Status)
// @route   PATCH /api/v1/admin/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { role, status } = req.body;
    
    // Prevent blocking self
    if (req.params.id === req.user.id && status === 'blocked') {
        return next(new ErrorResponse('You cannot block yourself', 400));
    }

    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: user });
});
