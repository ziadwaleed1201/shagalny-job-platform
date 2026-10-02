// Shagalny API — Express server entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || '*';
app.use(cors({
  origin: clientOrigin === '*' ? true : clientOrigin.split(',').map((s) => s.trim()),
  credentials: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, name: 'Shagalny API', version: '2.0.0' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Routes (matches the old ERD + payment system)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vacancies', require('./routes/vacancyRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/saved-jobs', require('./routes/savedJobRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Shagalny API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
  });
