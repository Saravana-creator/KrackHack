const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: true,
  },
  semester: {
    type: String,
    required: [true, "Please specify semester"],
    default: "Fall 2024",
  },
  status: {
    type: String,
    enum: ["Enrolled", "Completed", "Dropped"],
    default: "Enrolled",
  },
  grade: {
    type: String,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate enrollment
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
