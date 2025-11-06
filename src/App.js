import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Download, Upload, FolderPlus, ExternalLink, CheckCircle, Circle } from 'lucide-react';

export default function LeetCodeTracker() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  const [newProblem, setNewProblem] = useState({ categoryId: null, title: '', number: '', difficulty: 'Medium', notes: '' });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('leetcode-tracker');
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('leetcode-tracker', JSON.stringify(categories));
  }, [categories]);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    setCategories([...categories, {
      id: Date.now(),
      name: newCategoryName,
      problems: []
    }]);
    setNewCategoryName('');
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updateCategory = (id, newName) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
    setEditingCategory(null);
  };

  const addProblem = (categoryId) => {
    if (!newProblem.title.trim()) return;
    setCategories(categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          problems: [...c.problems, {
            id: Date.now(),
            title: newProblem.title,
            number: newProblem.number,
            difficulty: newProblem.difficulty,
            notes: newProblem.notes,
            solved: false,
            solvedAt: new Date().toISOString()
          }]
        };
      }
      return c;
    }));
    setNewProblem({ categoryId: null, title: '', number: '', difficulty: 'Medium', notes: '' });
  };

  const deleteProblem = (categoryId, problemId) => {
    setCategories(categories.map(c => {
      if (c.id === categoryId) {
        return { ...c, problems: c.problems.filter(p => p.id !== problemId) };
      }
      return c;
    }));
  };

  const updateProblem = (categoryId, problemId, updatedProblem) => {
    setCategories(categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          problems: c.problems.map(p => p.id === problemId ? { ...p, ...updatedProblem } : p)
        };
      }
      return c;
    }));
    setEditingProblem(null);
  };

  const toggleSolved = (categoryId, problemId) => {
    setCategories(categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          problems: c.problems.map(p => 
            p.id === problemId ? { ...p, solved: !p.solved } : p
          )
        };
      }
      return c;
    }));
  };

  const getLeetCodeUrl = (problemNumber, problemTitle) => {
    if (problemNumber) {
      return `https://leetcode.com/problems/${problemTitle.toLowerCase().replace(/\s+/g, '-')}/`;
    }
    return `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problemTitle)}`;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leetcode-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setCategories(imported);
      } catch (e) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">LeetCode Problem Tracker</h1>
            <div className="flex gap-2">
              <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={18} />
                Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                <Upload size={18} />
                Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              placeholder="New category name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={addCategory} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FolderPlus size={18} />
              Add Category
            </button>
          </div>
        </div>

        {categories.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No categories yet. Add one to get started!
          </div>
        )}

        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              {editingCategory === category.id ? (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    defaultValue={category.name}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') updateCategory(category.id, e.target.value);
                    }}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {category.name} <span className="text-sm text-gray-500">({category.problems.filter(p => p.solved).length}/{category.problems.length})</span>
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCategory(category.id)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {newProblem.categoryId === category.id ? (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newProblem.title}
                    onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                    placeholder="Problem title"
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newProblem.number}
                    onChange={(e) => setNewProblem({ ...newProblem, number: e.target.value })}
                    placeholder="Problem number"
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={newProblem.difficulty}
                  onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <textarea
                  value={newProblem.notes}
                  onChange={(e) => setNewProblem({ ...newProblem, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button onClick={() => addProblem(category.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    <Check size={18} />
                    Add Problem
                  </button>
                  <button onClick={() => setNewProblem({ categoryId: null, title: '', number: '', difficulty: 'Medium', notes: '' })} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setNewProblem({ ...newProblem, categoryId: category.id })}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mb-4"
              >
                <Plus size={18} />
                Add Problem
              </button>
            )}

            <div className="space-y-3">
              {category.problems.map(problem => (
                <div key={problem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {editingProblem?.id === problem.id && editingProblem?.categoryId === category.id ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          defaultValue={problem.title}
                          onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          defaultValue={problem.number}
                          onChange={(e) => setEditingProblem({ ...editingProblem, number: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        defaultValue={problem.difficulty}
                        onChange={(e) => setEditingProblem({ ...editingProblem, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                      <textarea
                        defaultValue={problem.notes}
                        onChange={(e) => setEditingProblem({ ...editingProblem, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => updateProblem(category.id, problem.id, editingProblem)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          <Check size={18} />
                          Save
                        </button>
                        <button onClick={() => setEditingProblem(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
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
                        <div className="flex-1">
                          <a
                            href={getLeetCodeUrl(problem.number, problem.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 mb-2 group cursor-pointer"
                          >
                            {problem.number && <span className="text-sm font-mono text-gray-500">#{problem.number}</span>}
                            <h3 className={`text-lg font-semibold ${problem.solved ? 'text-gray-500 line-through' : 'text-gray-800'} group-hover:text-blue-600 transition-colors`}>
                              {problem.title}
                            </h3>
                            <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </a>
                          {problem.notes && <p className="text-sm text-gray-600 mb-2">{problem.notes}</p>}
                          <p className="text-xs text-gray-400">Added: {new Date(problem.solvedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setEditingProblem({ ...problem, categoryId: category.id })} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteProblem(category.id, problem.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}