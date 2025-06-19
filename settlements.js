const express = require('express'), Expense = require('../models/expense');
const router = express.Router();

async function fetchExpenses() { return await Expense.find().lean(); }

function calculateBalances(expenses) {
  const totalSpent = {}, fairShare = {};
  const people = new Set();

  expenses.forEach(e => {
    people.add(e.paid_by);
    totalSpent[e.paid_by] = (totalSpent[e.paid_by] || 0) + e.amount;

    let splitDetails = {};
    if (!e.split || e.split.type === 'equal') {
      const perPerson = e.amount / (expenses.map(x => x.paid_by).filter(p => true).length);
      splitDetails = Object.fromEntries([...people].map(p => [p, perPerson]));
    } else if (e.split.type === 'exact') {
      splitDetails = e.split.details;
    } else if (e.split.type === 'percentage') {
      splitDetails = {};
      Object.entries(e.split.details).forEach(([p, pct]) => {
        splitDetails[p] = e.amount * pct / 100;
        people.add(p);
      });
    }

    Object.entries(splitDetails).forEach(([p, share]) => {
      fairShare[p] = (fairShare[p] || 0) + share;
      people.add(p);
    });
  });

  const balances = {};
  [...people].forEach(p => {
    balances[p] = (totalSpent[p] || 0) - (fairShare[p] || 0);
  });
  return balances;
}

router.get('/balances', async (req, res) => {
  const exp = await fetchExpenses();
  if (exp.length === 0) return res.json({ success: true, data: {} });
  const balances = calculateBalances(exp);
  res.json({ success: true, data: balances });
});

router.get('/people', async (req, res) => {
  const people = [...new Set((await fetchExpenses()).flatMap(e => [e.paid_by, ...(e.split?.details ? Object.keys(e.split.details) : [])]))];
  res.json({ success: true, data: people });
});

router.get('/settlements', async (req, res) => {
  const balances = (await router.handle({})).data;  // hack, adjust in real code
  const debtors = [], creditors = [];
  Object.entries(balances).forEach(([p, b]) => {
    if (b > 0) creditors.push({ name: p, amount: b });
    else if (b < 0) debtors.push({ name: p, amount: -b });
  });

  const settlements = [];
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i], c = creditors[j];
    const settleAmount = Math.min(d.amount, c.amount);
    settlements.push({ from: d.name, to: c.name, amount: parseFloat(settleAmount.toFixed(2)) });
    d.amount -= settleAmount;
    c.amount -= settleAmount;
    if (d.amount === 0) i++;
    if (c.amount === 0) j++;
  }

  res.json({ success: true, data: settlements });
});

module.exports = router;
