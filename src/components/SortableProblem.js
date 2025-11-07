import React from 'react';
import { Edit2, Trash2, Check, CheckCircle, Circle, ExternalLink, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  isMobileDevice
}) => {
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

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow ${isDragging ? 'z-50' : ''}`}
      >
        <div>
          <div className="grid grid-cols-1 gap-3 mb-3">
            <input
              type="text"
              defaultValue={problem.title}
              onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Problem title"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                defaultValue={problem.number}
                onChange={(e) => setEditingProblem({ ...editingProblem, number: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Problem number"
              />
              <select
                defaultValue={problem.difficulty}
                onChange={(e) => setEditingProblem({ ...editingProblem, difficulty: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <textarea
              defaultValue={problem.notes}
              onChange={(e) => setEditingProblem({ ...editingProblem, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Notes (optional)"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => updateProblem(category.id, problem.id, editingProblem)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Check size={16} />
              Save
            </button>
            <button
              onClick={() => setEditingProblem(null)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow ${isDragging ? 'z-50' : ''}`}
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
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
              className="mt-1 flex-shrink-0"
            >
              {problem.solved ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <Circle size={20} className="text-gray-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <a
                href={getLeetCodeUrl(problem.number, problem.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="block group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  {problem.number && (
                    <span className="text-sm font-mono text-gray-500 flex-shrink-0">
                      #{problem.number}
                    </span>
                  )}
                  <h3 className={`text-base md:text-lg font-semibold min-w-0 ${problem.solved ? 'text-gray-500 line-through' : 'text-gray-800'
                    } group-hover:text-blue-600 transition-colors break-words`}>
                    {problem.title}
                  </h3>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
              </a>
              {problem.notes && (
                <p className="text-sm text-gray-600 mb-2 break-words">{problem.notes}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-400">
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
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Edit problem"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => deleteProblem(category.id, problem.id)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete problem"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Mobile swipe actions - show when swiped */}
        {isMobileDevice() && swipedProblem === problem.id && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 bg-white border-l border-gray-200 px-3 shadow-lg md:hidden">
            <button
              onClick={() => {
                setEditingProblem({ ...problem, categoryId: category.id });
                clearSwipe();
              }}
              className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 active:bg-blue-300 transition-colors"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => {
                deleteProblem(category.id, problem.id);
                clearSwipe();
              }}
              className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full hover:bg-red-200 active:bg-red-300 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {/* Mobile fallback buttons - show when not swiped */}
        {isMobileDevice() && swipedProblem !== problem.id && (
          <div className="flex gap-2 justify-start mt-3 md:hidden">
            <button
              onClick={() => setEditingProblem({ ...problem, categoryId: category.id })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium active:bg-blue-200 transition-colors"
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              onClick={() => deleteProblem(category.id, problem.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium active:bg-red-200 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableProblem;