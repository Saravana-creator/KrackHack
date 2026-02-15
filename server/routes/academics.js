const express = require("express");
const {
  enrollCourse,
  getMyCourses,
  logAttendance,
  getAttendance,
  getEvents,
  createEvent,
} = require("../controllers/academicController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/enroll/:courseId", authorize("student"), enrollCourse);
router.get("/my-courses", authorize("student"), getMyCourses);

router
  .route("/attendance")
  .post(authorize("student"), logAttendance)
  .get(authorize("student"), getAttendance);

router
  .route("/events")
  .get(getEvents)
  .post(authorize("admin", "authority", "faculty"), createEvent);

module.exports = router;
