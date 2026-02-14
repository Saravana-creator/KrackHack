const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Internship = require('../models/Internship');

// @desc    Get system analytics (Department-wise)
// @route   GET /api/v1/analytics
// @access  Private (Admin, Authority)
exports.getSystemAnalytics = asyncHandler(async (req, res, next) => {

    // 1. User Distribution by Department
    const userStats = await User.aggregate([
        {
            $group: {
                _id: '$department',
                count: { $sum: 1 },
                students: {
                    $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
                },
                faculty: {
                    $sum: { $cond: [{ $eq: ['$role', 'faculty'] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // 2. Grievance Stats (Total Open vs Closed)
    const grievanceStats = await Grievance.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // 3. Department-wise Grievances (Requires Lookup)
    // This connects Grievances -> Users(author) -> Department
    const grievanceByDept = await Grievance.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        {
            $group: {
                _id: '$userDetails.department',
                total: { $sum: 1 },
                pending: {
                    $sum: { $cond: [{ $in: ['$status', ['pending', 'in-progress']] }, 1, 0] }
                },
                resolved: {
                    $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // 4. Counts
    const totalUsers = await User.countDocuments();
    const totalGrievances = await Grievance.countDocuments();
    const activeGrievances = await Grievance.countDocuments({ status: { $in: ['pending', 'in-progress'] } });
    const totalInternships = await Internship.countDocuments();

    res.status(200).json({
        success: true,
        data: {
            counts: {
                users: totalUsers,
                grievances: totalGrievances,
                active_grievances: activeGrievances,
                internships: totalInternships
            },
            department_users: userStats,
            department_grievances: grievanceByDept
        }
    });
});
