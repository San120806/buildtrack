const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { protect, authorize } = require("../middleware/auth")

// @desc    Get all users (for assigning to projects)
// @route   GET /api/users
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { role, search } = req.query
    const query = { isActive: true }

    if (role) {
      query.role = role
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(query).select("-password").sort("name")

    res.json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("assignedProjects", "name status")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private
router.get("/role/:role", protect, async (req, res) => {
  try {
    const users = await User.find({
      role: req.params.role,
      isActive: true,
    }).select("name email company")

    res.json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
