const { Octokit } = require('@octokit/rest');
const { createOAuthDeviceAuth } = require('@octokit/auth-oauth-device');
const logger = require('../utils/logger');

/**
 * GitHub Authentication Service
 * Handles GitHub authentication using OAuth Device Flow or Personal Access Token
 */

class GitHubAuthService {
  constructor() {
    this.octokit = null;
    this.authenticatedUser = null;
  }

  /**
   * Authenticate using GitHub Personal Access Token
   * This is the simplest method - user provides their token
   */
  async authenticateWithToken(token) {
    try {
      this.octokit = new Octokit({
        auth: token
      });

      // Verify the token by fetching authenticated user
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      this.authenticatedUser = user;

      logger.info(`GitHub authenticated as: ${user.login}`);
      return {
        success: true,
        user: {
          login: user.login,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url
        }
      };
    } catch (error) {
      logger.error('GitHub authentication failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Authenticate using OAuth Device Flow
   * This allows users to authenticate through GitHub's web interface
   */
  async authenticateWithDeviceFlow(clientId) {
    try {
      const auth = createOAuthDeviceAuth({
        clientId: clientId,
        onVerification: (verification) => {
          logger.info('GitHub Device Flow Authentication:');
          logger.info(`Please visit: ${verification.verification_uri}`);
          logger.info(`Enter code: ${verification.user_code}`);

          return verification;
        }
      });

      const { token } = await auth();
      return await this.authenticateWithToken(token);
    } catch (error) {
      logger.error('GitHub OAuth Device Flow failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.octokit !== null && this.authenticatedUser !== null;
  }

  /**
   * Get authenticated user info
   */
  getAuthenticatedUser() {
    return this.authenticatedUser;
  }

  /**
   * Get Octokit instance
   */
  getOctokit() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate first.');
    }
    return this.octokit;
  }

  /**
   * Logout - clear authentication
   */
  logout() {
    this.octokit = null;
    this.authenticatedUser = null;
    logger.info('GitHub logged out');
  }
}

// Singleton instance
const githubAuthService = new GitHubAuthService();

module.exports = githubAuthService;
