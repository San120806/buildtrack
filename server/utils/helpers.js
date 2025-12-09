// Generate random string for file names
const generateRandomString = (length = 16) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Calculate percentage
const calculatePercentage = (part, total) => {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit
  return { skip, limit: Number.parseInt(limit) }
}

module.exports = {
  generateRandomString,
  formatCurrency,
  calculatePercentage,
  formatDate,
  paginate,
}
