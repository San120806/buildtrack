const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")
require("dotenv").config()

const connectDB = require("./config/db")

// Initialize express
const app = express()

// Connect to database
connectDB()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes (to be added)
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/projects", require("./routes/projects"))
app.use("/api/milestones", require("./routes/milestones"))
app.use("/api/reports", require("./routes/reports"))
app.use("/api/inventory", require("./routes/inventory"))
app.use("/api/photos", require("./routes/photos"))
app.use("/api/dashboard", require("./routes/dashboard"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

const PORT = process.env.PORT || 5003

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
