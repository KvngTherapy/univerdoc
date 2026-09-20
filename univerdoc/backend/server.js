require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const deptRoutes = require('./routes/dept');
const studentRoutes = require('./routes/student');
const filesRoutes = require('./routes/files');
const { initWeeklySummaryCron } = require('./jobs/weeklySummary');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://cruel-moments-travel.loca.lt'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (PDFs, images)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dept', deptRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/files', filesRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'UniverDoc',
    institution: 'Petroleum Training Institute (PTI), Effurun, Delta State, Nigeria',
    regulatory: 'NBTE',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  if (err instanceof Error && err.message) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

// Start scheduled weekly summaries
initWeeklySummaryCron();

let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` UniverDoc Backend Running on port ${PORT}`);
    console.log(` Petroleum Training Institute (PTI), Effurun`);
    console.log(` Base API: http://localhost:${PORT}/api`);
    console.log(` Health:   http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server };