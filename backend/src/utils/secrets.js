const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Secure secrets management utility
 * Priority order:
 * 1. Docker secrets (/run/secrets/)
 * 2. File-based secrets (./config/secrets.json) with restricted permissions
 * 3. Environment variables (fallback for development)
 */

/**
 * Read a secret from Docker secrets directory
 */
function readDockerSecret(secretName) {
  try {
    // Try standard Docker secrets path first
    let secretPath = path.join('/run/secrets', secretName.toLowerCase());
    if (fs.existsSync(secretPath)) {
      const secret = fs.readFileSync(secretPath, 'utf8').trim();
      if (secret) {
        logger.info(`Loaded secret '${secretName}' from Docker secrets`);
        return secret;
      }
    }

    // Also try with original case (for compatibility)
    secretPath = path.join('/run/secrets', secretName);
    if (fs.existsSync(secretPath)) {
      const secret = fs.readFileSync(secretPath, 'utf8').trim();
      if (secret) {
        logger.info(`Loaded secret '${secretName}' from Docker secrets`);
        return secret;
      }
    }
  } catch (error) {
    // Silently fail, will try next method
  }
  return null;
}

/**
 * Read secrets from file-based secrets with permission check
 */
function readFileSecret(secretName) {
  try {
    const secretsPath = path.join(__dirname, '../../config/secrets.json');

    if (!fs.existsSync(secretsPath)) {
      return null;
    }

    // Check file permissions (should be 600 or 400)
    const stats = fs.statSync(secretsPath);
    const mode = stats.mode & parseInt('777', 8);

    if (mode > parseInt('600', 8)) {
      logger.warn(`secrets.json has insecure permissions (${mode.toString(8)}). Should be 600 or 400.`);
    }

    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

    if (secrets[secretName]) {
      logger.info(`Loaded secret '${secretName}' from secrets file`);
      return secrets[secretName];
    }
  } catch (error) {
    // Silently fail, will try next method
  }
  return null;
}

/**
 * Read secret from environment variable
 */
function readEnvSecret(secretName) {
  const value = process.env[secretName];
  if (value) {
    logger.info(`Loaded secret '${secretName}' from environment variable`);
    return value;
  }
  return null;
}

/**
 * Get a secret using priority order:
 * 1. Docker secrets
 * 2. File-based secrets
 * 3. Environment variables
 */
function getSecret(secretName) {
  // Try Docker secrets first (most secure)
  let secret = readDockerSecret(secretName);
  if (secret) return secret;

  // Try file-based secrets (secure for local development)
  secret = readFileSecret(secretName);
  if (secret) return secret;

  // Fall back to environment variables (least secure, but convenient)
  secret = readEnvSecret(secretName);
  if (secret) return secret;

  logger.warn(`Secret '${secretName}' not found in any secure location`);
  return null;
}

/**
 * Set a secret by writing to file-based secrets
 * This is used for admin-configurable secrets (API keys, tokens, etc.)
 */
function setSecret(secretName, secretValue) {
  try {
    const configDir = path.join(__dirname, '../../config');
    const secretsPath = path.join(configDir, 'secrets.json');

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Read existing secrets or create new object
    let secrets = {};
    if (fs.existsSync(secretsPath)) {
      try {
        secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
      } catch (e) {
        logger.warn('Could not parse existing secrets.json, creating new file');
      }
    }

    // Update the secret
    secrets[secretName] = secretValue;

    // Write back to file with secure permissions
    fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2), { mode: 0o600 });

    logger.info(`Secret '${secretName}' has been updated in secrets file`);
    return true;
  } catch (error) {
    logger.error(`Error setting secret '${secretName}':`, error);
    return false;
  }
}

/**
 * Validate that secrets file has correct permissions
 */
function validateSecretsFile() {
  try {
    const secretsPath = path.join(__dirname, '../../config/secrets.json');

    if (!fs.existsSync(secretsPath)) {
      return { valid: true, message: 'No secrets file exists' };
    }

    const stats = fs.statSync(secretsPath);
    const mode = stats.mode & parseInt('777', 8);

    if (mode > parseInt('600', 8)) {
      return {
        valid: false,
        message: `secrets.json has insecure permissions (${mode.toString(8)}). Run: chmod 600 config/secrets.json`
      };
    }

    return { valid: true, message: 'Secrets file has secure permissions' };
  } catch (error) {
    return { valid: false, message: `Error checking secrets file: ${error.message}` };
  }
}

module.exports = {
  getSecret,
  setSecret,
  validateSecretsFile
};
