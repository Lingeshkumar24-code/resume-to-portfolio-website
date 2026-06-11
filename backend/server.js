import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Rate Limiter (Custom Middleware)
const rateLimitStore = {};
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxRequests = 150; // max requests per window

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }

  // Filter out timestamps outside the window
  rateLimitStore[ip] = rateLimitStore[ip].filter((time) => now - time < windowMs);

  if (rateLimitStore[ip].length >= maxRequests) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too many requests from this IP. Please try again after 15 minutes.' 
    });
  }

  rateLimitStore[ip].push(now);
  next();
};

// Enable rate limiter on all API requests
app.use('/api/', rateLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically if needed
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Base API route
app.get('/', (req, res) => {
  res.send('Resume2Portfolio AI API is running...');
});

const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');

if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Custom Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
