import React from 'react';
import { Plus, Check } from 'lucide-react';

const AddProblemForm = ({
  newProblem,
  setNewProblem,
  addProblem,
  categoryId,
  INITIAL_PROBLEM
}) => {
  const isFormVisible = newProblem.categoryId === categoryId;

  if (!isFormVisible) {
    return (
      <button
        onClick={() => setNewProblem({ ...newProblem, categoryId })}
        className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 mb-4 text-sm md:text-base font-medium transition-colors min-h-[48px]"
      >
        <Plus size={18} />
        Add Problem
      </button>
    );
  }

  return (
    <div className="bg-gray-50 p-4 md:p-5 rounded-xl mb-4 md:mb-5">
      <div className="grid grid-cols-1 gap-4 mb-4">
        <input
          type="text"
          value={newProblem.title}
          onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
          placeholder="Problem title"
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={newProblem.number}
            onChange={(e) => setNewProblem({ ...newProblem, number: e.target.value })}
            placeholder="Problem number"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px]"
          />
          <select
            value={newProblem.difficulty}
            onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px] bg-white"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <textarea
          value={newProblem.notes}
          onChange={(e) => setNewProblem({ ...newProblem, notes: e.target.value })}
          placeholder="Notes (optional)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          rows="3"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => addProblem(categoryId)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 font-medium transition-colors min-h-[48px]"
        >
          <Check size={18} />
          Add Problem
        </button>
        <button
          onClick={() => setNewProblem(INITIAL_PROBLEM)}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 active:bg-gray-500 font-medium transition-colors min-h-[48px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProblemForm;