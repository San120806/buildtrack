/**
 * Format currency in Indian Rupees (₹)
 * Supports Indian numbering system (lakhs, crores)
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    useIndianFormat = true,
    showDecimals = false,
    compact = false,
  } = options;

  if (amount === null || amount === undefined) {
    return '₹0';
  }

  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    return '₹0';
  }

  // Compact format for large numbers (₹1.5L, ₹2.5Cr)
  if (compact) {
    if (numAmount >= 10000000) { // 1 crore or more
      return `₹${(numAmount / 10000000).toFixed(2)}Cr`;
    } else if (numAmount >= 100000) { // 1 lakh or more
      return `₹${(numAmount / 100000).toFixed(2)}L`;
    }
  }

  // Use Indian numbering system (lakhs/crores)
  if (useIndianFormat) {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    return formatter.format(numAmount);
  }

  // Standard international format
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  
  return formatter.format(numAmount);
};

/**
 * Format number with Indian numbering system (without currency symbol)
 */
export const formatIndianNumber = (num) => {
  if (num === null || num === undefined) return '0';
  const numValue = Number(num);
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('en-IN').format(numValue);
};

/**
 * Parse currency string back to number
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString;
  if (!currencyString) return 0;
  
  // Remove currency symbol, commas, and whitespace
  const cleaned = currencyString.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};
