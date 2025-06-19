require('dotenv').config();
const express = require('express'), mongoose = require('mongoose'),
      cors = require('cors');
const expensesRouter = require('./routes/expenses'),
      settleRouter = require('./routes/settlements');

const app = express();
app.use(cors(), express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

app.use('/expenses', expensesRouter);
app.use('/', settleRouter);

app.listen(process.env.PORT || 5000, () => console.log('Server started'));
