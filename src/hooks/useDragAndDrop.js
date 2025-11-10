import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * Custom hook for drag and drop functionality
 * @param {Function} setCategories - Function to update categories state
 * @param {Function} moveProblem - Function to move problem between categories
 * @returns {Object} Drag and drop sensors and handlers
 */
export const useDragAndDrop = (setCategories, moveProblem) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Check if we're dragging a category (numeric ID) or a problem (string with dash)
    const activeIsCategory = typeof active.id === 'number' || !active.id.toString().includes('-');
    const overIsCategory = typeof over.id === 'number' || !over.id.toString().includes('-');

    if (activeIsCategory && overIsCategory) {
      // Reordering categories
      setCategories(prevCategories => {
        const oldIndex = prevCategories.findIndex(c => c.id === active.id);
        const newIndex = prevCategories.findIndex(c => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prevCategories, oldIndex, newIndex);
        }
        return prevCategories;
      });
    } else if (!activeIsCategory && overIsCategory) {
      // Moving problem to a different category
      const activeProblemData = active.id.split('-');
      const fromCategoryId = parseInt(activeProblemData[0]);
      const problemId = parseInt(activeProblemData[1]);
      const toCategoryId = over.id;

      if (moveProblem && fromCategoryId !== toCategoryId) {
        moveProblem(problemId, fromCategoryId, toCategoryId);
      }
    } else if (!activeIsCategory && !overIsCategory) {
      // Reordering problems within the same category or moving between categories
      const activeProblemData = active.id.split('-');
      const activeCategoryId = parseInt(activeProblemData[0]);
      const activeId = parseInt(activeProblemData[1]);

      const overProblemData = over.id.split('-');
      const overCategoryId = parseInt(overProblemData[0]);
      const overId = parseInt(overProblemData[1]);

      if (activeCategoryId === overCategoryId) {
        // Reordering problems within the same category
        setCategories(prevCategories => {
          return prevCategories.map(category => {
            if (category.id === activeCategoryId) {
              const oldIndex = category.problems.findIndex(p => p.id === activeId);
              const newIndex = category.problems.findIndex(p => p.id === overId);

              if (oldIndex !== -1 && newIndex !== -1) {
                const newProblems = arrayMove(category.problems, oldIndex, newIndex);
                return { ...category, problems: newProblems };
              }
            }
            return category;
          });
        });
      } else {
        // Moving problem to a different category
        if (moveProblem) {
          moveProblem(activeId, activeCategoryId, overCategoryId);
        }
      }
    }
  }, [setCategories, moveProblem]);

  return {
    sensors,
    handleDragEnd
  };
};