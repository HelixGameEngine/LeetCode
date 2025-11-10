import { useState, useCallback, useMemo } from 'react';
import { fuzzySearchProblems } from '../utils/fuzzySearch';

/**
 * Custom hook for managing fuzzy search functionality
 * @param {Array} categories - Array of categories with problems
 * @returns {Object} Search state and handlers
 */
export const useFuzzySearch = (categories) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Memoize search results to avoid recalculating on every render
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return [];
    }

    return fuzzySearchProblems(categories, searchQuery, 0.2); // Lower threshold for more results
  }, [categories, searchQuery]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setIsSearchActive(query.trim().length > 0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchActive(false);
  }, []);

  const scrollToProblem = useCallback((categoryId, problemId) => {
    // First scroll to category
    const categoryElement = document.getElementById(`category-${categoryId}`);
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // After a short delay, try to scroll to the specific problem
      setTimeout(() => {
        const problemElement = categoryElement.querySelector(`[data-problem-id="${problemId}"]`);
        if (problemElement) {
          problemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Highlight the problem briefly
          problemElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-75');
          setTimeout(() => {
            problemElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-75');
          }, 2000);
        }
      }, 500);
    }

    // Clear search after navigation
    clearSearch();
  }, [clearSearch]);

  return {
    searchQuery,
    searchResults,
    isSearchActive,
    handleSearchChange,
    clearSearch,
    scrollToProblem
  };
};