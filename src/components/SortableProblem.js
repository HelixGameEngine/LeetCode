import React, { useState } from 'react';
import { Edit2, Trash2, Check, CheckCircle, Circle, ExternalLink, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProblemContextMenu from './ProblemContextMenu';

const SortableProblem = ({
  problem,
  category,
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
  categories,
  moveProblem
}) => {
  const [contextMenu, setContextMenu] = useState({ isVisible: false, position: { x: 0, y: 0 } });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${category.id}-${problem.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEditing = editingProblem?.id === problem.id && editingProblem?.categoryId === category.id;

  const handleContextMenu = (e) => {
    e.preventDefault();

    // Calculate position relative to viewport
    let x = e.clientX;
    let y = e.clientY;

    // Adjust position to keep menu within viewport
    const menuWidth = 200; // approximate menu width
    const menuHeight = 200; // approximate menu height

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }

    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setContextMenu({
      isVisible: true,
      position: { x, y }
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ isVisible: false, position: { x: 0, y: 0 } });
  };

  const handleMoveProblem = (targetCategoryId) => {
    moveProblem(problem.id, category.id, targetCategoryId);
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        data-problem-id={problem.id}
        className={`border-2 border-blue-300 bg-blue-50 rounded-xl p-4 md:p-5 shadow-lg transition-shadow ${isDragging ? 'z-50' : ''}`}
      >
        <div>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <input
              type="text"
              defaultValue={problem.title}
              onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
              placeholder="Problem title"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                defaultValue={problem.number}
                onChange={(e) => setEditingProblem({ ...editingProblem, number: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
                placeholder="Problem number"
              />
              <select
                defaultValue={problem.difficulty}
                onChange={(e) => setEditingProblem({ ...editingProblem, difficulty: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px] bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <textarea
              defaultValue={problem.notes}
              onChange={(e) => setEditingProblem({ ...editingProblem, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              rows="3"
              placeholder="Notes (optional)"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => updateProblem(category.id, problem.id, editingProblem)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium transition-colors min-h-[48px]"
            >
              <Check size={18} />
              Save
            </button>
            <button
              onClick={() => setEditingProblem(null)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 active:bg-gray-500 font-medium transition-colors min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        data-problem-id={problem.id}
        className={`border border-gray-200 rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow ${isDragging ? 'z-50' : ''}`}
        onContextMenu={handleContextMenu}
      >
        <div
          className="relative"
          onTouchStart={(e) => handleTouchStart(e, problem.id)}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => handleTouchEnd(e, problem.id)}
          onClick={() => {
            if (isMobileDevice() && swipedProblem === problem.id) {
              clearSwipe();
            }
          }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Drag handle */}
              <button
                {...attributes}
                {...listeners}
                className="mt-1 flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical size={16} />
              </button>

              <button
                onClick={() => toggleSolved(category.id, problem.id)}
                className="mt-1 flex-shrink-0 p-2 -m-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              >
                {problem.solved ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <Circle size={24} className="text-gray-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <a
                  href={getLeetCodeUrl(problem.number, problem.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {problem.number && (
                      <span className="text-sm sm:text-base font-mono text-gray-500 flex-shrink-0">
                        #{problem.number}
                      </span>
                    )}
                    <h3 className={`text-lg md:text-xl font-semibold min-w-0 ${problem.solved ? 'text-gray-500 line-through' : 'text-gray-800'
                      } group-hover:text-blue-600 transition-colors break-words`}>
                      {problem.title}
                    </h3>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </a>
                {problem.notes && (
                  <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{problem.notes}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs sm:text-sm text-gray-400">
                  <p className="flex-shrink-0">Added: {new Date(problem.solvedAt).toLocaleDateString()}</p>
                  {(problem.solvedTimes || 0) > 0 && (
                    <p className="text-green-600 font-medium flex-shrink-0">
                      Solved {problem.solvedTimes} time{problem.solvedTimes !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop buttons - always visible */}
            <div className="hidden md:flex gap-2 flex-shrink-0 justify-end sm:justify-start">
              <button
                onClick={() => setEditingProblem({ ...problem, categoryId: category.id })}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100 p-2 rounded-lg transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                title="Edit problem"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => deleteProblem(category.id, problem.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 active:bg-red-100 p-2 rounded-lg transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                title="Delete problem"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Mobile swipe actions - show when swiped */}
          {isMobileDevice() && swipedProblem === problem.id && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center gap-3 bg-gradient-to-l from-white via-white to-transparent border-l border-gray-200 px-4 shadow-lg md:hidden animate-in slide-in-from-right duration-200">
              <button
                onClick={() => {
                  setEditingProblem({ ...problem, categoryId: category.id });
                  clearSwipe();
                }}
                className="flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 active:bg-blue-300 transition-all active:scale-95 touch-manipulation shadow-md"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => {
                  deleteProblem(category.id, problem.id);
                  clearSwipe();
                }}
                className="flex items-center justify-center w-14 h-14 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 active:bg-red-300 transition-all active:scale-95 touch-manipulation shadow-md"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}

          {/* Mobile fallback buttons - show when not swiped */}
          {isMobileDevice() && swipedProblem !== problem.id && (
            <div className="mt-4 md:hidden">
              {/* Swipe hint */}
              <div className="flex items-center justify-center mb-3 text-xs text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Swipe left for actions
              </div>

              <div className="flex gap-3 justify-start">
                <button
                  onClick={() => setEditingProblem({ ...problem, categoryId: category.id })}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium active:bg-blue-200 transition-all active:scale-95 min-h-[48px] touch-manipulation"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => deleteProblem(category.id, problem.id)}
                  className="flex items-center gap-2 px-5 py-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium active:bg-red-200 transition-all active:scale-95 min-h-[48px] touch-manipulation"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProblemContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={handleCloseContextMenu}
        categories={categories}
        currentCategoryId={category.id}
        onMoveProblem={handleMoveProblem}
      />
    </>
  );
};

export default SortableProblem;