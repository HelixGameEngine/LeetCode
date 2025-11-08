import React, { useState, useEffect } from 'react';
import { Shuffle, ExternalLink, CheckCircle, Circle, RefreshCw } from 'lucide-react';

const RandomProblemCard = ({ categories, getLeetCodeUrl, getDifficultyColor }) => {
  const [randomProblem, setRandomProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get all problems from all categories
  const getAllProblems = () => {
    const allProblems = [];
    categories.forEach(category => {
      category.problems.forEach(problem => {
        allProblems.push({
          ...problem,
          categoryName: category.name,
          categoryId: category.id
        });
      });
    });
    return allProblems;
  };

  // Pick a random problem
  const pickRandomProblem = () => {
    const allProblems = getAllProblems();
    if (allProblems.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * allProblems.length);
    return allProblems[randomIndex];
  };

  // Initialize with a random problem on component mount
  useEffect(() => {
    const problem = pickRandomProblem();
    setRandomProblem(problem);
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle refresh button click
  const handleRefresh = () => {
    setIsLoading(true);

    // Add a small delay for visual feedback
    setTimeout(() => {
      const problem = pickRandomProblem();
      setRandomProblem(problem);
      setIsLoading(false);
    }, 300);
  };

  // If there are no problems, show a placeholder
  if (!randomProblem) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 md:mb-6 border-2 border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shuffle className="text-blue-600" size={20} />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Random Problem</h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={true}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>No problems available yet.</p>
          <p className="text-sm mt-2">Add some problems to your categories to see a random one here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 md:mb-6 border-2 border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shuffle className="text-blue-600" size={20} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Random Problem</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300'
            }`}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0">
            {randomProblem.solved ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <Circle size={20} className="text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wide">
              From: {randomProblem.categoryName}
            </div>

            <a
              href={getLeetCodeUrl(randomProblem.number, randomProblem.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="block group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                {randomProblem.number && (
                  <span className="text-sm font-mono text-gray-500 flex-shrink-0">
                    #{randomProblem.number}
                  </span>
                )}
                <h3 className={`text-base md:text-lg font-semibold min-w-0 ${randomProblem.solved ? 'text-gray-500 line-through' : 'text-gray-800'
                  } group-hover:text-blue-600 transition-colors break-words`}>
                  {randomProblem.title}
                </h3>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>

              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(randomProblem.difficulty)}`}>
                  {randomProblem.difficulty}
                </span>
              </div>
            </a>

            {randomProblem.notes && (
              <p className="text-sm text-gray-600 mb-2 break-words">{randomProblem.notes}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-400">
              <p className="flex-shrink-0">Added: {new Date(randomProblem.solvedAt).toLocaleDateString()}</p>
              {(randomProblem.solvedTimes || 0) > 0 && (
                <p className="text-green-600 font-medium flex-shrink-0">
                  Solved {randomProblem.solvedTimes} time{randomProblem.solvedTimes !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomProblemCard;