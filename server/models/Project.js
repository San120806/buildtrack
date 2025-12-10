const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    architect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["planning", "in-progress", "on-hold", "completed", "cancelled"],
      default: "planning",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    actualEndDate: {
      type: Date,
    },
    location: {
      address: String,
      city: String,
      state: String,
      pinCode: String,
    },
    budget: {
      estimated: {
        type: Number,
        default: 0,
      },
      actual: {
        type: Number,
        default: 0,
      },
      breakdown: [
        {
          category: String,
          estimated: Number,
          actual: Number,
        },
      ],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Project", projectSchema)
