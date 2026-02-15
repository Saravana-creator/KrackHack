const mongoose = require("mongoose");

const GrievanceSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a grievance title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  category: {
    type: String,
    enum: [
      "Infrastructure",
      "Academics",
      "Hostel",
      "Food",
      "Other",
      "academic",
      "financial",
      "harassment",
      "infrastructure",
      "other",
    ],
    default: "Other",
  },
  status: {
    type: String,
    enum: [
      "Submitted",
      "Under Review",
      "In Progress",
      "Resolved",
      "Rejected",
      "pending",
      "in-progress",
      "resolved",
      "rejected",
    ],
    default: "Submitted",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent", "low", "medium", "high"],
    default: "Medium",
  },
  location: {
    type: String,
  },
  image: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  remarks: {
    type: String,
  },
  timeline: [
    {
      status: String,
      date: {
        type: Date,
        default: Date.now,
      },
      comment: String,
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Grievance", GrievanceSchema);
