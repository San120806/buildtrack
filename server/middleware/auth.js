const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "buildtrack_secret_key")

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User account is deactivated",
        })
      }

      next()
    } catch (error) {
      console.error("Auth middleware error:", error)
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    })
  }
}

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      })
    }
    next()
  }
}

// Check if user has access to project
const projectAccess = async (req, res, next) => {
  try {
    const Project = require("../models/Project")
    const projectId = req.params.projectId || req.body.project || req.params.id

    if (!projectId) {
      return next()
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Check if user has access to this project
    const userId = req.user._id.toString()
    const hasAccess =
      project.client?.toString() === userId ||
      project.contractor?.toString() === userId ||
      project.architect?.toString() === userId ||
      project.createdBy?.toString() === userId

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this project",
      })
    }

    req.project = project
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = { protect, authorize, projectAccess }
