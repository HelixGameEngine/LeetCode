import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Download, Upload, FolderPlus, ExternalLink, CheckCircle, Circle, ChevronDown, ChevronRight, Cloud } from 'lucide-react';
import GistStorage from './gistStorage';

const STORAGE_KEYS = {
  CATEGORIES: 'leetcode-tracker',
  COLLAPSED: 'leetcode-tracker-collapsed'
};

const INITIAL_PROBLEM = { categoryId: null, title: '', number: '', difficulty: 'Medium', notes: '' };

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);

  return [value, setStoredValue];
};

const useSwipeGesture = () => {
  const [swipedProblem, setSwipedProblem] = useState(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e, problemId) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e, problemId) => {
    if (!isDragging.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = Math.abs(touchStartY.current - touchEndY);

    isDragging.current = false;

    // Check if it's a horizontal swipe (not vertical scroll)
    if (deltaY < 50 && Math.abs(deltaX) > 80) {
      if (deltaX > 0) {
        // Swipe left - show actions
        setSwipedProblem(problemId);
      } else {
        // Swipe right - hide actions
        setSwipedProblem(null);
      }
    }
  }, []);

  const clearSwipe = useCallback(() => {
    setSwipedProblem(null);
  }, []);

  return {
    swipedProblem,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearSwipe
  };
};

export default function LeetCodeTracker() {
  const [categories, setCategories] = useLocalStorage(STORAGE_KEYS.CATEGORIES, []);
  const [collapsedCategories, setCollapsedCategories] = useLocalStorage(STORAGE_KEYS.COLLAPSED, []);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  const [newProblem, setNewProblem] = useState(INITIAL_PROBLEM);

  // Swipe gesture hook
  const { swipedProblem, handleTouchStart, handleTouchMove, handleTouchEnd, clearSwipe } = useSwipeGesture();

  // GitHub Gist integration
  const [gistStorage] = useState(() => new GistStorage());
  const [isConnected, setIsConnected] = useState(() => gistStorage.isConnected());
  const [githubToken, setGithubToken] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    setCategories([...categories, {
      id: Date.now(),
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim(),
      problems: []
    }]);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updateCategory = (id, newName, newDescription) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, name: newName, description: newDescription || c.description } : c
    ));
    setEditingCategory(null);
  };

  const addProblem = (categoryId) => {
    if (!newProblem.title.trim()) return;

    const problem = {
      id: Date.now(),
      title: newProblem.title.trim(),
      number: newProblem.number.trim(),
      difficulty: newProblem.difficulty,
      notes: newProblem.notes.trim(),
      solved: false,
      solvedTimes: 0,
      solvedAt: new Date().toISOString()
    };

    setCategories(categories.map(c =>
      c.id === categoryId ? { ...c, problems: [...c.problems, problem] } : c
    ));
    setNewProblem(INITIAL_PROBLEM);
  };

  const deleteProblem = (categoryId, problemId) => {
    setCategories(categories.map(c =>
      c.id === categoryId ? { ...c, problems: c.problems.filter(p => p.id !== problemId) } : c
    ));
  };

  const updateProblem = (categoryId, problemId, updatedProblem) => {
    setCategories(categories.map(c =>
      c.id === categoryId
        ? { ...c, problems: c.problems.map(p => p.id === problemId ? { ...p, ...updatedProblem } : p) }
        : c
    ));
    setEditingProblem(null);
  };

  const toggleSolved = (categoryId, problemId) => {
    setCategories(categories.map(c =>
      c.id === categoryId
        ? {
          ...c,
          problems: c.problems.map(p =>
            p.id === problemId
              ? { ...p, solved: !p.solved, solvedTimes: !p.solved ? (p.solvedTimes || 0) + 1 : p.solvedTimes || 0 }
              : p
          )
        }
        : c
    ));
  };

  const getLeetCodeUrl = (problemNumber, problemTitle) =>
    problemNumber
      ? `https://leetcode.com/problems/${problemTitle.toLowerCase().replace(/\s+/g, '-')}/`
      : `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problemTitle)}`;

  const exportData = () => {
    const exportObject = {
      categories,
      collapsedCategories,
      exportDate: new Date().toISOString(),
      version: '1.1'
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
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

        if (Array.isArray(imported)) {
          setCategories(imported);
          setCollapsedCategories([]);
        } else {
          setCategories(imported.categories || []);
          setCollapsedCategories(imported.collapsedCategories || []);
        }
      } catch {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-green-600 bg-green-50',
      Medium: 'text-yellow-600 bg-yellow-50',
      Hard: 'text-red-600 bg-red-50'
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-50';
  };

  const isMobileDevice = () => {
    return window.innerWidth < 768; // Tailwind's md breakpoint
  };

  const toggleCategory = (categoryId) => {
    const newCollapsed = collapsedCategories.includes(categoryId)
      ? collapsedCategories.filter(id => id !== categoryId)
      : [...collapsedCategories, categoryId];
    setCollapsedCategories(newCollapsed);
  };

  // GitHub Gist functions
  const connectGitHub = () => {
    if (!githubToken.trim()) {
      alert('Please enter a GitHub token');
      return;
    }

    gistStorage.setToken(githubToken.trim());
    setIsConnected(true);
    setGithubToken('');
    setSyncStatus('Connected to GitHub');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const saveToGist = async () => {
    if (!isConnected) {
      alert('Please connect to GitHub first');
      return;
    }

    try {
      setSyncStatus('Saving...');
      await gistStorage.saveData({ categories, collapsedCategories });
      setSyncStatus('Saved to GitHub');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
    }
  };

  const loadFromGist = async () => {
    if (!isConnected) {
      alert('Please connect to GitHub first');
      return;
    }

    try {
      setSyncStatus('Loading...');
      const data = await gistStorage.loadData();
      if (data) {
        setCategories(data.categories || []);
        setCollapsedCategories(data.collapsedCategories || []);
        setSyncStatus('Loaded from GitHub');
      } else {
        setSyncStatus('No data found');
      }
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
    }
  };

  const disconnectGitHub = () => {
    gistStorage.disconnect();
    setIsConnected(false);
    setSyncStatus('Disconnected');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 md:mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 md:mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 text-center lg:text-left">LeetCode Problem Tracker</h1>
            <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center lg:justify-end">
              {!isConnected ? (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && connectGitHub()}
                    placeholder="GitHub Personal Access Token"
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0 flex-1"
                  />
                  <button
                    onClick={connectGitHub}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm whitespace-nowrap"
                  >
                    <Cloud size={16} />
                    Connect
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                  <button
                    onClick={saveToGist}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm"
                  >
                    <Cloud size={16} />
                    Save to GitHub
                  </button>
                  <button
                    onClick={loadFromGist}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Load
                  </button>
                  <button
                    onClick={disconnectGitHub}
                    className="px-2 py-2 text-gray-600 hover:text-gray-800 text-sm"
                    title="Disconnect GitHub"
                  >
                    ✕
                  </button>
                </div>
              )}
              {syncStatus && (
                <span className="text-sm text-gray-600 font-medium text-center">{syncStatus}</span>
              )}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                <button onClick={exportData} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Download size={16} />
                  Export
                </button>
                <label className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm">
                  <Upload size={16} />
                  Import
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                placeholder="New category name"
                className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
              <button onClick={addCategory} className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
                <FolderPlus size={16} />
                <span className="hidden sm:inline">Add Category</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            <input
              type="text"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              placeholder="Category description (optional)"
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
        </div>

        {categories.length === 0 && (
          <div className="bg-white rounded-lg shadow p-4 md:p-8 text-center text-gray-500">
            No categories yet. Add one to get started!
          </div>
        )}

        {categories.map(category => {
          const isCollapsed = collapsedCategories.includes(category.id);
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 md:mb-6">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                {editingCategory === category.id ? (
                  <div className="flex flex-col gap-2 flex-1">
                    <input
                      type="text"
                      defaultValue={category.name}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const form = e.target.closest('.flex-col');
                          const newName = form.children[0].value;
                          const newDescription = form.children[1].value;
                          updateCategory(category.id, newName, newDescription);
                        }
                      }}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      defaultValue={category.description || ''}
                      placeholder="Category description"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const form = e.target.closest('.flex-col');
                          const newName = form.children[0].value;
                          const newDescription = form.children[1].value;
                          updateCategory(category.id, newName, newDescription);
                        }
                      }}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => setEditingCategory(null)} className="self-start text-gray-500 hover:text-gray-700">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="text-gray-600 hover:text-gray-800 flex-shrink-0"
                        >
                          {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                          {category.name} <span className="text-sm text-gray-500 whitespace-nowrap">({category.problems.filter(p => p.solved).length}/{category.problems.length})</span>
                        </h2>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 text-sm ml-7 break-words">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 md:gap-2 flex-shrink-0 ml-2">
                      <button onClick={() => setEditingCategory(category.id)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-800 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {!isCollapsed && (
                <>
                  {newProblem.categoryId === category.id ? (
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
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
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
                        <button onClick={() => addProblem(category.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                          <Check size={16} />
                          Add Problem
                        </button>
                        <button onClick={() => setNewProblem(INITIAL_PROBLEM)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewProblem({ ...newProblem, categoryId: category.id })}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mb-3 md:mb-4 text-sm md:text-base"
                    >
                      <Plus size={16} />
                      Add Problem
                    </button>
                  )}

                  <div className="space-y-3">
                    {category.problems.map(problem => (
                      <div key={problem.id} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                        {editingProblem?.id === problem.id && editingProblem?.categoryId === category.id ? (
                          <div>
                            <div className="grid grid-cols-1 gap-3 mb-3">
                              <input
                                type="text"
                                defaultValue={problem.title}
                                onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  defaultValue={problem.number}
                                  onChange={(e) => setEditingProblem({ ...editingProblem, number: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select
                                  defaultValue={problem.difficulty}
                                  onChange={(e) => setEditingProblem({ ...editingProblem, difficulty: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option>Easy</option>
                                  <option>Medium</option>
                                  <option>Hard</option>
                                </select>
                              </div>
                              <textarea
                                defaultValue={problem.notes}
                                onChange={(e) => setEditingProblem({ ...editingProblem, notes: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button onClick={() => updateProblem(category.id, problem.id, editingProblem)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                <Check size={16} />
                                Save
                              </button>
                              <button onClick={() => setEditingProblem(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="relative"
                            onTouchStart={(e) => handleTouchStart(e, problem.id)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={(e) => handleTouchEnd(e, problem.id)}
                            onClick={() => {
                              // Clear swipe when clicking elsewhere on mobile
                              if (isMobileDevice() && swipedProblem === problem.id) {
                                clearSwipe();
                              }
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
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
                                      {problem.number && <span className="text-sm font-mono text-gray-500 flex-shrink-0">#{problem.number}</span>}
                                      <h3 className={`text-base md:text-lg font-semibold min-w-0 ${problem.solved ? 'text-gray-500 line-through' : 'text-gray-800'} group-hover:text-blue-600 transition-colors break-words`}>
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
                                  {problem.notes && <p className="text-sm text-gray-600 mb-2 break-words">{problem.notes}</p>}
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
                                <button onClick={() => setEditingProblem({ ...problem, categoryId: category.id })} className="text-blue-600 hover:text-blue-800 p-1">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => deleteProblem(category.id, problem.id)} className="text-red-600 hover:text-red-800 p-1">
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
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}