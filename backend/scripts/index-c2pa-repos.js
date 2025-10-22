#!/usr/bin/env node

/**
 * Script to index C2PA GitHub repositories into the RAG system
 * Bypasses authentication requirements by running directly on the backend
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const githubRagService = require('../src/services/githubRagService');
const githubAuthService = require('../src/services/githubAuthService');
const logger = require('../src/utils/logger');

// C2PA repositories to index
const REPOS_TO_INDEX = [
  { owner: 'c2pa-org', repo: 'specifications', description: 'Public C2PA specifications' },
  { owner: 'c2pa-org', repo: 'conformance-public', description: 'C2PA Conformance Program documentation' },
  { owner: 'c2pa-org', repo: 'public-draft', description: 'Public drafts of C2PA Specifications' },
  { owner: 'c2pa-org', repo: 'public-testfiles', description: 'Test files for C2PA implementations' },
  { owner: 'c2pa-org', repo: 'softbinding-algorithm-list', description: 'C2PA approved soft binding algorithms' }
];

async function indexAllRepos() {
  console.log('='.repeat(70));
  console.log('C2PA REPOSITORY INDEXING SCRIPT');
  console.log('='.repeat(70));
  console.log();

  // Initialize GitHub authentication with token from environment
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken || githubToken === 'your-github-token-here') {
    console.error('❌ ERROR: GitHub authentication required!');
    console.error('Please set a valid GITHUB_TOKEN in your .env file');
    console.error();
    console.error('To generate a GitHub Personal Access Token:');
    console.error('1. Go to https://github.com/settings/tokens');
    console.error('2. Click "Generate new token" > "Generate new token (classic)"');
    console.error('3. Give it a name like "C2PA RAG Indexing"');
    console.error('4. Select scope: "public_repo" (for public repositories)');
    console.error('5. Copy the token and add it to your .env file');
    process.exit(1);
  }

  // Authenticate with GitHub
  console.log('🔐 Authenticating with GitHub...');
  const authResult = await githubAuthService.authenticateWithToken(githubToken);

  if (!authResult.success) {
    console.error(`❌ Authentication failed: ${authResult.error}`);
    process.exit(1);
  }

  console.log(`✅ Authenticated as: ${authResult.user.login}`);
  console.log();

  console.log('✅ GitHub authentication verified');
  console.log();

  const results = {
    successful: [],
    failed: []
  };

  for (const { owner, repo, description } of REPOS_TO_INDEX) {
    console.log(`📦 Indexing ${owner}/${repo}`);
    console.log(`   ${description}`);
    console.log();

    try {
      const result = await githubRagService.indexRepository(owner, repo);

      if (result.success) {
        console.log(`✅ SUCCESS: ${result.message}`);
        console.log(`   Files indexed: ${result.filesIndexed}`);
        results.successful.push({ owner, repo, ...result });
      } else {
        console.log(`❌ FAILED: ${result.error}`);
        results.failed.push({ owner, repo, error: result.error });
      }
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      results.failed.push({ owner, repo, error: error.message });
    }

    console.log();
    console.log('-'.repeat(70));
    console.log();
  }

  // Summary
  console.log('='.repeat(70));
  console.log('INDEXING SUMMARY');
  console.log('='.repeat(70));
  console.log();
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log();

  if (results.successful.length > 0) {
    console.log('Successfully indexed repositories:');
    results.successful.forEach(({ owner, repo, filesIndexed }) => {
      console.log(`  - ${owner}/${repo} (${filesIndexed} files)`);
    });
    console.log();
  }

  if (results.failed.length > 0) {
    console.log('Failed repositories:');
    results.failed.forEach(({ owner, repo, error }) => {
      console.log(`  - ${owner}/${repo}: ${error}`);
    });
    console.log();
  }

  // Get all indexed repositories
  console.log('Fetching all indexed repositories...');
  const allIndexed = await githubRagService.getIndexedRepositories();
  console.log();
  console.log(`Total repositories in RAG system: ${allIndexed.length}`);
  console.log();

  process.exit(results.failed.length === 0 ? 0 : 1);
}

// Run the script
indexAllRepos().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
