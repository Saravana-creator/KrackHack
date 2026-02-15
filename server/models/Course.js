const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a course title"],
    trim: true,
  },
  courseCode: {
    type: String,
    required: [true, "Please add a course code (e.g., CS101)"],
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  credits: {
    type: Number,
    required: [true, "Please add course credits"],
    default: 3,
  },
  semester: {
    type: String,
    required: [true, "Please add a semester (e.g. Fall 2024)"],
  },
  faculty: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
