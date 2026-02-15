const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const LostFoundItem = require('../models/LostFoundItem');
const Opportunity = require('../models/Opportunity');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Internship = require('../models/Internship');
const ROLES = require('../constants/roles');

// Helper for monthly trend
const getMonthlyTrend = async (Model, match = {}) => {
  return await Model.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// @desc    Get Authority Analytics
// @route   GET /api/v1/analytics/authority
// @access  Private (Authority)
exports.getAuthorityAnalytics = asyncHandler(async (req, res, next) => {
    const { type } = req.query;
    let stats = {};

    if (type === 'grievance') {
        const totalReports = await Grievance.countDocuments();
        const statusDistribution = await Grievance.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const monthlyTrend = await getMonthlyTrend(Grievance);

        stats = { totalReports, statusDistribution, monthlyTrend };

    } else if (type === 'lostfound') {
        const totalReports = await LostFoundItem.countDocuments();
        // Assuming LostFoundItem has a 'status' field or similar ('lost', 'found')
        // If not, we might group by 'type' (lost vs found report)
        const statusDistribution = await LostFoundItem.aggregate([
             { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const monthlyTrend = await getMonthlyTrend(LostFoundItem);

        stats = { totalReports, statusDistribution, monthlyTrend };
    }

    res.status(200).json(stats);
});

// @desc    Get Admin Analytics
// @route   GET /api/v1/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = asyncHandler(async (req, res, next) => {
    const { type } = req.query;
    let stats = {};

    if (type === 'students' || type === 'staff') {
        const role = type === 'students' ? 'student' : 'faculty'; // 'staff' usually implies faculty + others, assuming faculty for now
        const count = await User.countDocuments({ role });
        // Growth over time
        const growth = await getMonthlyTrend(User, { role });
        // Distribution by department
        const distribution = await User.aggregate([
            { $match: { role } },
            { $group: { _id: "$department", count: { $sum: 1 } } }
        ]);

        stats = { count, growth, distribution };

    } else if (type === 'career') {
        const total = await Opportunity.countDocuments();
        const types = await Opportunity.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        const growth = await getMonthlyTrend(Opportunity);
        
        stats = { total, types, growth };
    }

    res.status(200).json(stats);
});



// @desc    Get Faculty Attendance Analytics
// @route   GET /api/v1/analytics/faculty
// @access  Private (Faculty)
exports.getFacultyAnalytics = asyncHandler(async (req, res, next) => {
    const { courseId } = req.query;

    if (!courseId) {
        return res.status(400).json({ success: false, message: "Course ID required" });
    }
    
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    // 1. Attendance Distribution (Present vs Absent/Excused)
    const attendanceStats = await Attendance.aggregate([
         { $match: { course: courseObjectId } },
         { 
             $group: { 
                 _id: null, 
                 total: { $sum: 1 },
                 present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
             } 
         }
    ]);
    
    const totalSessions = attendanceStats[0]?.total || 0;
    const totalPresent = attendanceStats[0]?.present || 0;
    const percentPresent = totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0;

    // 2. Enrolled Students
    const enrolledCount = await Enrollment.countDocuments({ 
        course: courseId, 
        status: 'Enrolled' 
    });

    // 3. Active Students (Students with at least one attendance record)
    // We count unique students in Attendance for this course
    const activeStudents = await Attendance.distinct('student', { course: courseId });
    const activeCount = activeStudents.length;

    res.status(200).json({
        success: true,
        data: {
             percentPresent,
             enrolledCount,
             activeCount,
             totalSessions
        }
    }); 
});

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
                    $sum: { $cond: [{ $eq: ['$role', ROLES.STUDENT] }, 1, 0] }
                },
                faculty: {
                    $sum: { $cond: [{ $eq: ['$role', ROLES.FACULTY] }, 1, 0] }
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
