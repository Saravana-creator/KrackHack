const Grievance = require("../models/Grievance");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const ROLES = require('../constants/roles');

// @desc      Get all grievances (Admin/Authority only)
// @route     GET /api/v1/grievances
// @access    Private (Admin, Authority)
// @desc      Get all grievances (Admin/Authority only)
// @route     GET /api/v1/grievances
// @access    Private (Admin, Authority)
exports.getGrievances = asyncHandler(async (req, res, next) => {
  let grievances;

  if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.AUTHORITY) {
    const rawGrievances = await Grievance.find()
      .populate("user", "username email department")
      .populate("assignedTo", "username email");

    // Apply anonymity mask
    grievances = rawGrievances.map((g) => {
      const doc = g.toObject();
      if (doc.isAnonymous && doc.user) {
        doc.user.username = "Anonymous Student";
        doc.user.email = "Hidden";
        doc.user.department = "Hidden";
      }
      return doc;
    });
  } else if (req.user.role === ROLES.STUDENT) {
    grievances = await Grievance.find({ user: req.user.id }).populate(
      "assignedTo",
      "username email",
    );
  } else {
    return next(new ErrorResponse("Not authorized to access grievances", 403));
  }

  console.log(
    `Fetched ${grievances.length} grievances for user ${req.user.username}`,
  );

  res
    .status(200)
    .json({ success: true, count: grievances.length, data: grievances });
});

const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// @desc      Create a grievance (Student only)
// @route     POST /api/v1/grievances
// @access    Private (Student)
exports.createGrievance = asyncHandler(async (req, res, next) => {
  console.log("Create Grievance Body:", req.body);
  console.log("Create Grievance File:", req.file);

  // Add user to req.body
  req.body.user = req.user.id;

  // Initialize timeline
  req.body.timeline = [
    {
      status: "Submitted",
      date: Date.now(),
      comment: "Grievance submitted",
      updatedBy: req.user.id,
    },
  ];

  // Prevent CastError if image field comes in as object
  if (req.body.image) {
    delete req.body.image;
  }

  // Check if user is a student
  if (req.user.role !== ROLES.STUDENT) {
    return next(
      new ErrorResponse(
        `User with role ${req.user.role} is not authorized to submit a grievance`,
        403,
      ),
    );
  }

  // Handle image upload if file exists
  if (req.file) {
    try {
      const uploadStream = (buffer) => {
        return new Promise((resolve, reject) => {
          const upload_stream = cloudinary.uploader.upload_stream(
            { folder: "grievances" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                return reject(error);
              }
              resolve(result);
            },
          );
          const stream = Readable.from(buffer);
          stream.pipe(upload_stream);
        });
      };

      const result = await uploadStream(req.file.buffer);
      console.log("Cloudinary Upload Result:", result);

      if (result && result.secure_url) {
        req.body.image = result.secure_url;
        console.log("Image uploaded successfully:", result.secure_url);
      }
    } catch (error) {
      console.error("Image upload exception:", error);
      return next(new ErrorResponse("Image upload failed", 500));
    }
  }

  console.log("Creating grievance with body:", req.body);
  const grievance = await Grievance.create(req.body);

  // Notify Admins and Authorities
  req.io
    .to(ROLES.ADMIN)
    .to(ROLES.AUTHORITY)
    .emit("notification", {
      message: `New Grievance Submitted by ${req.user.username}`,
      grievance,
    });

  res.status(201).json({
    success: true,
    data: grievance,
  });
});

// @desc      Get single grievance
// @route     GET /api/v1/grievances/:id
// @access    Private (Student, Admin, Authority)
exports.getGrievance = asyncHandler(async (req, res, next) => {
  const grievance = await Grievance.findById(req.params.id)
    .populate("user", "username email department")
    .populate("assignedTo", "username email");

  if (!grievance) {
    return next(
      new ErrorResponse(
        `No grievance found with the id of ${req.params.id}`,
        404,
      ),
    );
  }

  // Identify if the user is the owner or an admin/authority
  if (
    grievance.user._id.toString() !== req.user.id &&
    req.user.role === ROLES.STUDENT
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this grievance`,
        401,
      ),
    );
  }

  // Masking for Anonymity
  let responseData = grievance.toObject();
  if (responseData.isAnonymous) {
    // If viewer is NOT the owner (e.g. Admin/Authority), hide details
    if (req.user.id !== responseData.user._id.toString()) {
      if (responseData.user) {
        responseData.user.username = "Anonymous Student";
        responseData.user.email = "Hidden";
        responseData.user.department = "Hidden";
      }
    }
  }

  res.status(200).json({
    success: true,
    data: responseData,
  });
});

// @desc      Update grievance status
// @route     PUT /api/v1/grievances/:id
// @access    Private (Admin, Authority)
// @desc      Update grievance status, assign authority, add remarks
// @route     PUT /api/v1/grievances/:id
// @access    Private (Admin, Authority, Student(limited))
exports.updateGrievance = asyncHandler(async (req, res, next) => {
  let grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    return next(
      new ErrorResponse(
        `No grievance found with the id of ${req.params.id}`,
        404,
      ),
    );
  }

  // Check ownership/permissions
  if (
    req.user.role === ROLES.STUDENT &&
    grievance.user.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this grievance`,
        401,
      ),
    );
  }

  // Student Restrictions
  if (req.user.role === ROLES.STUDENT) {
    // Students can only update title, description, category
    // Cannot update status, assignedTo, remarks, timeline
    if (req.body.status || req.body.assignedTo || req.body.remarks) {
      return next(
        new ErrorResponse(
          "Students cannot update status, assignment or remarks",
          403,
        ),
      );
    }
  }

  // Timeline Logic for Admin/Authority
  if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.AUTHORITY) {
    let timelineComment = "";
    let shouldPush = false;
    let pushData = null;

    // Check Status Change
    if (req.body.status && req.body.status !== grievance.status) {
      timelineComment = `Status updated to ${req.body.status}`;
      shouldPush = true;
    }

    // Check Assignment Change
    const currentAssignedTo = grievance.assignedTo
      ? grievance.assignedTo.toString()
      : null;
    if (req.body.assignedTo && req.body.assignedTo !== currentAssignedTo) {
      const assignMsg = `Assigned to user ${req.body.assignedTo}`;
      timelineComment = timelineComment
        ? `${timelineComment}. ${assignMsg}`
        : assignMsg;
      shouldPush = true;
    }

    // Force push if explicit remarks, even without status change
    if (req.body.remarks && !shouldPush) {
      timelineComment = req.body.remarks;
      shouldPush = true;
    } else if (req.body.remarks && shouldPush) {
      timelineComment = `${timelineComment}. Remarks: ${req.body.remarks}`;
    }

    if (shouldPush) {
      // Must use atomic operators for everything since we are using $push
      const updateObject = {
        $set: { ...req.body }, // Update standard fields
        $push: {
          timeline: {
            status: req.body.status || grievance.status,
            updatedBy: req.user.id,
            date: Date.now(),
            comment: timelineComment,
          },
        },
      };

      grievance = await Grievance.findByIdAndUpdate(
        req.params.id,
        updateObject,
        {
          new: true,
          runValidators: true,
        },
      );
    } else {
      // Standard update using req.body (Mongoose handles default $set)
      grievance = await Grievance.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }
  } else {
    // Fallback for Students (or if role check changes) - standard update
    grievance = await Grievance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  // If populating timeline in the response is needed, do another find or just return basic
  // But usually we want to see the updated doc.
  // Note: findByIdAndUpdate with req.body containing $push and other fields might need separate handling
  // if req.body has both '$push' and flattened fields.
  // Mongoose `findByIdAndUpdate` can accept query operators directly.
  // However, req.body might contain 'status': 'Resolved'.
  // Mixing $push and regular keys in update object works fine in Mongoose.

  // Notify the user who submitted the grievance
  if (req.body.status) {
    req.io.to(grievance.user.toString()).emit("notification", {
      message: `Your grievance status has been updated to ${grievance.status}`,
      grievance,
    });
  }

  res.status(200).json({
    success: true,
    data: grievance,
  });
});
