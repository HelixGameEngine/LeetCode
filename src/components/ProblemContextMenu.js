import React, { useEffect, useRef } from 'react';
import { FolderOpen } from 'lucide-react';

const ProblemContextMenu = ({
  isVisible,
  position,
  onClose,
  categories,
  currentCategoryId,
  onMoveProblem
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Filter out the current category from the list
  const otherCategories = categories.filter(cat => cat.id !== currentCategoryId);

  if (otherCategories.length === 0) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          No other categories available
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48 max-h-64 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
        Move to Category
      </div>
      {otherCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => {
            onMoveProblem(category.id);
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <FolderOpen size={16} className="text-gray-400" />
          <span className="truncate">{category.name}</span>
          {category.description && (
            <span className="text-xs text-gray-400 ml-auto truncate max-w-24">
              {category.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ProblemContextMenu;