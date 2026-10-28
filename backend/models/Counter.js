/**
 * Counter Model for Per-Year Atomic Movie Code Sequences
 * _id: String representing release year (e.g., '2024')
 * seq: Number representing the sequential counter for that year
 */
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true
    },
    seq: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
