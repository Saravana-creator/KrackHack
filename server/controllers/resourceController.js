const Resource = require("../models/Resource");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const ROLES = require("../constants/roles");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// @desc      Get resources for a course
// @route     GET /api/v1/courses/:courseId/resources
// @access    Public
exports.getResources = asyncHandler(async (req, res, next) => {
  let query;
  let queryObj = { ...req.query };

  // Simple Search support
  if (req.query.search) {
    queryObj = {
      title: { $regex: req.query.search, $options: "i" },
    };
  }

  // Course filter
  if (req.params.courseId) {
    queryObj.course = req.params.courseId;
  }

  query = Resource.find(queryObj).populate({
    path: "course",
    select: "title description courseCode",
  });

  const resources = await query;

  res.status(200).json({
    success: true,
    count: resources.length,
    data: resources,
  });
});

// @desc      Get single resource
// @route     GET /api/v1/resources/:id
// @access    Public
exports.getResource = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id).populate({
    path: "course",
    select: "title description",
  });

  if (!resource) {
    return next(
      new ErrorResponse(`No resource found with id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: resource,
  });
});

// @desc      Add resource
// @route     POST /api/v1/courses/:courseId/resources
// @access    Private (Admin, Authority, Faculty)
exports.addResource = asyncHandler(async (req, res, next) => {
  req.body.course = req.params.courseId;
  req.body.uploadedBy = req.user.id; // User who uploaded it

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.courseId}`, 404),
    );
  }

  // Check ownership of course
  if (
    course.faculty.toString() !== req.user.id &&
    req.user.role !== ROLES.ADMIN &&
    req.user.role !== ROLES.AUTHORITY
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a resource to course ${course._id}`,
        401,
      ),
    );
  }

  // Handle File Upload (Local)
  if (req.file) {
    // req.file is available due to multer diskStorage
    // It has: path, filename, originalname, mimetype, size
    
    // Construct local file URL - or better yet, just the path relative to root
    // Since we serve '/uploads', the URL should be `/uploads/${req.file.filename}`
    const fileUrl = `/uploads/${req.file.filename}`;
    
    req.body.fileUrl = fileUrl;
    
    // Auto-detect type
    const mime = req.file.mimetype;
    if (mime.includes("pdf")) req.body.type = "pdf";
    else if (mime.includes("video")) req.body.type = "video";
    else if (mime.includes("image")) req.body.type = "image"; // map to other if needed
    else req.body.type = "other";

  } else {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const resource = await Resource.create(req.body);

  // 2.3 Hardcoded Notification Triggers (Material Upload)
  const students = await User.find({ role: 'student' });

  students.forEach(async (s) => {
    const notif = await Notification.create({
      user: s._id,
      title: 'New Material',
      message: 'A faculty has posted a new material.'
    });

    if (req.io) {
      req.io.to(s._id.toString()).emit('notification', notif);
    }
  });

  res.status(201).json({
    success: true,
    data: resource,
  });
});
