const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const verifyToken = require("../middleware/verifyToken");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");

//get all groups
router.get('/', verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate("members", "username")
      .populate("createdBy", "username");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create group
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, members } = req.body;
    const userDocs = [];

    for (let username of members) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: `User "${username}" not found.` });
      }
      userDocs.push(user._id);
    }

    if (!userDocs.some(id => id.toString() === req.user.id)) {
      userDocs.push(req.user.id);
    }

    const group = new Group({
      name,
      members: userDocs,
      createdBy: req.user.id
    });

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//delete group
router.delete("/:groupId", verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.createdBy.toString() !== req.user.id)
      return res.status(403).json({ error: "Only the creator can delete the group" });
    await Expense.deleteMany({ group: group._id });
    await Settlement.deleteMany({ group: group._id });
    await group.deleteOne();

    res.json({ message: "Group, expenses, and settlements deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// get group
router.get('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      members: req.user.id
    }).populate("members", "username");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
