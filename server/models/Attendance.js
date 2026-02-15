const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: false, // Can be general attendance or course-specific
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Excused"],
    required: true,
    default: "Present",
  },
  notes: {
    type: String,
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
