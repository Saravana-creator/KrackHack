const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const AcademicEvent = require("../models/AcademicEvent");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");

// @desc      Enroll in a course
// @route     POST /api/v1/academics/enroll/:courseId
// @access    Private (Student)
exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.courseId}`, 404),
    );
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: req.user.id,
    course: req.params.courseId,
  });

  if (existingEnrollment) {
    return next(new ErrorResponse("Already enrolled in this course", 400));
  }

  const enrollment = await Enrollment.create({
    student: req.user.id,
    course: req.params.courseId,
  });

  res.status(201).json({
    success: true,
    data: enrollment,
  });
});

// @desc      Get my enrolled courses
// @route     GET /api/v1/academics/my-courses
// @access    Private (Student)
exports.getMyCourses = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find({ student: req.user.id }).populate({
    path: "course",
    select: "title courseCode description credits faculty",
    populate: {
      path: "faculty",
      select: "username email",
    },
  });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

// @desc      Log attendance (Self-logger)
// @route     POST /api/v1/academics/attendance
// @access    Private (Student)
exports.logAttendance = asyncHandler(async (req, res, next) => {
  const { courseId, status, date, notes } = req.body;

  const attendance = await Attendance.create({
    student: req.user.id,
    course: courseId, // Optional
    status: status || "Present",
    date: date || Date.now(),
    notes,
  });

  res.status(201).json({
    success: true,
    data: attendance,
  });
});

// @desc      Get my attendance records
// @route     GET /api/v1/academics/attendance
// @access    Private (Student)
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.find({ student: req.user.id }).sort(
    "-date",
  );

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance,
  });
});

// @desc      Get academic calendar events (Personalized)
// @route     GET /api/v1/academics/events
// @access    Private
exports.getEvents = asyncHandler(async (req, res, next) => {
  // 1. Get user enrollments to find their courses
  const enrollments = await Enrollment.find({ student: req.user.id });
  const courseIds = enrollments.map((e) => e.course);

  // 2. Find events that are either Global (no course) OR related to enrolled courses
  const events = await AcademicEvent.find({
    $or: [
      { course: { $in: courseIds } },
      { course: null },
      { course: { $exists: false } },
    ],
  })
    .populate("course", "title courseCode")
    .sort("date");

  // 3. Transform to include context
  const personalizedEvents = events.map((ev) => ({
    _id: ev._id,
    title: ev.title,
    date: ev.date,
    type: ev.type,
    description: ev.description,
    courseName: ev.course ? ev.course.title : "Global Event",
    relatedCourse: ev.course ? ev.course._id : null,
  }));

  res.status(200).json({
    success: true,
    count: personalizedEvents.length,
    data: personalizedEvents,
  });
});

// @desc      Get faculty-specific academic data (Courses taught, events created)
// @route     GET /api/v1/academics/faculty
// @access    Private (Faculty)
exports.getFacultyAcademics = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id; 

  const courses = await Course.find({
    faculty: facultyId
  });

  const events = await AcademicEvent.find({
    createdBy: facultyId
  }).populate("course", "title courseCode"); 

  res.status(200).json({
    success: true,
    courses,
    events
  });
});

exports.createEvent = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;

  const event = await AcademicEvent.create(req.body);

  res.status(201).json({
    success: true,
    data: event,
  });
});
