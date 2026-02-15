const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ROLES = require('../constants/roles');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, department } = req.body;

    const AllowedDomain = require('../models/AllowedDomain'); // Make sure to require this at the top, I will handle it in the string here for context but in real code it should be top level. 
    // Wait, I cannot add require inside the function cleanly if I replace a chunk. I should replace the file content more broadly or add the require at the top.

    // Let's do the password check first.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return next(new ErrorResponse('Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character.', 400));
    }

    // Dynamic Domain Validation
    const allowedDomainsDocs = await AllowedDomain.find({});
    const allowedDomains = allowedDomainsDocs.map(d => d.domain);

    // Default allowed if list is empty, or add to list
    if (allowedDomains.length === 0) {
        allowedDomains.push('.edu'); // Default requirement
    }

    // Always allow admin domain
    allowedDomains.push('@admin.com');

    const isValidDomain = allowedDomains.some(domain => {
        // If domain is '.edu', email must end with '.edu'
        if (domain.startsWith('.')) return email.endsWith(domain);
        // If domain is '@admin.com', email must end with '@admin.com'
        if (domain.startsWith('@')) return email.endsWith(domain);
        // If domain is 'gmail.com', email must end with '@gmail.com' or '.gmail.com' (subdomain)
        // But strictest is '@' + domain
        return email.endsWith(`@${domain}`) || email.endsWith(`.${domain}`);
    });

    if (!isValidDomain) {
        return next(new ErrorResponse(`Email domain not allowed.`, 400));
    }

    // Role Escalation & Admin Domain Check
    let finalRole = role;

    // 1. Check if user is trying to be admin directly
    if (role === ROLES.ADMIN) {
        // Must use admin domain
        if (!email.endsWith('@admin.com')) {
            return next(new ErrorResponse('Admin role restricted to @admin.com domain', 403));
        }
    }

    // 2. Check if email is admin domain -> Force role to admin
    if (email.endsWith('@admin.com')) {
        finalRole = ROLES.ADMIN;
    }

    // 3. Validation for privileges
    if (finalRole === ROLES.ADMIN || finalRole === ROLES.AUTHORITY || finalRole === ROLES.FACULTY) {
        const { secretKey } = req.body;
        const ADMIN_SECRET = process.env.ADMIN_SECRET || 'AEGIS_ADMIN_SECRET_2024';
        if (!secretKey || secretKey !== ADMIN_SECRET) {
            return next(new ErrorResponse('Invalid Secret Key for privileged registration', 403));
        }
    }

    // Create user
    const user = await User.create({
        username: name,
        email,
        password,
        role: finalRole,
        department
    });

    const token = user.getSignedJwtToken();

    res.status(200).json({ success: true, token });
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate emil & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'AEGIS_PROTOCOL_SECRET', { expiresIn: '30d' });

    res.status(200).json({ success: true, token });
});

exports.getMe = asyncHandler(async (req, res, next) => {
    // Current user is already available in req.user due to the protect middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
});
