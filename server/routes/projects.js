const express = require("express")
const router = express.Router()
const Project = require("../models/Project")
const User = require("../models/User")
const Milestone = require("../models/Milestone")
const DailyReport = require("../models/DailyReport")
const { protect, authorize, projectAccess } = require("../middleware/auth")
const { paginate } = require("../utils/helpers")

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query
    const { skip, limit: limitNum } = paginate(page, limit)

    // Build query based on user role
    const query = {}
    const userId = req.user._id

    // Users can only see projects they're involved in
    query.$or = [{ client: userId }, { contractor: userId }, { architect: userId }, { createdBy: userId }]

    if (status) {
      query.status = status
    }

    if (priority) {
      query.priority = priority
    }

    if (search) {
      query.$and = [{ $or: query.$or }, { name: { $regex: search, $options: "i" } }]
      delete query.$or
    }

    const total = await Project.countDocuments(query)
    const projects = await Project.find(query)
      .populate("client", "name email")
      .populate("contractor", "name email company")
      .populate("architect", "name email company")
      .sort("-createdAt")
      .skip(skip)
      .limit(limitNum)

    res.json({
      success: true,
      count: projects.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: Number(page),
      data: projects,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get("/:id", protect, projectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name email phone")
      .populate("contractor", "name email phone company")
      .populate("architect", "name email phone company")
      .populate("createdBy", "name email")

    // Calculate progress based on milestones and daily reports
    const milestones = await Milestone.find({ project: req.params.id })
    const dailyReports = await DailyReport.find({ project: req.params.id })

    let calculatedProgress = 0

    if (milestones.length > 0) {
      // Calculate milestone-based progress (70% weight)
      const approvedMilestones = milestones.filter(
        (m) => m.status === "approved" || m.status === "completed"
      ).length
      const milestoneProgress = (approvedMilestones / milestones.length) * 70

      // Calculate daily report activity (30% weight)
      const totalDays = Math.max(
        1,
        Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
      )
      const reportProgress = Math.min((dailyReports.length / totalDays) * 30, 30)

      calculatedProgress = Math.round(milestoneProgress + reportProgress)
    } else if (dailyReports.length > 0) {
      // If no milestones, use daily reports only
      const totalDays = Math.max(
        1,
        Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
      )
      calculatedProgress = Math.min(Math.round((dailyReports.length / totalDays) * 100), 100)
    }

    // Update project progress if it changed
    if (project.progress !== calculatedProgress) {
      project.progress = calculatedProgress
      await project.save()
    }

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        progressBreakdown: {
          milestones: {
            total: milestones.length,
            approved: milestones.filter((m) => m.status === "approved" || m.status === "completed").length,
            inProgress: milestones.filter((m) => m.status === "in-progress").length,
            pending: milestones.filter((m) => m.status === "pending" || m.status === "awaiting-approval").length,
          },
          dailyReports: {
            total: dailyReports.length,
            thisWeek: dailyReports.filter(
              (r) => new Date(r.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
          },
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Contractor, Architect)
router.post("/", protect, authorize("contractor", "architect"), async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.user._id,
    }

    const project = await Project.create(projectData)

    // Add project to assigned users
    const userIds = [project.client, project.contractor, project.architect].filter(Boolean)
    await User.updateMany({ _id: { $in: userIds } }, { $addToSet: { assignedProjects: project._id } })

    const populatedProject = await Project.findById(project._id)
      .populate("client", "name email")
      .populate("contractor", "name email")
      .populate("architect", "name email")

    res.status(201).json({
      success: true,
      data: populatedProject,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Contractor, Architect)
router.put("/:id", protect, authorize("contractor", "architect"), projectAccess, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("client", "name email")
      .populate("contractor", "name email")
      .populate("architect", "name email")

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Contractor, Architect)
router.delete("/:id", protect, authorize("contractor", "architect"), projectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    // Remove project from assigned users
    const userIds = [project.client, project.contractor, project.architect].filter(Boolean)
    await User.updateMany({ _id: { $in: userIds } }, { $pull: { assignedProjects: project._id } })

    await project.deleteOne()

    res.json({
      success: true,
      message: "Project deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update project budget
// @route   PUT /api/projects/:id/budget
// @access  Private (Contractor, Architect)
router.put("/:id/budget", protect, authorize("contractor", "architect"), projectAccess, async (req, res) => {
  try {
    const { estimated, actual, breakdown } = req.body

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "budget.estimated": estimated,
          "budget.actual": actual,
          "budget.breakdown": breakdown,
        },
      },
      { new: true },
    )

    res.json({
      success: true,
      data: project.budget,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update project progress
// @route   PUT /api/projects/:id/progress
// @access  Private (Contractor)
router.put("/:id/progress", protect, authorize("contractor"), projectAccess, async (req, res) => {
  try {
    const { progress } = req.body

    const project = await Project.findByIdAndUpdate(req.params.id, { progress }, { new: true })

    res.json({
      success: true,
      data: { progress: project.progress },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Calculate and update project progress automatically
// @route   POST /api/projects/:id/calculate-progress
// @access  Private
router.post("/:id/calculate-progress", protect, projectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" })
    }

    const milestones = await Milestone.find({ project: req.params.id })
    const dailyReports = await DailyReport.find({ project: req.params.id })

    let calculatedProgress = 0

    if (milestones.length > 0) {
      // Calculate milestone-based progress (70% weight)
      const approvedMilestones = milestones.filter(
        (m) => m.status === "approved" || m.status === "completed"
      ).length
      const milestoneProgress = (approvedMilestones / milestones.length) * 70

      // Calculate daily report activity (30% weight)
      const totalDays = Math.max(
        1,
        Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
      )
      const reportProgress = Math.min((dailyReports.length / totalDays) * 30, 30)

      calculatedProgress = Math.round(milestoneProgress + reportProgress)
    } else if (dailyReports.length > 0) {
      // If no milestones, use daily reports only
      const totalDays = Math.max(
        1,
        Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
      )
      calculatedProgress = Math.min(Math.round((dailyReports.length / totalDays) * 100), 100)
    }

    project.progress = calculatedProgress
    await project.save()

    res.json({
      success: true,
      data: {
        progress: calculatedProgress,
        breakdown: {
          milestones: {
            total: milestones.length,
            approved: milestones.filter((m) => m.status === "approved" || m.status === "completed").length,
          },
          dailyReports: {
            total: dailyReports.length,
          },
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
