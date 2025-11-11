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
        distance: 5, // Reduced distance for more responsive dragging
        delay: 0,
        tolerance: 5,
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
    } else if (!activeIsCategory && !overIsCategory) {
      // Only allow reordering problems within the same category
      const activeProblemData = active.id.split('-');
      const activeCategoryId = parseInt(activeProblemData[0]);
      const activeId = parseInt(activeProblemData[1]);

      const overProblemData = over.id.split('-');
      const overCategoryId = parseInt(overProblemData[0]);
      const overId = parseInt(overProblemData[1]);

      // Only proceed if problems are in the same category
      if (activeCategoryId === overCategoryId) {
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
      }
      // If problems are from different categories, do nothing (prevent cross-category drag)
    }
    // Remove the logic for moving problems to different categories via drag
    // This now only works through the context menu
  }, [setCategories]);

  return {
    sensors,
    handleDragEnd
  };
};