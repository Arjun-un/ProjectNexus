const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./db/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

// Initialize Database Connection
connectDB();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ProjectNexus API Server is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route Mounts
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/webhooks', webhookRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/milestones', milestoneRoutes);
// app.use('/api/updates', updateRoutes);
// app.use('/api/handovers', handoverRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ProjectNexus Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
