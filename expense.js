const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  description: { type: String, required: true },
  paid_by: { type: String, required: true },
  split: {
    type: { type: String, enum: ['equal', 'exact', 'percentage'], default: 'equal' },
    details: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });
module.exports = mongoose.model('Expense', expenseSchema);
