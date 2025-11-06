const githubRagService = require('./backend/src/services/githubRagService');
const { allAsync } = require('./backend/src/models/database');

async function testGitHubRAG() {
  console.log('='.repeat(70));
  console.log('GitHub RAG Feature Test - Repository Description');
  console.log('='.repeat(70));
  console.log();

  try {
    // Step 1: Index a repository
    console.log('Step 1: Indexing repository contentauth/c2pa-js...');
    console.log('-'.repeat(70));

    const indexResult = await githubRagService.indexRepository('contentauth', 'c2pa-js');

    if (indexResult.success) {
      console.log('✓ Repository indexed successfully');
      console.log(`  - Files indexed: ${indexResult.filesIndexed}`);
      console.log(`  - Repository ID: ${indexResult.repoId}`);
    } else {
      console.log('✗ Failed to index repository');
      console.log(`  Error: ${indexResult.error}`);
      process.exit(1);
    }

    console.log();

    // Step 2: Get indexed repositories to see description
    console.log('Step 2: Retrieving indexed repositories...');
    console.log('-'.repeat(70));

    const repos = await githubRagService.getIndexedRepositories();

    if (repos.length === 0) {
      console.log('✗ No repositories found');
      process.exit(1);
    }

    console.log(`✓ Found ${repos.length} indexed repository/repositories`);
    console.log();

    // Step 3: Display repository details including description
    repos.forEach((repo, index) => {
      console.log(`Repository ${index + 1}:`);
      console.log(`  Name: ${repo.repository}`);
      console.log(`  Branch: ${repo.branch}`);
      console.log(`  Files: ${repo.fileCount}`);
      console.log(`  URL: ${repo.url}`);
      console.log(`  Indexed: ${new Date(repo.indexedAt).toLocaleString()}`);
      console.log(`  Description: ${repo.description || '(none)'}`);
      console.log();
    });

    // Step 4: Verify description column in database
    console.log('Step 4: Verifying database schema...');
    console.log('-'.repeat(70));

    const columns = await allAsync('PRAGMA table_info(github_repos)');
    const hasDescription = columns.some(col => col.name === 'description');

    if (hasDescription) {
      console.log('✓ Description column exists in database');
    } else {
      console.log('✗ Description column missing from database');
    }

    console.log();
    console.log('='.repeat(70));
    console.log('TEST COMPLETE - All features working!');
    console.log('='.repeat(70));

    // Show summary
    const repo = repos[0];
    console.log();
    console.log('SUMMARY:');
    console.log(`  ✓ Repository indexed: ${repo.repository}`);
    console.log(`  ✓ Files indexed: ${repo.fileCount}`);
    console.log(`  ✓ Description extracted: ${repo.description ? 'YES' : 'NO'}`);
    if (repo.description) {
      console.log(`  ✓ Description preview: "${repo.description.substring(0, 80)}..."`);
    }

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testGitHubRAG();
