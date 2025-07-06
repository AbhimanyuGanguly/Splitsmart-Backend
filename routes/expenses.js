const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const verifyToken = require("../middleware/verifyToken");
const Settlement = require("../models/Settlement");
const mongoose = require('mongoose');
// Add expense 
router.post('/', verifyToken,async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses 
router.get('/', verifyToken,async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('group')
      .populate('paidBy')
      .populate('splitBetween');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:groupId", verifyToken,async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate("paidBy", "username")
      .populate("splitBetween", "username")
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//record a settlement
router.post("/settle", verifyToken, async (req, res) => {
  const { groupId, fromId, toId } = req.body;

  try {
    const newSettlement = new Settlement({ group: groupId, from: fromId, to: toId });
    await newSettlement.save();
    res.status(201).json({ message: "Settled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//fetch the settlements
router.get("/settlements/:groupId", verifyToken, async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const latestSettlements = await Settlement.aggregate([
      { $match: { group: new mongoose.Types.ObjectId(groupId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { from: "$from", to: "$to" },
          latestTimestamp: { $first: "$createdAt" }
        }
      }
    ]);

    res.json(latestSettlements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
