import React from 'react';
import { useScrollToTopBottom } from '../hooks/useScrollToTopBottom';

export default function ScrollButton() {
  const { showButton, isNearTop, scrollToTop, scrollToBottom } = useScrollToTopBottom();

  if (!showButton) return null;

  const handleClick = () => {
    if (isNearTop) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      aria-label={isNearTop ? 'Scroll to bottom' : 'Scroll to top'}
      title={isNearTop ? 'Scroll to bottom' : 'Scroll to top'}
    >
      <svg
        className={`w-6 h-6 transform transition-transform duration-300 ${isNearTop ? 'rotate-180' : 'rotate-0'
          }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  );
}