/**
 * Generic sorting function for arrays of objects
 * @param {Array} data - The array to sort
 * @param {string} column - The column/key to sort by
 * @param {boolean} ascending - Whether to sort ascending or descending
 * @param {Object} customComparators - Custom comparison functions for specific columns
 * @returns {Array} - Sorted array
 */
export const sortData = (data, column, ascending, customComparators = {}) => {
  const comparator = customComparators[column];
  if (!comparator) return data;

  return [...data].sort((a, b) => {
    const result = comparator(a, b);
    return ascending ? result : -result;
  });
};

