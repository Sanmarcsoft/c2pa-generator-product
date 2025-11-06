const { runAsync, allAsync } = require('./src/models/database');

async function checkRepos() {
  try {
    // First add the description column
    try {
      await runAsync('ALTER TABLE github_repos ADD COLUMN description TEXT');
      console.log('Description column added');
    } catch (err) {
      if (err.message.includes('duplicate column')) {
        console.log('Description column already exists');
      } else {
        throw err;
      }
    }

    // Now query the repositories
    const repos = await allAsync('SELECT id, repo_owner, repo_name, file_count FROM github_repos');
    console.log('\nIndexed Repositories:');
    console.log(JSON.stringify(repos, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkRepos();
