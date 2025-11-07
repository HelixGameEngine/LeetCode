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
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 w-full text-left group"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full group-hover:bg-blue-200">
          <Plus size={18} className="text-blue-600" />
        </div>
        <div>
          <div className="text-gray-700 font-medium">Add New Category</div>
          <div className="text-gray-500 text-sm">Create a new category to organize your problems</div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <Plus size={18} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">New Category</h3>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          placeholder="Category name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          autoFocus
        />
        <input
          type="text"
          value={newCategoryDescription}
          onChange={(e) => setNewCategoryDescription(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={cancelAddCategory}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={addCategory}
            disabled={!newCategoryName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryForm;