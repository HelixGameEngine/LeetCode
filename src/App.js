import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Components
import SortableCategory from './components/SortableCategory';
import GitHubSyncPanel from './components/GitHubSyncPanel';
import ImportExportButtons from './components/ImportExportButtons';
import AddCategoryForm from './components/AddCategoryForm';
import ScrollButton from './components/ScrollButton';
import RandomProblemCard from './components/RandomProblemCard';

// Hooks
import { useLeetCodeTracker } from './hooks/useLeetCodeTracker';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { useGitHubSync } from './hooks/useGitHubSync';
import { useDragAndDrop } from './hooks/useDragAndDrop';

// Utils
import { getLeetCodeUrl, getDifficultyColor, isMobileDevice } from './utils/helpers';
import { INITIAL_PROBLEM } from './utils/constants';

export default function LeetCodeTracker() {
  // Main tracker state and handlers
  const trackerState = useLeetCodeTracker();

  // GitHub integration
  const githubSync = useGitHubSync();

  // Swipe gestures for mobile
  const swipeGesture = useSwipeGesture();

  // Drag and drop functionality
  const { sensors, handleDragEnd } = useDragAndDrop(trackerState.setCategories);

  // GitHub sync handlers that need access to tracker data
  const handleSaveToGist = () => {
    githubSync.saveToGist({
      categories: trackerState.categories,
      collapsedCategories: trackerState.collapsedCategories
    });
  };

  const handleLoadFromGist = async () => {
    const data = await githubSync.loadFromGist();
    if (data) {
      trackerState.setCategories(data.categories || []);
      trackerState.setCollapsedCategories(data.collapsedCategories || []);
    }
  };

  const handleSetGistId = async () => {
    const data = await githubSync.setGistId();
    if (data) {
      trackerState.setCategories(data.categories || []);
      trackerState.setCollapsedCategories(data.collapsedCategories || []);
    }
  };

  // Override GitHub sync functions to use tracker data
  const githubSyncWithData = {
    ...githubSync,
    saveToGist: handleSaveToGist,
    loadFromGist: handleLoadFromGist,
    setGistId: handleSetGistId
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 md:mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 md:mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 text-center lg:text-left">
              LeetCode Problem Tracker
            </h1>
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
              <GitHubSyncPanel
                isConnected={githubSync.isConnected}
                githubSync={githubSyncWithData}
                onSaveToGist={handleSaveToGist}
              />
              <ImportExportButtons
                categories={trackerState.categories}
                collapsedCategories={trackerState.collapsedCategories}
                setCategories={trackerState.setCategories}
                setCollapsedCategories={trackerState.setCollapsedCategories}
              />
            </div>
          </div>
        </div>

        {/* Random Problem Card */}
        <RandomProblemCard
          categories={trackerState.categories}
          getLeetCodeUrl={getLeetCodeUrl}
          getDifficultyColor={getDifficultyColor}
        />

        {trackerState.categories.length === 0 && (
          <div className="bg-white rounded-lg shadow p-4 md:p-8 text-center text-gray-500">
            No categories yet. Add one to get started!
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={trackerState.categories.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {trackerState.categories.map(category => {
              const isCollapsed = trackerState.collapsedCategories.includes(category.id);
              return (
                <SortableCategory
                  key={category.id}
                  category={category}
                  isCollapsed={isCollapsed}
                  editingCategory={trackerState.editingCategory}
                  setEditingCategory={trackerState.setEditingCategory}
                  updateCategory={trackerState.updateCategory}
                  deleteCategory={trackerState.deleteCategory}
                  toggleCategory={trackerState.toggleCategory}
                  newProblem={trackerState.newProblem}
                  setNewProblem={trackerState.setNewProblem}
                  addProblem={trackerState.addProblem}
                  editingProblem={trackerState.editingProblem}
                  setEditingProblem={trackerState.setEditingProblem}
                  updateProblem={trackerState.updateProblem}
                  deleteProblem={trackerState.deleteProblem}
                  toggleSolved={trackerState.toggleSolved}
                  swipedProblem={swipeGesture.swipedProblem}
                  handleTouchStart={swipeGesture.handleTouchStart}
                  handleTouchMove={swipeGesture.handleTouchMove}
                  handleTouchEnd={swipeGesture.handleTouchEnd}
                  clearSwipe={swipeGesture.clearSwipe}
                  getLeetCodeUrl={getLeetCodeUrl}
                  getDifficultyColor={getDifficultyColor}
                  isMobileDevice={isMobileDevice}
                  sensors={sensors}
                  handleDragEnd={handleDragEnd}
                  INITIAL_PROBLEM={INITIAL_PROBLEM}
                />
              )
            })}
          </SortableContext>
        </DndContext>

        <div className="mt-6">
          <AddCategoryForm
            isAddingCategory={trackerState.isAddingCategory}
            setIsAddingCategory={trackerState.setIsAddingCategory}
            newCategoryName={trackerState.newCategoryName}
            setNewCategoryName={trackerState.setNewCategoryName}
            newCategoryDescription={trackerState.newCategoryDescription}
            setNewCategoryDescription={trackerState.setNewCategoryDescription}
            addCategory={trackerState.addCategory}
            cancelAddCategory={trackerState.cancelAddCategory}
          />
        </div>
      </div>

      {/* Scroll to top/bottom button */}
      <ScrollButton />
    </div>
  );
}