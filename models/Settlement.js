const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Settlement", settlementSchema);
