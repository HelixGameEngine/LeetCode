import { useState, useEffect } from 'react';

export function useScrollToTopBottom(threshold = 0.3) {
  const [showButton, setShowButton] = useState(false);
  const [isNearTop, setIsNearTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      // Show button after scrolling down a bit
      setShowButton(scrollTop > 100);

      // Determine if we're closer to top or bottom
      setIsNearTop(scrollPercentage < threshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return {
    showButton,
    isNearTop,
    scrollToTop,
    scrollToBottom
  };
}