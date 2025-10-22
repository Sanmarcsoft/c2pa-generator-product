const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const { initDatabase } = require('./models/database');

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat');
const sessionsRoutes = require('./routes/sessions');
const progressRoutes = require('./routes/progress');
const c2paRoutes = require('./routes/c2pa');
const githubRoutes = require('./routes/github');
const settingsRoutes = require('./routes/settings');
const phase1Routes = require('./routes/phase1');
const adventureRoutes = require('./routes/adventure');
const adminRoutes = require('./routes/admin');
const openaiCompatRoutes = require('./routes/openai-compat');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to allow React app to load
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../data/uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'C2PA Generator Assistant API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat/sessions', sessionsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/c2pa', c2paRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/phase1', phase1Routes);
app.use('/api/adventure', adventureRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1', openaiCompatRoutes);

// Serve static frontend files (for production)
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`
    });
  }

  // Serve the React app
  const indexPath = path.join(__dirname, '../public/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error('Error serving index.html:', err);
      res.status(404).json({
        error: 'Not Found',
        message: 'Frontend not found. Please rebuild the Docker image.'
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Store server instance for graceful shutdown
let server;

// Initialize database and start server
async function startServer() {
  try {
    // Step 1: Auto-restore database from backup if needed
    logger.info('Checking for database backup...');
    try {
      const { checkAndRestore } = require('../scripts/auto-restore-db');
      await checkAndRestore();
    } catch (error) {
      logger.warn('Auto-restore check failed, continuing with existing database:', error.message);
    }

    // Step 2: Initialize database
    await initDatabase();
    logger.info('Database initialized successfully');

    // Step 3: Start server
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   C2PA Generator Product Certification Assistant          ║
║   8-bit Atari Style AI Assistant                          ║
║                                                            ║
║   Server running on port ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║   Time: ${new Date().toISOString()}              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
