const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middlewares/errorHandler');
const initDatabase = require('./data/initDb');

const app = express();

// Initialize Database on startup
initDatabase();

app.use(express.json());

// Light-weight Custom CORS middleware (prevents cross-origin browser blocking)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve Vite frontend build static assets in production
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// API Routes
app.use('/users', userRoutes); // keep for existing tests compatibility
app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes);

// SPA client-side routing fallback: serve index.html for non-API requests in production
// Compatible with both Express 4 and Express 5 (no path-to-regexp wildcard issues)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/users')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Listen to port 3000 if executed directly (e.g. npm start)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
  });
}

module.exports = app;
