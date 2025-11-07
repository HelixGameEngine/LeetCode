import { DIFFICULTY_COLORS } from './constants';

/**
 * Generates a LeetCode URL for a given problem
 * @param {string} problemNumber - The problem number
 * @param {string} problemTitle - The problem title
 * @returns {string} The LeetCode URL
 */
export const getLeetCodeUrl = (problemNumber, problemTitle) =>
  problemNumber
    ? `https://leetcode.com/problems/${problemTitle.toLowerCase().replace(/\s+/g, '-')}/`
    : `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problemTitle)}`;

/**
 * Returns the CSS classes for difficulty color styling
 * @param {string} difficulty - The difficulty level (Easy, Medium, Hard)
 * @returns {string} CSS classes for styling
 */
export const getDifficultyColor = (difficulty) => {
  return DIFFICULTY_COLORS[difficulty] || 'text-gray-600 bg-gray-50';
};

/**
 * Checks if the current device is mobile (screen width < 768px)
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  return window.innerWidth < 768; // Tailwind's md breakpoint
};

/**
 * Creates an export object with data and metadata
 * @param {Array} categories - Categories array
 * @param {Array} collapsedCategories - Collapsed categories array
 * @returns {Object} Export object
 */
export const createExportData = (categories, collapsedCategories) => ({
  categories,
  collapsedCategories,
  exportDate: new Date().toISOString(),
  version: '1.1'
});

/**
 * Downloads a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename for download
 */
export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};