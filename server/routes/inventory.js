const express = require("express")
const router = express.Router()
const Inventory = require("../models/Inventory")
const { protect, authorize, projectAccess } = require("../middleware/auth")

// @desc    Get all inventory items for a project
// @route   GET /api/inventory/project/:projectId
// @access  Private
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const { category, lowStock, search } = req.query
    const query = { project: req.params.projectId }

    if (category) {
      query.category = category
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    let items = await Inventory.find(query).populate("addedBy", "name").sort("category name")

    // Filter low stock items after query (since it's a virtual)
    if (lowStock === "true") {
      items = items.filter((item) => item.isLowStock)
    }

    res.json({
      success: true,
      count: items.length,
      data: items,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate("project", "name").populate("addedBy", "name email")

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      })
    }

    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private (Contractor)
router.post("/", protect, authorize("contractor"), async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      addedBy: req.user._id,
    }

    const item = await Inventory.create(itemData)

    const populatedItem = await Inventory.findById(item._id).populate("project", "name").populate("addedBy", "name")

    res.status(201).json({
      success: true,
      data: populatedItem,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Contractor)
router.put("/:id", protect, authorize("contractor"), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("addedBy", "name")

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      })
    }

    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Contractor)
router.delete("/:id", protect, authorize("contractor"), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      })
    }

    await item.deleteOne()

    res.json({
      success: true,
      message: "Inventory item deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Update inventory quantity (add/subtract)
// @route   PUT /api/inventory/:id/quantity
// @access  Private (Contractor)
router.put("/:id/quantity", protect, authorize("contractor"), async (req, res) => {
  try {
    const { quantity, operation } = req.body

    const item = await Inventory.findById(req.params.id)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      })
    }

    if (operation === "add") {
      item.quantity += quantity
      item.lastRestocked = new Date()
    } else if (operation === "subtract") {
      if (item.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: "Not enough quantity in stock",
        })
      }
      item.quantity -= quantity
    } else {
      item.quantity = quantity
    }

    await item.save()

    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @desc    Get low stock items across all projects for user
// @route   GET /api/inventory/alerts/low-stock
// @access  Private (Contractor)
router.get("/alerts/low-stock", protect, authorize("contractor"), async (req, res) => {
  try {
    const items = await Inventory.find({}).populate("project", "name")

    const lowStockItems = items.filter((item) => item.isLowStock)

    res.json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
