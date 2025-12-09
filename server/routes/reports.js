const express = require("express")
const router = express.Router()
const DailyReport = require("../models/DailyReport")
const Project = require("../models/Project")
const Milestone = require("../models/Milestone")
const { protect, authorize, projectAccess } = require("../middleware/auth")
const { paginate } = require("../utils/helpers")

// @desc    Get all reports for a project
// @route   GET /api/reports/project/:projectId
// @access  Private
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query
    const { skip, limit: limitNum } = paginate(page, limit)

    const query = { project: req.params.projectId }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const total = await DailyReport.countDocuments(query)
    const reports = await DailyReport.find(query)
      .populate("submittedBy", "name email")
      .populate("photos", "filename path caption")
      .sort("-date")
      .skip(skip)
      .limit(limitNum)

    res.json({
      success: true,
      count: reports.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: Number(page),
      data: reports,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id)
      .populate("project", "name")
      .populate("submittedBy", "name email")
      .populate("photos", "filename path caption category")
      .populate("materialsUsed.material", "name unit")

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      })
    }

    res.json({
      success: true,
      data: report,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Create daily report
// @route   POST /api/reports
// @access  Private (Contractor)
router.post("/", protect, authorize("contractor"), async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      submittedBy: req.user._id,
    }

    // Check if report already exists for this date and project
    const existingReport = await DailyReport.findOne({
      project: reportData.project,
      date: {
        $gte: new Date(new Date(reportData.date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(reportData.date).setHours(23, 59, 59, 999)),
      },
    })

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "A report already exists for this date",
      })
    }

    const report = await DailyReport.create(reportData)

    const populatedReport = await DailyReport.findById(report._id)
      .populate("project", "name")
      .populate("submittedBy", "name email")

    // Recalculate project progress after adding daily report
    if (reportData.project) {
      const project = await Project.findById(reportData.project)
      if (project) {
        const milestones = await Milestone.find({ project: reportData.project })
        const dailyReports = await DailyReport.find({ project: reportData.project })

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
        } else if (dailyReports.length > 0) {
          const totalDays = Math.max(
            1,
            Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
          )
          calculatedProgress = Math.min(Math.round((dailyReports.length / totalDays) * 100), 100)
        }

        project.progress = calculatedProgress
        await project.save()
      }
    }

    res.status(201).json({
      success: true,
      data: populatedReport,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update daily report
// @route   PUT /api/reports/:id
// @access  Private (Contractor)
router.put("/:id", protect, authorize("contractor"), async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      })
    }

    // Only allow the submitter to update
    if (report.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reports",
      })
    }

    const updatedReport = await DailyReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("submittedBy", "name email")
      .populate("photos", "filename path caption")

    res.json({
      success: true,
      data: updatedReport,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Delete daily report
// @route   DELETE /api/reports/:id
// @access  Private (Contractor)
router.delete("/:id", protect, authorize("contractor"), async (req, res) => {
  try {
    const report = await DailyReport.findById(req.params.id)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      })
    }

    // Only allow the submitter to delete
    if (report.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reports",
      })
    }

    await report.deleteOne()

    res.json({
      success: true,
      message: "Report deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get reports submitted by current user
// @route   GET /api/reports/my-reports
// @access  Private (Contractor)
router.get("/user/my-reports", protect, authorize("contractor"), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const { skip, limit: limitNum } = paginate(page, limit)

    const total = await DailyReport.countDocuments({ submittedBy: req.user._id })
    const reports = await DailyReport.find({ submittedBy: req.user._id })
      .populate("project", "name")
      .sort("-date")
      .skip(skip)
      .limit(limitNum)

    res.json({
      success: true,
      count: reports.length,
      total,
      pages: Math.ceil(total / limitNum),
      data: reports,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
