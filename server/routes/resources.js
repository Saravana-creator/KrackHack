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

// Configure multer to use disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = file.originalname.split('.').pop();
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
  }
});
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
