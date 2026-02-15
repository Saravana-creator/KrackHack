const express = require("express");
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
} = require("../controllers/opportunityController");

const {
  applyForOpportunity,
  getOpportunityApplications,
} = require("../controllers/applicationController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const ROLES = require("../constants/roles");

router.use(protect); // All routes are protected

router
  .route("/")
  .get(authorize(ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN), getOpportunities)
  .post(
    authorize(ROLES.FACULTY, ROLES.ADMIN),
    createOpportunity,
  );

router.route("/mine").get(authorize(ROLES.FACULTY), getMyOpportunities);

router
  .route("/:id")
  .get(authorize(ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN), getOpportunity)
  .put(
    authorize(ROLES.FACULTY, ROLES.ADMIN),
    updateOpportunity,
  )
  .delete(
    authorize(ROLES.FACULTY, ROLES.ADMIN),
    deleteOpportunity,
  );

router.route("/:id/apply").post(authorize(ROLES.STUDENT), applyForOpportunity);

router
  .route("/:id/applications")
  .get(
    authorize(ROLES.FACULTY, ROLES.ADMIN),
    getOpportunityApplications,
  );

module.exports = router;
