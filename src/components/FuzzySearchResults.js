import React from 'react';
import { ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { highlightMatches } from '../utils/fuzzySearch';

const FuzzySearchResults = ({
  searchResults,
  query,
  onProblemClick,
  getLeetCodeUrl,
  getDifficultyColor
}) => {
  if (!query || query.trim().length === 0) {
    return null;
  }

  if (searchResults.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No problems found matching "{query}"</p>
        <p className="text-xs mt-1">Try different keywords or check spelling</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
        Found {searchResults.length} problem{searchResults.length !== 1 ? 's' : ''}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {searchResults.map((result, index) => {
          const { problem, category, score, matchedFields } = result;

          return (
            <div
              key={`${category.id}-${problem.id}`}
              className="p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer group"
              onClick={() => onProblemClick && onProblemClick(category.id, problem.id)}
            >
              <div className="flex items-start gap-2">
                {/* Solved status */}
                <div className="mt-1 flex-shrink-0">
                  {problem.solved ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Problem info */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {problem.number && (
                          <span className="text-xs font-mono text-gray-500 flex-shrink-0">
                            #{matchedFields.number > 0.5 ? (
                              <span dangerouslySetInnerHTML={{
                                __html: highlightMatches(problem.number, query)
                              }} />
                            ) : (
                              problem.number
                            )}
                          </span>
                        )}
                        <h4
                          className={`text-sm font-medium min-w-0 truncate ${problem.solved ? 'text-gray-500 line-through' : 'text-gray-800'
                            } group-hover:text-blue-600`}
                        >
                          {matchedFields.title > 0.5 ? (
                            <span dangerouslySetInnerHTML={{
                              __html: highlightMatches(problem.title, query)
                            }} />
                          ) : (
                            problem.title
                          )}
                        </h4>
                      </div>

                      {/* Difficulty and category */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {matchedFields.difficulty > 0.5 ? (
                            <span dangerouslySetInnerHTML={{
                              __html: highlightMatches(problem.difficulty, query)
                            }} />
                          ) : (
                            problem.difficulty
                          )}
                        </span>
                        <span className="text-xs text-blue-600 font-medium">
                          {matchedFields.categoryName > 0.5 ? (
                            <span dangerouslySetInnerHTML={{
                              __html: highlightMatches(category.name, query)
                            }} />
                          ) : (
                            category.name
                          )}
                        </span>
                      </div>

                      {/* Notes if matched */}
                      {problem.notes && matchedFields.notes > 0.3 && (
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                          <span dangerouslySetInnerHTML={{
                            __html: highlightMatches(problem.notes.substring(0, 100), query)
                          }} />
                          {problem.notes.length > 100 && '...'}
                        </p>
                      )}

                      {/* Match score (for debugging - can be removed) */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-400">
                          Score: {score.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* External link button */}
                    <a
                      href={getLeetCodeUrl(problem.number, problem.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-1 text-gray-400 hover:text-blue-600 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      title="Open in LeetCode"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuzzySearchResults;