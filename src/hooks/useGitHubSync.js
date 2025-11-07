import { useState } from 'react';
import GistStorage from '../gistStorage';

/**
 * Custom hook for GitHub Gist integration
 * @returns {Object} GitHub sync state and handlers
 */
export const useGitHubSync = () => {
  const [gistStorage] = useState(() => new GistStorage());
  const [isConnected, setIsConnected] = useState(() => gistStorage.isConnected());
  const [githubToken, setGithubToken] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [showGistSync, setShowGistSync] = useState(false);
  const [gistIdInput, setGistIdInput] = useState('');

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

  const saveToGist = async (data) => {
    if (!isConnected) {
      alert('Please connect to GitHub first');
      return;
    }

    try {
      setSyncStatus('Saving...');
      await gistStorage.saveData(data);
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
      return null;
    }

    try {
      setSyncStatus('Loading...');
      const data = await gistStorage.loadData();
      if (data) {
        setSyncStatus('Loaded from GitHub');
      } else {
        setSyncStatus('No data found');
      }
      setTimeout(() => setSyncStatus(''), 3000);
      return data;
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
      return null;
    }
  };

  const disconnectGitHub = () => {
    gistStorage.disconnect();
    setIsConnected(false);
    setSyncStatus('Disconnected');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const setGistId = async () => {
    if (!gistIdInput.trim()) {
      alert('Please enter a gist ID');
      return null;
    }

    try {
      setSyncStatus('Setting gist ID and loading data...');
      gistStorage.setGistId(gistIdInput.trim());
      setGistIdInput('');
      setShowGistSync(false);

      // Automatically load data from the newly set gist
      const data = await gistStorage.loadData();
      if (data) {
        setSyncStatus('Gist ID set and data loaded successfully!');
      } else {
        setSyncStatus('Gist ID set, but no data found in gist');
      }
      setTimeout(() => setSyncStatus(''), 5000);
      return data;
    } catch (error) {
      setSyncStatus(`Error loading from gist: ${error.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
      return null;
    }
  };

  const getCurrentGistId = () => {
    const currentId = gistStorage.getCurrentGistId();
    if (currentId) {
      navigator.clipboard.writeText(currentId);
      setSyncStatus('Gist ID copied to clipboard');
    } else {
      setSyncStatus('No gist ID found - save data first');
    }
    setTimeout(() => setSyncStatus(''), 3000);
  };

  return {
    isConnected,
    githubToken,
    setGithubToken,
    syncStatus,
    showGistSync,
    setShowGistSync,
    gistIdInput,
    setGistIdInput,
    connectGitHub,
    saveToGist,
    loadFromGist,
    disconnectGitHub,
    setGistId,
    getCurrentGistId
  };
};