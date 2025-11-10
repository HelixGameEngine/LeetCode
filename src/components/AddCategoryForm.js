import React from 'react';
import { Plus } from 'lucide-react';

const AddCategoryForm = ({
  isAddingCategory,
  setIsAddingCategory,
  newCategoryName,
  setNewCategoryName,
  newCategoryDescription,
  setNewCategoryDescription,
  addCategory,
  cancelAddCategory
}) => {
  if (!isAddingCategory) {
    return (
      <button
        onClick={() => setIsAddingCategory(true)}
        className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-colors duration-200 w-full text-left group min-h-[60px]"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full group-hover:bg-blue-200 flex-shrink-0">
          <Plus size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-700 font-medium text-base">Add New Category</div>
          <div className="text-gray-500 text-sm">Create a new category to organize your problems</div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <Plus size={20} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">New Category</h3>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          placeholder="Category name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
          autoFocus
        />
        <input
          type="text"
          value={newCategoryDescription}
          onChange={(e) => setNewCategoryDescription(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          placeholder="Description (optional)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={cancelAddCategory}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-base font-medium transition-colors min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={addCategory}
            disabled={!newCategoryName.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium transition-colors min-h-[48px]"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryForm;