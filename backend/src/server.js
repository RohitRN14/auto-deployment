const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const todoRoutes = require('./routes/todos');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/todos', todoRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Database & Server Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-todo';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅  MongoDB connected:', MONGO_URI.replace(/\/\/.*@/, '//***@'));

    const server = app.listen(PORT, () => {
      console.log(`🚀  Backend running on http://localhost:${PORT}`);
      console.log(`📋  Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received – shutting down gracefully');
      server.close(() => {
        mongoose.connection.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received – shutting down gracefully');
      server.close(() => {
        mongoose.connection.close();
        process.exit(0);
      });
    });

    return server;
  } catch (err) {
    console.error('❌  Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app; // for testing
