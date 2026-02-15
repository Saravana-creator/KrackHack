const Opportunity = require("../models/Opportunity");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const ROLES = require("../constants/roles");

// @desc      Get all opportunities (filtered)
// @route     GET /api/v1/opportunities
// @access    Private
exports.getOpportunities = asyncHandler(async (req, res, next) => {
  let query;

  // Optional filtering (type, stipend, skills)
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];

  // Remove fields with empty values or default ignored fields
  Object.keys(reqQuery).forEach((key) => {
    if (
      removeFields.includes(key) ||
      reqQuery[key] === "" ||
      reqQuery[key] === null
    ) {
      delete reqQuery[key];
    }
  });

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`,
  );

  console.log(`Opportunity Query Parsed: ${queryStr}`);

  // Allow search by skills
  if (req.query.skills && req.query.skills.trim() !== "") {
    const skills = req.query.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    if (skills.length > 0) {
      // Case insensitive search for skills? No, exact match is easier with $in, but current implementation is case sensitive
      // To make it robust, we rely on exact match for now as per schema
      query = Opportunity.find({
        ...JSON.parse(queryStr),
        requiredSkills: { $in: skills },
      });
    } else {
      query = Opportunity.find(JSON.parse(queryStr));
    }
  } else {
    query = Opportunity.find(JSON.parse(queryStr));
  }

  query = query.populate({
    path: "postedBy",
    select: "username email department",
  });

  const opportunities = await query;
  console.log(`Found ${opportunities.length} opportunities`);

  res.status(200).json({
    success: true,
    count: opportunities.length,
    data: opportunities,
  });
});

// @desc      Get single opportunity
// @route     GET /api/v1/opportunities/:id
// @access    Private
exports.getOpportunity = asyncHandler(async (req, res, next) => {
  const opportunity = await Opportunity.findById(req.params.id).populate(
    "postedBy",
    "username email",
  );

  if (!opportunity) {
    return next(
      new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: opportunity,
  });
});

// @desc      Create new opportunity
// @route     POST /api/v1/opportunities
// @access    Private (Faculty)
exports.createOpportunity = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.postedBy = req.user.id;

  // Check role
  if (
    req.user.role !== ROLES.FACULTY &&
    req.user.role !== ROLES.ADMIN &&
    req.user.role !== ROLES.AUTHORITY
  ) {
    return next(
      new ErrorResponse(
        `Role ${req.user.role} is not authorized to post opportunities`,
        403,
      ),
    );
  }

  const opportunity = await Opportunity.create(req.body);

  res.status(201).json({
    success: true,
    data: opportunity,
  });
});

// @desc      Update opportunity
// @route     PUT /api/v1/opportunities/:id
// @access    Private (Faculty/Admin)
exports.updateOpportunity = asyncHandler(async (req, res, next) => {
  let opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(
      new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404),
    );
  }

  // Check ownership
  if (
    opportunity.postedBy.toString() !== req.user.id &&
    req.user.role !== ROLES.ADMIN
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this opportunity`,
        401,
      ),
    );
  }

  opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: opportunity,
  });
});

// @desc      Delete opportunity
// @route     DELETE /api/v1/opportunities/:id
// @access    Private (Faculty/Admin)
exports.deleteOpportunity = asyncHandler(async (req, res, next) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(
      new ErrorResponse(`No opportunity found with id ${req.params.id}`, 404),
    );
  }

  // Check ownership
  if (
    opportunity.postedBy.toString() !== req.user.id &&
    req.user.role !== ROLES.ADMIN
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this opportunity`,
        401,
      ),
    );
  }

  await opportunity.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get opportunities posted by the logged-in faculty
// @route     GET /api/v1/opportunities/mine
// @access    Private (Faculty)
exports.getMyOpportunities = asyncHandler(async (req, res, next) => {
  const opportunities = await Opportunity.find({ postedBy: req.user.id });

  res.status(200).json({
    success: true,
    count: opportunities.length,
    data: opportunities,
  });
});
