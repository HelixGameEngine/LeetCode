import React from 'react';
import { Cloud } from 'lucide-react';

const GitHubSyncPanel = ({
  isConnected,
  githubSync,
  onSaveToGist
}) => {
  const {
    githubToken,
    setGithubToken,
    syncStatus,
    showGistSync,
    setShowGistSync,
    gistIdInput,
    setGistIdInput,
    connectGitHub,
    loadFromGist,
    disconnectGitHub,
    setGistId,
    getCurrentGistId
  } = githubSync;

  return (
    <>
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
              onClick={onSaveToGist || githubSync.saveToGist}
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
              onClick={() => setShowGistSync(!showGistSync)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              title="Sync across devices"
            >
              Sync
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
      </div>

      {/* Gist Sync Panel */}
      {showGistSync && isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-4">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Sync Across Devices</h3>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={gistIdInput}
                onChange={(e) => setGistIdInput(e.target.value)}
                placeholder="Enter Gist ID to sync with existing data"
                className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1"
              />
              <button
                onClick={setGistId}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Set Gist ID
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start">
              <button
                onClick={getCurrentGistId}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Copy Current Gist ID
              </button>
              <div className="text-sm text-blue-700">
                <p><strong>To sync across devices:</strong></p>
                <p>1. Save your data on the first device</p>
                <p>2. Click "Copy Current Gist ID" and share it</p>
                <p>3. On other devices, paste the Gist ID and click "Set Gist ID"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GitHubSyncPanel;