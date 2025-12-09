const express = require("express")
const router = express.Router()
const Milestone = require("../models/Milestone")
const Project = require("../models/Project")
const DailyReport = require("../models/DailyReport")
const { protect, authorize, projectAccess } = require("../middleware/auth")

// @desc    Get all milestones for a project
// @route   GET /api/milestones/project/:projectId
// @access  Private
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const milestones = await Milestone.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("approval.approvedBy", "name")
      .sort("order")

    res.json({
      success: true,
      count: milestones.length,
      data: milestones,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get single milestone
// @route   GET /api/milestones/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("approval.approvedBy", "name email")
      .populate("dependencies", "title status")

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      })
    }

    res.json({
      success: true,
      data: milestone,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Create milestone
// @route   POST /api/milestones
// @access  Private (Contractor, Architect)
router.post("/", protect, authorize("contractor", "architect"), async (req, res) => {
  try {
    const milestoneData = {
      ...req.body,
      createdBy: req.user._id,
    }

    const milestone = await Milestone.create(milestoneData)

    const populatedMilestone = await Milestone.findById(milestone._id)
      .populate("assignedTo", "name email")
      .populate("project", "name")

    res.status(201).json({
      success: true,
      data: populatedMilestone,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (Contractor, Architect)
router.put("/:id", protect, authorize("contractor", "architect"), async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email")

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      })
    }

    res.json({
      success: true,
      data: milestone,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Contractor, Architect)
router.delete("/:id", protect, authorize("contractor", "architect"), async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      })
    }

    await milestone.deleteOne()

    res.json({
      success: true,
      message: "Milestone deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Submit milestone for approval
// @route   PUT /api/milestones/:id/submit
// @access  Private (Contractor)
router.put("/:id/submit", protect, authorize("contractor"), async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      {
        status: "awaiting-approval",
        "approval.status": "pending",
      },
      { new: true },
    )

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      })
    }

    res.json({
      success: true,
      data: milestone,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Approve/Reject milestone
// @route   PUT /api/milestones/:id/approve
// @access  Private (Architect)
router.put("/:id/approve", protect, authorize("architect"), async (req, res) => {
  try {
    const { status, comments } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      })
    }

    const updateData = {
      "approval.status": status,
      "approval.approvedBy": req.user._id,
      "approval.approvedAt": new Date(),
      "approval.comments": comments,
      status: status === "approved" ? "completed" : "rejected",
    }

    if (status === "approved") {
      updateData.completedDate = new Date()
      updateData.progress = 100
    }

    const milestone = await Milestone.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("approval.approvedBy", "name email")
      .populate("assignedTo", "name email")

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      })
    }

    // Recalculate project progress after milestone approval
    if (milestone.project) {
      const project = await Project.findById(milestone.project)
      if (project) {
        const milestones = await Milestone.find({ project: milestone.project })
        const dailyReports = await DailyReport.find({ project: milestone.project })

        let calculatedProgress = 0

        if (milestones.length > 0) {
          const approvedMilestones = milestones.filter(
            (m) => m.status === "approved" || m.status === "completed"
          ).length
          const milestoneProgress = (approvedMilestones / milestones.length) * 70

          const totalDays = Math.max(
            1,
            Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
          )
          const reportProgress = Math.min((dailyReports.length / totalDays) * 30, 30)

          calculatedProgress = Math.round(milestoneProgress + reportProgress)
        }

        project.progress = calculatedProgress
        await project.save()
      }
    }

    res.json({
      success: true,
      data: milestone,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get milestones awaiting approval
// @route   GET /api/milestones/pending-approval
// @access  Private (Architect)
router.get("/status/pending-approval", protect, authorize("architect"), async (req, res) => {
  try {
    const milestones = await Milestone.find({
      status: "awaiting-approval",
    })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .sort("-updatedAt")

    res.json({
      success: true,
      count: milestones.length,
      data: milestones,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
