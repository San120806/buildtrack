const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "buildtrack_secret_key", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, company } = req.body

    // Check if user exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "client",
      phone,
      company,
    })

    if (user) {
      const token = generateToken(user._id)

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company: user.company,
          token,
        },
      })
    }
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      })
    }

    // Check password
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company,
        avatar: user.avatar,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    })
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("assignedProjects", "name status")

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, company, avatar } = req.body

    const user = await User.findById(req.user._id)

    if (user) {
      user.name = name || user.name
      user.email = email || user.email
      user.phone = phone || user.phone
      user.company = company || user.company
      user.avatar = avatar || user.avatar

      const updatedUser = await user.save()

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          company: updatedUser.company,
          avatar: updatedUser.avatar,
        },
      })
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    })
  }
}

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select("+password")

    // Check current password
    const isMatch = await user.matchPassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    })
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
}
