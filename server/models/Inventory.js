const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Material name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["concrete", "steel", "wood", "electrical", "plumbing", "finishing", "tools", "safety", "other"],
      default: "other",
    },
    description: String,
    unit: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    minQuantity: {
      type: Number,
      default: 0,
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    supplier: {
      name: String,
      contact: String,
      email: String,
    },
    location: {
      type: String,
      trim: true,
    },
    lastRestocked: Date,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for total value
inventorySchema.virtual("totalValue").get(function () {
  return this.quantity * this.unitCost
})

// Virtual for low stock alert
inventorySchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.minQuantity
})

inventorySchema.set("toJSON", { virtuals: true })
inventorySchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Inventory", inventorySchema)
