const express = require("express");
const {
  getGrievances,
  getGrievance,
  createGrievance,
  updateGrievance,
} = require("../controllers/grievanceController");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

const multer = require("multer");

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route("/")
  .get(protect, authorize("student", "admin", "authority"), getGrievances)
  .post(protect, authorize("student"), upload.single("image"), createGrievance);

router
  .route("/:id")
  .get(protect, getGrievance)
  .put(protect, authorize("student", "admin", "authority"), updateGrievance);

module.exports = router;
