import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, INITIAL_PROBLEM } from '../utils/constants';

/**
 * Custom hook for managing LeetCode tracker business logic
 * @returns {Object} Tracker state and handlers
 */
export const useLeetCodeTracker = () => {
  const [categories, setCategories] = useLocalStorage(STORAGE_KEYS.CATEGORIES, []);
  const [collapsedCategories, setCollapsedCategories] = useLocalStorage(STORAGE_KEYS.COLLAPSED, []);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  const [newProblem, setNewProblem] = useState(INITIAL_PROBLEM);

  const addCategory = useCallback(() => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    // Check for duplicate category names
    const existingNames = categories.map(c => c.name.toLowerCase());
    if (existingNames.includes(trimmedName.toLowerCase())) {
      alert('A category with this name already exists. Please choose a different name.');
      return;
    }

    const newCategory = {
      id: Date.now(),
      name: trimmedName,
      description: newCategoryDescription.trim(),
      problems: []
    };

    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setIsAddingCategory(false);
  }, [newCategoryName, newCategoryDescription, categories, setCategories]);

  const cancelAddCategory = useCallback(() => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setIsAddingCategory(false);
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, [setCategories]);

  const updateCategory = useCallback((id, newName, newDescription) => {
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, name: newName, description: newDescription || c.description } : c
    ));
    setEditingCategory(null);
  }, [setCategories]);

  const toggleCategory = useCallback((categoryId) => {
    setCollapsedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, [setCollapsedCategories]);

  const addProblem = useCallback((categoryId) => {
    const trimmedTitle = newProblem.title.trim();
    if (!trimmedTitle) return;

    // Find the target category
    const targetCategory = categories.find(c => c.id === categoryId);
    if (!targetCategory) return;

    // Check for duplicate problem titles within the category
    const existingTitles = targetCategory.problems.map(p => p.title.toLowerCase());
    if (existingTitles.includes(trimmedTitle.toLowerCase())) {
      alert('A problem with this title already exists in this category. Please choose a different title.');
      return;
    }

    // Check for duplicate problem numbers within the category (if number is provided)
    const trimmedNumber = newProblem.number.trim();
    if (trimmedNumber) {
      const existingNumbers = targetCategory.problems
        .map(p => p.number)
        .filter(num => num && num.trim());
      if (existingNumbers.includes(trimmedNumber)) {
        alert('A problem with this number already exists in this category. Please choose a different number.');
        return;
      }
    }

    const problem = {
      id: Date.now(),
      title: trimmedTitle,
      number: trimmedNumber,
      difficulty: newProblem.difficulty,
      notes: newProblem.notes.trim(),
      solved: false,
      solvedTimes: 0,
      solvedAt: new Date().toISOString()
    };

    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, problems: [...c.problems, problem] } : c
    ));
    setNewProblem(INITIAL_PROBLEM);
  }, [newProblem, categories, setCategories]);

  const deleteProblem = useCallback((categoryId, problemId) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, problems: c.problems.filter(p => p.id !== problemId) } : c
    ));
  }, [setCategories]);

  const updateProblem = useCallback((categoryId, problemId, updatedProblem) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, problems: c.problems.map(p => p.id === problemId ? { ...p, ...updatedProblem } : p) }
        : c
    ));
    setEditingProblem(null);
  }, [setCategories]);

  const toggleSolved = useCallback((categoryId, problemId) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? {
          ...c,
          problems: c.problems.map(p =>
            p.id === problemId
              ? {
                ...p,
                solved: !p.solved,
                solvedTimes: !p.solved ? (p.solvedTimes || 0) + 1 : p.solvedTimes || 0
              }
              : p
          )
        }
        : c
    ));
  }, [setCategories]);

  const moveProblem = useCallback((problemId, fromCategoryId, toCategoryId) => {
    if (fromCategoryId === toCategoryId) return;

    setCategories(prev => {
      // Find the problem to move
      const fromCategory = prev.find(c => c.id === fromCategoryId);
      const toCategory = prev.find(c => c.id === toCategoryId);

      if (!fromCategory || !toCategory) return prev;

      const problemToMove = fromCategory.problems.find(p => p.id === problemId);
      if (!problemToMove) return prev;

      // Check for duplicate problem titles in the target category
      const existingTitles = toCategory.problems.map(p => p.title.toLowerCase());
      if (existingTitles.includes(problemToMove.title.toLowerCase())) {
        alert(`A problem with the title "${problemToMove.title}" already exists in "${toCategory.name}". Cannot move problem.`);
        return prev;
      }

      // Check for duplicate problem numbers in the target category (if number is provided)
      if (problemToMove.number && problemToMove.number.trim()) {
        const existingNumbers = toCategory.problems
          .map(p => p.number)
          .filter(num => num && num.trim());
        if (existingNumbers.includes(problemToMove.number.trim())) {
          alert(`A problem with the number "${problemToMove.number}" already exists in "${toCategory.name}". Cannot move problem.`);
          return prev;
        }
      }

      return prev.map(category => {
        if (category.id === fromCategoryId) {
          // Remove problem from source category
          return {
            ...category,
            problems: category.problems.filter(p => p.id !== problemId)
          };
        } else if (category.id === toCategoryId) {
          // Add problem to target category
          return {
            ...category,
            problems: [...category.problems, problemToMove]
          };
        }
        return category;
      });
    });
  }, [setCategories]);

  return {
    // State
    categories,
    setCategories,
    collapsedCategories,
    setCollapsedCategories,
    newCategoryName,
    setNewCategoryName,
    newCategoryDescription,
    setNewCategoryDescription,
    isAddingCategory,
    setIsAddingCategory,
    editingCategory,
    setEditingCategory,
    editingProblem,
    setEditingProblem,
    newProblem,
    setNewProblem,

    // Handlers
    addCategory,
    cancelAddCategory,
    deleteCategory,
    updateCategory,
    toggleCategory,
    addProblem,
    deleteProblem,
    updateProblem,
    toggleSolved,
    moveProblem
  };
};