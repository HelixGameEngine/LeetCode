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

  // Set gist ID manually (for syncing across devices)
  setGistId(gistId) {
    this.gistId = gistId;
    localStorage.setItem('gist-id', gistId);
  }

  // List user's gists to find existing LeetCode tracker gists
  async listGists() {
    if (!this.token) throw new Error('GitHub token required');

    const authHeader = this.token.startsWith('github_pat_')
      ? `Bearer ${this.token}`
      : `token ${this.token}`;

    const response = await fetch('https://api.github.com/gists?per_page=100', {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      const text = await response.text();
      let body;
      try { body = JSON.parse(text); } catch { body = text; }
      const message = body && body.message ? body.message : text || response.statusText;
      throw new Error(`List gists failed: ${response.status} ${response.statusText} - ${message}`);
    }

    const gists = await response.json();
    // Filter for LeetCode tracker gists
    return gists.filter(gist =>
      gist.description === GIST_CONFIG.DESCRIPTION &&
      gist.files[GIST_CONFIG.FILENAME]
    );
  }

  async createGist(data) {
    if (!this.token) throw new Error('GitHub token required');

    // Support both classic (ghp_) and fine-grained (github_pat_) tokens
    const authHeader = this.token.startsWith('github_pat_')
      ? `Bearer ${this.token}`
      : `token ${this.token}`;

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
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

    // Support both classic (ghp_) and fine-grained (github_pat_) tokens
    const authHeader = this.token.startsWith('github_pat_')
      ? `Bearer ${this.token}`
      : `token ${this.token}`;

    const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
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

    // Support both classic (ghp_) and fine-grained (github_pat_) tokens
    const authHeader = this.token && this.token.startsWith('github_pat_')
      ? `Bearer ${this.token}`
      : `token ${this.token}`;

    const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      headers: this.token ? { 'Authorization': authHeader } : {}
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
      // If no gist ID, try to find existing LeetCode tracker gists
      if (!this.gistId) {
        try {
          const existingGists = await this.listGists();
          if (existingGists.length > 0) {
            // Use the most recent LeetCode tracker gist
            const mostRecent = existingGists.sort((a, b) =>
              new Date(b.updated_at) - new Date(a.updated_at)
            )[0];
            this.gistId = mostRecent.id;
            localStorage.setItem('gist-id', mostRecent.id);
            console.log(`Found existing LeetCode tracker gist: ${mostRecent.id}`);
          }
        } catch (error) {
          console.warn('Could not search for existing gists:', error.message);
        }
      }

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

  getCurrentGistId() {
    return this.gistId;
  }
}

export default GistStorage;