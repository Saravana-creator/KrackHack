const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
// const Internship = require("../models/Internship"); // Assuming Internship model exists and is required for backward compatibility
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const ROLES = require("../constants/roles");

// @desc      Apply for an opportunity
// @route     POST /api/v1/opportunities/:id/apply
// @access    Private (Student)
exports.applyForOpportunity = asyncHandler(async (req, res, next) => {
  // Check if opportunity exists
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) {
    return next(
      new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404),
    );
  }

  // Verify role
  if (req.user.role !== ROLES.STUDENT) {
    return next(
      new ErrorResponse(
        `User role ${req.user.role} is not authorized to apply`,
        403,
      ),
    );
  }

  // Check if already applied
  const existingApp = await Application.findOne({
    opportunity: req.params.id,
    student: req.user.id,
  });
  if (existingApp) {
    return next(
      new ErrorResponse("You have already applied to this opportunity", 400),
    );
  }

  // Create Application
  req.body.opportunity = req.params.id;
  req.body.student = req.user.id;
  // resumeURL should be in body

  const application = await Application.create(req.body);

  // Notify Opportunity Creator
  if (req.io) {
    req.io.to(opportunity.postedBy.toString()).emit("notification", {
      message: `New application for: ${opportunity.title}`,
      applicationId: application._id,
    });
  }

  res.status(201).json({
    success: true,
    data: application,
  });
});

// @desc      Get applications for a specific opportunity (For Creator)
// @route     GET /api/v1/opportunities/:id/applications
// @access    Private (Creator/Admin)
exports.getOpportunityApplications = asyncHandler(async (req, res, next) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(
      new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404),
    );
  }

  // Verify ownership
  if (
    opportunity.postedBy.toString() !== req.user.id &&
    req.user.role !== ROLES.ADMIN
  ) {
    return next(
      new ErrorResponse(
        `Not authorized to view applications for this opportunity`,
        401,
      ),
    );
  }

  const applications = await Application.find({
    opportunity: req.params.id,
  }).populate({
    path: "student",
    select: "username email department",
  });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc      Update Application Status (Creator/Admin)
// @route     PUT /api/v1/applications/:id
// @access    Private (Creator/Admin)
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  let application = await Application.findById(req.params.id)
    .populate("opportunity")
    .populate("internship");

  if (!application) {
    return next(
      new ErrorResponse(`No application found with id ${req.params.id}`, 404),
    );
  }

  let isAuthorized = false;
  let title = "";

  // Check Opportunity Ownership
  if (application.opportunity) {
    if (
      application.opportunity.postedBy.toString() === req.user.id ||
      req.user.role === ROLES.ADMIN
    ) {
      isAuthorized = true;
      title = application.opportunity.title;
    }
  }
  // Check Internship Ownership
  else if (application.internship) {
    // Populate createdBy because internship might not be fully populated with user details, but we need the ID
    // Actually populate('internship') gives the full object, including createdBy ID
    if (
      application.internship.createdBy.toString() === req.user.id ||
      req.user.role === ROLES.ADMIN
    ) {
      isAuthorized = true;
      title = application.internship.title;
    }
  }

  if (!isAuthorized) {
    return next(
      new ErrorResponse(`Not authorized to update this application`, 401),
    );
  }

  application = await Application.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    },
  );

  // Notify Student
  if (req.io) {
    req.io.to(application.student.toString()).emit("notification", {
      message: `Your application status for ${title} has been updated to ${req.body.status}`,
      applicationId: application._id,
    });
  }

  res.status(200).json({
    success: true,
    data: application,
  });
});

// @desc      Get My Applications (Student)
// @route     GET /api/v1/applications/me
// @access    Private (Student)
exports.getMyApplications = asyncHandler(async (req, res, next) => {
  // Find applications where student is current user
  // Populate both opportunity and internship
  const applications = await Application.find({
    student: req.user.id,
  })
    .populate("opportunity")
    .populate("internship");

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});
