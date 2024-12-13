const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const problemSchema = new mongoose.Schema({
  problem: {
    type: String,
    required: true
  },
  answers: [answerSchema], // Array of answerSchema
  name: {
    type: String,
    required: true
  }
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
