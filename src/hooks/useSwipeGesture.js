import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing swipe gestures on mobile devices
 * @returns {Object} Swipe gesture handlers and state
 */
export const useSwipeGesture = () => {
  const [swipedProblem, setSwipedProblem] = useState(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e, problemId) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e, problemId) => {
    if (!isDragging.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = Math.abs(touchStartY.current - touchEndY);

    isDragging.current = false;

    // Check if it's a horizontal swipe (not vertical scroll)
    if (deltaY < 50 && Math.abs(deltaX) > 80) {
      if (deltaX > 0) {
        // Swipe left - show actions
        setSwipedProblem(problemId);
      } else {
        // Swipe right - hide actions
        setSwipedProblem(null);
      }
    }
  }, []);

  const clearSwipe = useCallback(() => {
    setSwipedProblem(null);
  }, []);

  return {
    swipedProblem,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearSwipe
  };
};