const githubAuthService = require('./githubAuthService');
const { runAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');
const path = require('path');

/**
 * GitHub RAG Service
 * Indexes and searches GitHub repository content for RAG functionality
 */

// File extensions to index (text-based files)
const INDEXABLE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h',
  '.md', '.txt', '.json', '.yml', '.yaml', '.xml', '.html', '.css', '.scss',
  '.sh', '.bash', '.sql', '.rb', '.php', '.swift', '.kt', '.scala', '.r',
  '.toml', '.ini', '.cfg', '.conf', '.env.example', '.gitignore', 'Dockerfile',
  'Makefile', 'README', 'LICENSE', 'CHANGELOG'
];

// Files to ignore
const IGNORE_PATTERNS = [
  'node_modules/', 'vendor/', '.git/', 'dist/', 'build/', 'target/',
  '.next/', '__pycache__/', '.idea/', '.vscode/', 'coverage/',
  '*.min.js', '*.min.css', 'package-lock.json', 'yarn.lock'
];

class GitHubRagService {
  constructor() {
    this.indexedRepos = new Map(); // Cache indexed repos
  }

  /**
   * Check if file should be indexed
   */
  shouldIndexFile(filePath, fileName) {
    // Check ignore patterns
    for (const pattern of IGNORE_PATTERNS) {
      if (filePath.includes(pattern)) {
        return false;
      }
    }

    // Check file extension or special files
    const ext = path.extname(fileName).toLowerCase();
    const hasIndexableExt = INDEXABLE_EXTENSIONS.some(indexExt =>
      ext === indexExt || fileName === indexExt
    );

    return hasIndexableExt;
  }

  /**
   * Fetch repository tree (all files) from GitHub
   */
  async fetchRepositoryTree(owner, repo, branch = 'main') {
    try {
      const octokit = githubAuthService.getOctokit();

      // Get default branch if not specified
      if (!branch) {
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
        branch = repoData.default_branch;
      }

      // Get the tree (recursive to get all files)
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });

