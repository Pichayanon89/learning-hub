const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middlewares/errorHandler');
const initDatabase = require('./data/initDb');

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://pichayanon89.github.io'
];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultAllowedOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Initialize Database on startup outside isolated tests.
if (process.env.NODE_ENV !== 'test') {
  initDatabase();
}

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: '256kb' }));

// Light-weight Custom CORS middleware (prevents cross-origin browser blocking)
app.use((req, res, next) => {
  const origin = req.get('origin');

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

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
