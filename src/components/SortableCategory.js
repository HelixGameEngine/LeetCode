import React from 'react';
import { Edit2, Trash2, X, ChevronDown, ChevronRight, GripVertical, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  INITIAL_PROBLEM,
  categories,
  moveProblem
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
      id={`category-${category.id}`}
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-lg mb-4 md:mb-6 ${isDragging ? 'z-50' : ''}`}
    >
      <div
        className="sticky top-0 bg-white rounded-t-xl z-40 flex justify-between items-start p-4 sm:p-5 md:p-6 transition-all duration-200 shadow-sm"
      >
        {isEditingThisCategory ? (
          <div className="flex flex-col gap-3 flex-1">
            <input
              type="text"
              defaultValue={category.name}
              onKeyDown={(e) => handleCategoryUpdate(e, 'name')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
              placeholder="Category name"
              autoFocus
            />
            <input
              type="text"
              defaultValue={category.description || ''}
              placeholder="Category description"
              onKeyDown={(e) => handleCategoryUpdate(e, 'description')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
            />
            <button
              onClick={() => setEditingCategory(null)}
              className="self-start text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                className="mt-1 flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1 rounded touch-manipulation"
                title="Drag to reorder category"
                style={{ touchAction: 'none' }}
              >
                <GripVertical size={18} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="text-gray-600 hover:text-gray-800 flex-shrink-0 p-2 -m-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title={isCollapsed ? "Expand category" : "Collapse category"}
                  >
                    {isCollapsed ? <ChevronRight size={22} /> : <ChevronDown size={22} />}
                  </button>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                    {category.name}{' '}
                    <span className="text-base sm:text-lg text-gray-500 whitespace-nowrap">
                      ({solvedProblemsCount}/{totalProblemsCount})
                    </span>
                  </h2>
                </div>
                {category.description && (
                  <p className="text-gray-600 text-sm sm:text-base ml-7 break-words mt-1">{category.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-2">
              <button
                onClick={() => setNewProblem({ ...newProblem, categoryId: category.id })}
                className="text-green-600 hover:text-green-800 hover:bg-green-50 active:bg-green-100 p-2 rounded-lg transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                title="Add new problem"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => setEditingCategory(category.id)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100 p-2 rounded-lg transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                title="Edit category"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => deleteCategory(category.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 active:bg-red-100 p-2 rounded-lg transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                title="Delete category"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
          {newProblem.categoryId === category.id && (
            <AddProblemForm
              newProblem={newProblem}
              setNewProblem={setNewProblem}
              addProblem={addProblem}
              categoryId={category.id}
              INITIAL_PROBLEM={INITIAL_PROBLEM}
            />
          )}

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
                  categories={categories}
                  moveProblem={moveProblem}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableCategory;