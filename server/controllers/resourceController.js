const Resource = require("../models/Resource");
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

  // Handle File Upload
  if (req.file) {
    try {
      const uploadStream = (buffer) => {
        return new Promise((resolve, reject) => {
          const upload_stream = cloudinary.uploader.upload_stream(
            {
              folder: "resources",
              resource_type: "auto", // Auto-detect type (pdf, video, etc.)
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          const stream = Readable.from(buffer);
          stream.pipe(upload_stream);
        });
      };

      const result = await uploadStream(req.file.buffer);

      if (result && result.secure_url) {
        req.body.fileUrl = result.secure_url;
        // Attempt to auto-set type if not provided or just rely on manual selection
        // For simplicity, let's keep manual selection or default 'pdf' unless obvious
        if (result.format === "pdf") req.body.type = "pdf";
        else if (["mp4", "mov", "avi"].includes(result.format))
          req.body.type = "video";
      }
    } catch (error) {
      console.error("Resource upload failed", error);
      return next(new ErrorResponse("File upload failed", 500));
    }
  }

  const resource = await Resource.create(req.body);

  res.status(201).json({
    success: true,
    data: resource,
  });
});
