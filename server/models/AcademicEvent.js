const mongoose = require("mongoose");

const AcademicEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add event title"],
    trim: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["Exam", "Deadline", "Holiday", "Lecture", "Other"],
    default: "Other",
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: false, // Can be null for general events
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AcademicEvent", AcademicEventSchema);
