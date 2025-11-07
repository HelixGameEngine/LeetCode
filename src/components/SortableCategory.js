import React from 'react';
import { Edit2, Trash2, X, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableProblem from './SortableProblem';
import AddProblemForm from './AddProblemForm';

const SortableCategory = ({
  category,
  isCollapsed,
  editingCategory,
  setEditingCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  newProblem,
  setNewProblem,
  addProblem,
  editingProblem,
  setEditingProblem,
  updateProblem,
  deleteProblem,
  toggleSolved,
  swipedProblem,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  clearSwipe,
  getLeetCodeUrl,
  getDifficultyColor,
  isMobileDevice,
  sensors,
  handleDragEnd,
  INITIAL_PROBLEM
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEditingThisCategory = editingCategory === category.id;
  const solvedProblemsCount = category.problems.filter(p => p.solved).length;
  const totalProblemsCount = category.problems.length;

  const handleCategoryUpdate = (e, field) => {
    if (e.key === 'Enter') {
      const form = e.target.closest('.flex-col');
      const nameInput = form.children[0];
      const descriptionInput = form.children[1];
      updateCategory(category.id, nameInput.value, descriptionInput.value);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 md:mb-6 ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-3 md:mb-4">
        {isEditingThisCategory ? (
          <div className="flex flex-col gap-2 flex-1">
            <input
              type="text"
              defaultValue={category.name}
              onKeyDown={(e) => handleCategoryUpdate(e, 'name')}
              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Category name"
              autoFocus
            />
            <input
              type="text"
              defaultValue={category.description || ''}
              placeholder="Category description"
              onKeyDown={(e) => handleCategoryUpdate(e, 'description')}
              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setEditingCategory(null)}
              className="self-start text-gray-500 hover:text-gray-700"
              title="Cancel editing"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Drag handle for category */}
              <button
                {...attributes}
                {...listeners}
                className="mt-1 flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                title="Drag to reorder category"
              >
                <GripVertical size={16} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="text-gray-600 hover:text-gray-800 flex-shrink-0"
                    title={isCollapsed ? "Expand category" : "Collapse category"}
                  >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                    {category.name}{' '}
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      ({solvedProblemsCount}/{totalProblemsCount})
                    </span>
                  </h2>
                </div>
                {category.description && (
                  <p className="text-gray-600 text-sm ml-7 break-words">{category.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-1 md:gap-2 flex-shrink-0 ml-2">
              <button
                onClick={() => setEditingCategory(category.id)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit category"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deleteCategory(category.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete category"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          <AddProblemForm
            newProblem={newProblem}
            setNewProblem={setNewProblem}
            addProblem={addProblem}
            categoryId={category.id}
            INITIAL_PROBLEM={INITIAL_PROBLEM}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-3">
              <SortableContext
                items={category.problems.map(p => `${category.id}-${p.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {category.problems.map(problem => (
                  <SortableProblem
                    key={`${category.id}-${problem.id}`}
                    problem={problem}
                    category={category}
                    editingProblem={editingProblem}
                    setEditingProblem={setEditingProblem}
                    updateProblem={updateProblem}
                    deleteProblem={deleteProblem}
                    toggleSolved={toggleSolved}
                    swipedProblem={swipedProblem}
                    handleTouchStart={handleTouchStart}
                    handleTouchMove={handleTouchMove}
                    handleTouchEnd={handleTouchEnd}
                    clearSwipe={clearSwipe}
                    getLeetCodeUrl={getLeetCodeUrl}
                    getDifficultyColor={getDifficultyColor}
                    isMobileDevice={isMobileDevice}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </>
      )}
    </div>
  );
};

export default SortableCategory;