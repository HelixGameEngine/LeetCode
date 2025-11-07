const GIST_CONFIG = {
  DESCRIPTION: 'LeetCode Tracker Data',
  FILENAME: 'leetcode-tracker.json'
};

class GistStorage {
  constructor() {
    this.token = localStorage.getItem('github-token');
    this.gistId = localStorage.getItem('gist-id');
  }

  // Safe token setup - user enters their own token
  setToken(token) {
    this.token = token;
    localStorage.setItem('github-token', token);
  }

  async createGist(data) {
    if (!this.token) throw new Error('GitHub token required');

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: GIST_CONFIG.DESCRIPTION,
        public: false, // Private gist for security
        files: {
          [GIST_CONFIG.FILENAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      let body;
      try { body = JSON.parse(text); } catch { body = text; }
      const message = body && body.message ? body.message : text || response.statusText;
      const err = new Error(`Create gist failed: ${response.status} ${response.statusText} - ${message}`);
      // attach extra info for programmatic handling
      err.status = response.status;
      err.body = body;
      throw err;
    }

    const gist = await response.json();
    this.gistId = gist.id;
    localStorage.setItem('gist-id', gist.id);
    return gist;
  }

  async updateGist(data) {
    if (!this.token || !this.gistId) throw new Error('GitHub token and gist ID required');

    const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [GIST_CONFIG.FILENAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      let body;
      try { body = JSON.parse(text); } catch { body = text; }
      const message = body && body.message ? body.message : text || response.statusText;
      const err = new Error(`Update gist failed: ${response.status} ${response.statusText} - ${message}`);
      err.status = response.status;
      err.body = body;
      throw err;
    }
    return response.json();
  }

  async loadGist() {
    if (!this.gistId) throw new Error('No gist ID found');

    const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      headers: this.token ? { 'Authorization': `token ${this.token}` } : {}
    });

    if (!response.ok) {
      const text = await response.text();
      let body;
      try { body = JSON.parse(text); } catch { body = text; }
      const message = body && body.message ? body.message : text || response.statusText;
      const err = new Error(`Load gist failed: ${response.status} ${response.statusText} - ${message}`);
      err.status = response.status;
      err.body = body;
      throw err;
    }

    const gist = await response.json();
    const content = gist.files[GIST_CONFIG.FILENAME]?.content;
    return content ? JSON.parse(content) : null;
  }

  async saveData(data) {
    try {
      if (this.gistId) {
        try {
          return await this.updateGist(data);
        } catch (err) {
          // If the stored gist ID was deleted or invalid, try creating a new gist
          if (err && err.status === 404) {
            console.warn('Stored gist ID not found, creating a new gist');
            this.gistId = null;
            localStorage.removeItem('gist-id');
            return await this.createGist(data);
          }
          throw err;
        }
      } else {
        return await this.createGist(data);
      }
    } catch (error) {
      console.error('Error saving to gist:', error);
      throw error;
    }
  }

  async loadData() {
    try {
      return await this.loadGist();
    } catch (error) {
      console.error('Error loading from gist:', error);
      throw error;
    }
  }

  disconnect() {
    localStorage.removeItem('github-token');
    localStorage.removeItem('gist-id');
    this.token = null;
    this.gistId = null;
  }

  isConnected() {
    return !!this.token;
  }
}

export default GistStorage;