      const treeSha = refData.object.sha;

      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: 'true'
      });

      return treeData.tree;
    } catch (error) {
      logger.error(`Error fetching repository tree: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch file content from GitHub
   */
  async fetchFileContent(owner, repo, filePath) {
    try {
      const octokit = githubAuthService.getOctokit();

      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath
      });

      if (data.type !== 'file') {
        return null;
      }

      // Decode base64 content
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      return content;
    } catch (error) {
      logger.warn(`Error fetching file ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Index a GitHub repository into the database
   */
  async indexRepository(owner, repo, branch = 'main') {
    try {
      logger.info(`Starting to index repository: ${owner}/${repo}`);

      if (!githubAuthService.isAuthenticated()) {
        throw new Error('GitHub authentication required. Please authenticate first.');
      }

      const repoKey = `${owner}/${repo}`;

      // Check if already indexed recently
      const existingRepo = await allAsync(
        'SELECT * FROM github_repos WHERE repo_owner = ? AND repo_name = ? AND branch = ?',
        [owner, repo, branch]
      );

      let repoId;
      if (existingRepo.length > 0) {
        repoId = existingRepo[0].id;
        logger.info(`Repository already indexed. Updating...`);
      } else {
        // Create new repo entry
        const result = await runAsync(
          `INSERT INTO github_repos (repo_owner, repo_name, branch, indexed_at, file_count)
           VALUES (?, ?, ?, datetime('now'), 0)`,
          [owner, repo, branch]
        );
        repoId = result.lastID;
      }

      // Fetch repository description from README.md
      let description = null;
      try {
        const readmeContent = await this.fetchFileContent(owner, repo, 'README.md');
        if (readmeContent) {
          // Extract first meaningful paragraph (skipping title and badges)
          const lines = readmeContent.split('\n');
          let foundDescription = false;
          for (const line of lines) {
            const trimmed = line.trim();
            // Skip empty lines, titles (#), badges ([![), and very short lines
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('[![') && !trimmed.startsWith('<') && trimmed.length > 30) {
              description = trimmed.substring(0, 200); // Limit to 200 chars
              foundDescription = true;
              break;
            }
          }
          logger.info(`Extracted description: ${description || 'None found'}`);
        }
      } catch (error) {
        logger.warn(`Could not fetch README for description: ${error.message}`);
      }

      // Fetch repository tree
      const tree = await this.fetchRepositoryTree(owner, repo, branch);

      // Filter files to index
      const filesToIndex = tree.filter(item =>
        item.type === 'blob' && this.shouldIndexFile(item.path, path.basename(item.path))
      );

      logger.info(`Found ${filesToIndex.length} files to index`);

      let indexedCount = 0;
      const batchSize = 10;

      // Index files in batches
      for (let i = 0; i < filesToIndex.length; i += batchSize) {
        const batch = filesToIndex.slice(i, i + batchSize);

        await Promise.all(batch.map(async (file) => {
          try {
            const content = await this.fetchFileContent(owner, repo, file.path);

            if (content && content.length > 0) {
              // Store file in database
              await runAsync(
                `INSERT OR REPLACE INTO github_files
                 (repo_id, file_path, file_name, file_extension, content, size, indexed_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
                [
                  repoId,
                  file.path,
                  path.basename(file.path),
                  path.extname(file.path),
                  content,
                  file.size
                ]
              );

              indexedCount++;

              if (indexedCount % 50 === 0) {
                logger.info(`Indexed ${indexedCount}/${filesToIndex.length} files...`);
              }
            }
          } catch (error) {
            logger.warn(`Failed to index file ${file.path}: ${error.message}`);
          }
        }));
      }

      // Update repo with file count and description
      await runAsync(
        'UPDATE github_repos SET file_count = ?, description = ?, indexed_at = datetime("now") WHERE id = ?',
        [indexedCount, description, repoId]
      );

      logger.info(`Successfully indexed ${indexedCount} files from ${owner}/${repo}`);

      // Cache the indexed repo
      this.indexedRepos.set(repoKey, {
        repoId,
        owner,
        repo,
        branch,
        fileCount: indexedCount,
        indexedAt: new Date()
      });

      return {
        success: true,
        repoId,
        filesIndexed: indexedCount,
        message: `Successfully indexed ${indexedCount} files from ${owner}/${repo}`
      };

    } catch (error) {
      logger.error(`Error indexing repository: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search indexed GitHub repositories for relevant content
   */
  async searchRepositories(keywords, repoFilter = null, limit = 5) {
    try {
      let query = `
        SELECT
          gf.id,
          gf.file_path,
          gf.file_name,
          gf.content,
          gr.repo_owner,
          gr.repo_name,
          gr.branch
        FROM github_files gf
        JOIN github_repos gr ON gf.repo_id = gr.id
      `;

      const params = [];

      // Add repo filter if specified
      if (repoFilter) {
        const [owner, repo] = repoFilter.split('/');
        query += ` WHERE gr.repo_owner = ? AND gr.repo_name = ?`;
        params.push(owner, repo);
      }

      const files = await allAsync(query, params);

      if (files.length === 0) {
        return [];
      }

      const results = [];

      // Score each file based on keyword matches
      for (const file of files) {
        let score = 0;
        const contentLower = file.content.toLowerCase();
        const filePathLower = file.file_path.toLowerCase();
        const fileNameLower = file.file_name.toLowerCase();

        keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();

          // Count matches in content
          const contentMatches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
          score += contentMatches * 5;

          // Bonus for filename matches
          if (fileNameLower.includes(keywordLower)) {
            score += 20;
          }

          // Bonus for path matches
          if (filePathLower.includes(keywordLower)) {
            score += 10;
          }
        });

        if (score > 0) {
          // Extract relevant excerpt
          const excerpt = this.extractRelevantExcerpt(file.content, keywords);

          results.push({
            fileId: file.id,
            fileName: file.file_name,
            filePath: file.file_path,
            repository: `${file.repo_owner}/${file.repo_name}`,
            branch: file.branch,
            score,
            excerpt,
            url: `https://github.com/${file.repo_owner}/${file.repo_name}/blob/${file.branch}/${file.file_path}`
          });
        }
      }

      // Sort by score and limit
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      logger.error('Error searching GitHub repositories:', error);
      return [];
    }
  }

  /**
   * Extract relevant excerpt from file content
   */
  extractRelevantExcerpt(content, keywords, maxLength = 400) {
    if (!content || content.length === 0) {
      return '';
    }

    // Find the first occurrence of any keyword
    let bestPosition = -1;
    let bestKeyword = '';

    keywords.forEach(keyword => {
      const position = content.toLowerCase().indexOf(keyword.toLowerCase());
      if (position !== -1 && (bestPosition === -1 || position < bestPosition)) {
        bestPosition = position;
        bestKeyword = keyword;
      }
    });

    if (bestPosition === -1) {
      // No keyword found, return beginning
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Extract context around keyword (show code/text around it)
    const lines = content.split('\n');
    let currentPos = 0;
    let targetLine = 0;

    // Find which line contains the keyword
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= bestPosition) {
        targetLine = i;
        break;
      }
      currentPos += lines[i].length + 1; // +1 for newline
    }

    // Get context (3 lines before and after)
    const startLine = Math.max(0, targetLine - 3);
    const endLine = Math.min(lines.length, targetLine + 4);

    let excerpt = lines.slice(startLine, endLine).join('\n');

    if (startLine > 0) excerpt = '...\n' + excerpt;
    if (endLine < lines.length) excerpt = excerpt + '\n...';

    // Truncate if still too long
    if (excerpt.length > maxLength) {
      excerpt = excerpt.substring(0, maxLength) + '...';
    }

    return excerpt;
  }

  /**
   * Get list of indexed repositories
   */
  async getIndexedRepositories() {
    try {
      const repos = await allAsync(`
        SELECT
          id,
          repo_owner,
          repo_name,
          branch,
          file_count,
          description,
          indexed_at
        FROM github_repos
        ORDER BY indexed_at DESC
      `);

      return repos.map(repo => ({
        id: repo.id,
        repository: `${repo.repo_owner}/${repo.repo_name}`,
        owner: repo.repo_owner,
        name: repo.repo_name,
        branch: repo.branch,
        fileCount: repo.file_count,
        description: repo.description,
        indexedAt: repo.indexed_at,
        url: `https://github.com/${repo.repo_owner}/${repo.repo_name}`
      }));
    } catch (error) {
      logger.error('Error getting indexed repositories:', error);
      return [];
    }
  }

  /**
   * Delete an indexed repository
   */
  async deleteIndexedRepository(repoId) {
    try {
      await runAsync('DELETE FROM github_files WHERE repo_id = ?', [repoId]);
      await runAsync('DELETE FROM github_repos WHERE id = ?', [repoId]);

      logger.info(`Deleted repository index: ${repoId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting repository index:', error);
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const githubRagService = new GitHubRagService();

module.exports = githubRagService;
