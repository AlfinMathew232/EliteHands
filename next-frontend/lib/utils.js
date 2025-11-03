/**
 * Combines multiple class names into a single string
 * @param {...string} classes - Class names to combine
 * @returns {string} - Combined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a price value to a currency string
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} - Formatted price string
 */
export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} - Truncated string
 */
export function truncateString(str, length = 100) {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Adds a delay using a promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random ID
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}