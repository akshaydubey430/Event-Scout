require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const passport = require('./config/passport');
const { initCronJobs } = require('./jobs/cronJobs');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRequestRoutes = require('./routes/ticketRequests');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ticket-requests', ticketRequestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manual scrape trigger (protected in production)
app.post('/api/scrape/trigger', async (req, res) => {
  if (process.env.NODE_ENV === 'production' && !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { triggerImmediateScrape } = require('./jobs/cronJobs');
  
  try {
    const stats = await triggerImmediateScrape();
    res.json({ message: 'Scrape completed', stats });
  } catch (error) {
    res.status(500).json({ error: 'Scrape failed', message: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Initialize cron jobs
    initCronJobs();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  const { stopCronJobs } = require('./jobs/cronJobs');
  stopCronJobs();
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
