const express = require("express")
const router = express.Router()
const Project = require("../models/Project")
const Milestone = require("../models/Milestone")
const DailyReport = require("../models/DailyReport")
const Inventory = require("../models/Inventory")
const Photo = require("../models/Photo")
const { protect } = require("../middleware/auth")

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id
    const userRole = req.user.role

    // Get projects the user is involved in
    const projectQuery = {
      $or: [{ client: userId }, { contractor: userId }, { architect: userId }, { createdBy: userId }],
    }

    const projects = await Project.find(projectQuery)
    const projectIds = projects.map((p) => p._id)

    // Project stats
    const totalProjects = projects.length
    const activeProjects = projects.filter((p) => p.status === "in-progress").length
    const completedProjects = projects.filter((p) => p.status === "completed").length

    // Budget stats
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget?.estimated || 0), 0)
    const totalSpent = projects.reduce((sum, p) => sum + (p.budget?.actual || 0), 0)

    // Milestone stats
    const milestones = await Milestone.find({ project: { $in: projectIds } })
    const pendingMilestones = milestones.filter((m) => m.status === "pending" || m.status === "in-progress").length
    const awaitingApproval = milestones.filter((m) => m.status === "awaiting-approval").length

    // Recent activity
    const recentReports = await DailyReport.find({ project: { $in: projectIds } })
      .sort("-date")
      .limit(5)
      .populate("project", "name")
      .populate("submittedBy", "name")

    // Low stock items
    const inventoryItems = await Inventory.find({ project: { $in: projectIds } })
    const lowStockCount = inventoryItems.filter((item) => item.isLowStock).length

    // Photo count
    const photoCount = await Photo.countDocuments({ project: { $in: projectIds } })

    // Role-specific stats
    let roleStats = {}

    if (userRole === "contractor") {
      const myReports = await DailyReport.countDocuments({ submittedBy: userId })
      roleStats = {
        myReports,
        pendingMilestones,
        lowStockAlerts: lowStockCount,
      }
    } else if (userRole === "architect") {
      roleStats = {
        awaitingApproval,
        approvedThisMonth: milestones.filter(
          (m) =>
            m.approval?.status === "approved" &&
            m.approval?.approvedAt &&
            new Date(m.approval.approvedAt).getMonth() === new Date().getMonth(),
        ).length,
      }
    }

    res.json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
        },
        budget: {
          total: totalBudget,
          spent: totalSpent,
          remaining: totalBudget - totalSpent,
          percentUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        },
        milestones: {
          pending: pendingMilestones,
          awaitingApproval,
        },
        inventory: {
          lowStockAlerts: lowStockCount,
        },
        photos: photoCount,
        recentActivity: recentReports,
        roleStats,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get budget breakdown for charts
// @route   GET /api/dashboard/budget-chart
// @access  Private
router.get("/budget-chart", protect, async (req, res) => {
  try {
    const userId = req.user._id

    const projectQuery = {
      $or: [{ client: userId }, { contractor: userId }, { architect: userId }, { createdBy: userId }],
    }

    const projects = await Project.find(projectQuery).select("name budget")

    const chartData = projects.map((project) => ({
      name: project.name,
      estimated: project.budget?.estimated || 0,
      actual: project.budget?.actual || 0,
      variance: (project.budget?.estimated || 0) - (project.budget?.actual || 0),
    }))

    res.json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get project timeline for Gantt chart
// @route   GET /api/dashboard/timeline/:projectId
// @access  Private
router.get("/timeline/:projectId", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    const milestones = await Milestone.find({ project: req.params.projectId })
      .populate("assignedTo", "name")
      .sort("startDate")

    const timelineData = {
      project: {
        id: project._id,
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: project.progress,
      },
      milestones: milestones.map((m) => ({
        id: m._id,
        title: m.title,
        startDate: m.startDate,
        dueDate: m.dueDate,
        completedDate: m.completedDate,
        status: m.status,
        progress: m.progress,
        assignedTo: m.assignedTo?.name,
        dependencies: m.dependencies,
      })),
    }

    res.json({
      success: true,
      data: timelineData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
