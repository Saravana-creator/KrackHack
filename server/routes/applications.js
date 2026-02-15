const express = require("express");
const {
  updateApplicationStatus,
  getMyApplications,
} = require("../controllers/applicationController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const ROLES = require("../constants/roles");

router.route("/my").get(protect, authorize(ROLES.STUDENT), getMyApplications);

router
  .route("/:id")
  .put(
    protect,
    authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY),
    updateApplicationStatus,
  );

module.exports = router;
