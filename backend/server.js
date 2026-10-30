const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDB, sequelize } = require('./config/db');
require('./models'); // Load models and associations

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
let databaseInitialization;

// Ensure uploads and certificates directories exist
const uploadDir = path.join(__dirname, 'uploads');
const certificateDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(certificateDir)) {
  fs.mkdirSync(certificateDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const initializeDatabase = () => {
  if (!databaseInitialization) {
    databaseInitialization = (async () => {
      await initDB();
      await sequelize.sync({ alter: false });
      console.log('[Database] Sequelize models synchronized with MySQL.');
    })().catch((error) => {
      databaseInitialization = null;
      throw error;
    });
  }

  return databaseInitialization;
};

app.use((req, res, next) => {
  initializeDatabase().then(() => next()).catch(next);
});

// Serve static files for uploaded posters and generated certificates
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'University Event Management System API is operating normally.',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Database Connection and Server Initialization
const startServer = async () => {
  try {
    await initializeDatabase();

    // 3. Start listening on specified port
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 University Event Management API Server running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`📂 Client Allowed: ${CLIENT_URL}`);
      console.log(`💾 MySQL DB: ${process.env.DB_NAME || 'university_events'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize and start server:', error.message);
    process.exit(1);
  }
};

// Start the server if this script is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
