import { useState, useCallback } from 'react';

/**
 * Custom hook for local storage with JSON serialization
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value if nothing in storage
 * @returns {[*, Function]} Current value and setter function
 */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      // Validate that the value can be serialized
      const serialized = JSON.stringify(newValue);
      setValue(newValue);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      // Still update state even if localStorage fails
      setValue(newValue);
    }
  }, [key]);

  return [value, setStoredValue];
};