const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Load .env variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend (if using React build folder)
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import routes
const expenseRoutes = require('./routes/expense');
const settlementRoutes = require('./routes/settlements');

app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
