import React, { useState, useEffect } from 'react';

export default function NavigationMenu({ categories, onCategoryClick, isMobile }) {
  const [isMenuOpen, setIsMenuOpen] = useState(!isMobile);

  useEffect(() => {
    setIsMenuOpen(!isMobile);
  }, [isMobile]);

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }
    // Close menu on mobile after selection
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const scrollToAddCategory = () => {
    const element = document.querySelector('.add-category-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const totalProblems = categories.reduce((total, cat) => total + cat.problems.length, 0);
  const solvedProblems = categories.reduce((total, cat) =>
    total + cat.problems.filter(p => p.solved).length, 0
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 ${isMenuOpen ? 'left-80' : 'left-4'
            }`}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navigation Menu */}
      <div className={`
        ${isMobile ? 'fixed' : 'sticky'} 
        ${isMobile ? 'left-0 top-0 h-full' : 'top-4'} 
        ${isMobile && !isMenuOpen ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'w-80' : 'w-80'}
        ${isMobile ? 'z-40' : 'z-10'}
        bg-white rounded-lg shadow-lg p-4 transition-transform duration-300 ease-in-out
        ${!isMobile ? 'max-h-screen overflow-y-auto' : 'overflow-y-auto'}
      `}>

        {/* Header */}
        <div className="mb-6">

          {/* Progress Summary */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600 mb-1">Progress</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                {solvedProblems}/{totalProblems}
              </span>
              <span className="text-sm text-gray-500">
                {totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {/* Top Navigation */}
          <button
            onClick={scrollToTop}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Top
          </button>

          {/* Categories */}
          {categories.map((category) => {
            const categoryProblems = category.problems?.length || 0;
            const categorySolved = category.problems?.filter(p => p.solved)?.length || 0;
            const completionRate = categoryProblems > 0 ? (categorySolved / categoryProblems) * 100 : 0;

            return (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors duration-200 border-l-4 border-transparent hover:border-blue-500 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mr-2 group-hover:bg-blue-600" />
                    <span className="font-medium text-gray-800 group-hover:text-blue-800 truncate">
                      {category.name}
                    </span>
                  </div>
                  <span className="flex-shrink-0 ml-2 text-xs text-gray-500">
                    {categorySolved}/{categoryProblems}
                  </span>
                </div>

                {/* Progress bar for category */}
                {categoryProblems > 0 && (
                  <div className="mt-1 ml-4">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}

          {/* Add Category Link */}
          <button
            onClick={scrollToAddCategory}
            className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Category
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {categories.length} categories
          </div>
        </div>
      </div>
    </>
  );
}