const express = require("express");
const {
  getResources,
  getResource,
  addResource,
} = require("../controllers/resourceController");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const ROLES = require("../constants/roles");

const multer = require("multer");

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route("/")
  .get(getResources)
  .post(
    protect,
    authorize(ROLES.FACULTY, ROLES.ADMIN, ROLES.AUTHORITY),
    upload.single("file"),
    addResource,
  );

router.route("/:id").get(getResource);

module.exports = router;
