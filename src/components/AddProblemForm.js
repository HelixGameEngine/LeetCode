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
        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mb-3 md:mb-4 text-sm md:text-base"
      >
        <Plus size={16} />
        Add Problem
      </button>
    );
  }

  return (
    <div className="bg-gray-50 p-3 md:p-4 rounded-lg mb-3 md:mb-4">
      <div className="grid grid-cols-1 gap-3 mb-3">
        <input
          type="text"
          value={newProblem.title}
          onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
          placeholder="Problem title"
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={newProblem.number}
            onChange={(e) => setNewProblem({ ...newProblem, number: e.target.value })}
            placeholder="Problem number"
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newProblem.difficulty}
            onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => addProblem(categoryId)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Check size={16} />
          Add Problem
        </button>
        <button
          onClick={() => setNewProblem(INITIAL_PROBLEM)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProblemForm;