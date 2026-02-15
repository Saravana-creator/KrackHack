const express = require("express");
const {
  getGrievances,
  getGrievance,
  createGrievance,
  updateGrievance,
  getGrievanceStats,
  updateGrievanceStatus,
} = require("../controllers/grievanceController");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const ROLES = require('../constants/roles');

const multer = require("multer");

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route("/stats")
  .get(protect, authorize(ROLES.AUTHORITY, ROLES.ADMIN), getGrievanceStats);

router
  .route("/")
  .get(protect, authorize(ROLES.STUDENT, ROLES.ADMIN, ROLES.AUTHORITY), getGrievances)
  .post(protect, authorize(ROLES.STUDENT), upload.single("image"), createGrievance);

router
  .route("/:id")
  .get(protect, getGrievance)
  .put(protect, authorize(ROLES.STUDENT, ROLES.ADMIN, ROLES.AUTHORITY), updateGrievance);

router
  .route("/:id/status")
  .patch(protect, authorize(ROLES.AUTHORITY, ROLES.ADMIN), updateGrievanceStatus);

module.exports = router;
