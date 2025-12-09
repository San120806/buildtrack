const mongoose = require("mongoose")

const photoSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimetype: String,
    size: Number,
    caption: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["progress", "issue", "milestone", "safety", "general"],
      default: "general",
    },
    tags: [String],
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
    },
    dailyReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyReport",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Photo", photoSchema)
