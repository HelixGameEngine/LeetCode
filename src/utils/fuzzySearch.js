/**
 * Simple fuzzy search implementation for LeetCode problems
 */

/**
 * Calculate fuzzy match score between query and text
 * @param {string} query - Search query
 * @param {string} text - Text to search in
 * @returns {number} Score between 0-1 (1 = perfect match, 0 = no match)
 */
export const calculateFuzzyScore = (query, text) => {
  if (!query || !text) return 0;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return 1;
  }

  // Calculate character-by-character fuzzy match
  let queryIndex = 0;
  let textIndex = 0;
  let matches = 0;

  while (queryIndex < queryLower.length && textIndex < textLower.length) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      matches++;
      queryIndex++;
    }
    textIndex++;
  }

  // Score based on matched characters vs query length
  const matchRatio = matches / queryLower.length;

  // Bonus for consecutive matches (more weight for exact subsequences)
  let consecutiveBonus = 0;
  for (let i = 0; i < queryLower.length - 1; i++) {
    const char1 = queryLower[i];
    const char2 = queryLower[i + 1];
    const pos1 = textLower.indexOf(char1);
    const pos2 = textLower.indexOf(char2, pos1 + 1);

    if (pos1 !== -1 && pos2 !== -1 && pos2 === pos1 + 1) {
      consecutiveBonus += 0.1;
    }
  }

  return Math.min(matchRatio + consecutiveBonus, 1);
};

/**
 * Search for problems across all categories using fuzzy matching
 * @param {Array} categories - Array of categories with problems
 * @param {string} query - Search query
 * @param {number} threshold - Minimum score threshold (0-1)
 * @returns {Array} Array of matching problems with metadata
 */
export const fuzzySearchProblems = (categories, query, threshold = 0.3) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const results = [];
  const queryTrimmed = query.trim();

  categories.forEach(category => {
    category.problems.forEach(problem => {
      // Search in multiple fields
      const titleScore = calculateFuzzyScore(queryTrimmed, problem.title);
      const numberScore = problem.number
        ? calculateFuzzyScore(queryTrimmed, problem.number.toString())
        : 0;
      const notesScore = problem.notes
        ? calculateFuzzyScore(queryTrimmed, problem.notes)
        : 0;
      const difficultyScore = calculateFuzzyScore(queryTrimmed, problem.difficulty);
      const categoryScore = calculateFuzzyScore(queryTrimmed, category.name);

      // Calculate weighted overall score
      const overallScore = Math.max(
        titleScore * 2,        // Title gets highest weight
        numberScore * 1.5,     // Problem number is important
        notesScore * 1,        // Notes get medium weight
        difficultyScore * 0.5, // Difficulty gets lower weight
        categoryScore * 0.8    // Category name gets medium weight
      );

      if (overallScore >= threshold) {
        results.push({
          problem,
          category,
          score: overallScore,
          matchedFields: {
            title: titleScore,
            number: numberScore,
            notes: notesScore,
            difficulty: difficultyScore,
            categoryName: categoryScore
          }
        });
      }
    });
  });

  // Sort by score (highest first), then by title
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.problem.title.localeCompare(b.problem.title);
  });
};

/**
 * Highlight matching characters in text
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {string} HTML string with highlighted matches
 */
export const highlightMatches = (text, query) => {
  if (!query || !text) return text;

  // Simple highlighting for exact substring matches
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 px-1 py-0 rounded">$1</mark>');
};