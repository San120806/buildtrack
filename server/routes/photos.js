const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Photo = require("../models/Photo")
const { protect, authorize } = require("../middleware/auth")
const { generateRandomString } = require("../utils/helpers")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/photos")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${generateRandomString(16)}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// @desc    Get all photos for a project
// @route   GET /api/photos/project/:projectId
// @access  Private
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query
    const query = { project: req.params.projectId }

    if (category) {
      query.category = category
    }

    if (startDate || endDate) {
      query.takenAt = {}
      if (startDate) query.takenAt.$gte = new Date(startDate)
      if (endDate) query.takenAt.$lte = new Date(endDate)
    }

    const photos = await Photo.find(query)
      .populate("uploadedBy", "name")
      .populate("milestone", "title")
      .sort("-takenAt")

    res.json({
      success: true,
      count: photos.length,
      data: photos,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get single photo
// @route   GET /api/photos/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate("project", "name")
      .populate("uploadedBy", "name email")
      .populate("milestone", "title")

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      })
    }

    res.json({
      success: true,
      data: photo,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Upload photo(s)
// @route   POST /api/photos
// @access  Private (Contractor)
router.post("/", protect, authorize("contractor"), upload.array("photos", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one photo",
      })
    }

    const { project, category, caption, milestone, dailyReport, takenAt } = req.body

    const photos = await Promise.all(
      req.files.map(async (file) => {
        const photoData = {
          project,
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/photos/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
          category: category || "general",
          caption,
          milestone,
          dailyReport,
          takenAt: takenAt || new Date(),
          uploadedBy: req.user._id,
        }

        return await Photo.create(photoData)
      }),
    )

    res.status(201).json({
      success: true,
      count: photos.length,
      data: photos,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update photo
// @route   PUT /api/photos/:id
// @access  Private (Contractor)
router.put("/:id", protect, authorize("contractor"), async (req, res) => {
  try {
    const { caption, category, tags } = req.body

    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { caption, category, tags },
      { new: true, runValidators: true },
    ).populate("uploadedBy", "name")

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      })
    }

    res.json({
      success: true,
      data: photo,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Delete photo
// @route   DELETE /api/photos/:id
// @access  Private (Contractor)
router.delete("/:id", protect, authorize("contractor"), async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      })
    }

    // Delete file from disk
    const filePath = path.join(__dirname, "..", photo.path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await photo.deleteOne()

    res.json({
      success: true,
      message: "Photo deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
