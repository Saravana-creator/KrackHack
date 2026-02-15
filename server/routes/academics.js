const express = require("express");
const {
  enrollCourse,
  getMyCourses,
  logAttendance,
  getAttendance,
  getEvents,
  createEvent,
  getFacultyAcademics,
} = require("../controllers/academicController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const ROLES = require('../constants/roles');



router.get(
  '/faculty',
  protect,
  authorize(ROLES.FACULTY),
  getFacultyAcademics
);

router.use(protect);

router.post("/enroll/:courseId", authorize(ROLES.STUDENT), enrollCourse);
router.get("/my-courses", authorize(ROLES.STUDENT), getMyCourses);

router
  .route("/attendance")
  .post(authorize(ROLES.STUDENT), logAttendance)
  .get(authorize(ROLES.STUDENT), getAttendance);

router
  .route("/events")
  .get(getEvents)
  .post(authorize(ROLES.ADMIN, ROLES.AUTHORITY, ROLES.FACULTY), createEvent);

module.exports = router;
