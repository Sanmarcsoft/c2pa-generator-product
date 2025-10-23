#!/usr/bin/env node

const net = require('net');

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, '0.0.0.0');
  });
}

/**
 * Find an available port in the given range
 */
async function findAvailablePort(startPort = 8080, endPort = 8090) {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No available ports found in range ${startPort}-${endPort}`);
}

// Run if called directly
if (require.main === module) {
  const startPort = parseInt(process.argv[2]) || 8080;
  const endPort = parseInt(process.argv[3]) || 8090;

  findAvailablePort(startPort, endPort)
    .then((port) => {
      console.log(port);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { isPortAvailable, findAvailablePort };
