const mongoose = require("mongoose")

const dailyReportSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    weather: {
      condition: {
        type: String,
        enum: ["sunny", "cloudy", "rainy", "stormy", "snowy", "windy"],
        default: "sunny",
      },
      temperature: Number,
      notes: String,
    },
    workSummary: {
      type: String,
      required: [true, "Work summary is required"],
    },
    workersOnSite: {
      type: Number,
      default: 0,
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    equipment: [
      {
        name: String,
        hoursUsed: Number,
      },
    ],
    materialsUsed: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
        },
        quantity: Number,
        unit: String,
      },
    ],
    issues: [
      {
        description: String,
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "low",
        },
        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    safetyIncidents: [
      {
        description: String,
        severity: String,
        actionTaken: String,
      },
    ],
    notes: String,
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("DailyReport", dailyReportSchema)
