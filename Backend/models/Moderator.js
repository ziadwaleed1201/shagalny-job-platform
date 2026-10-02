const mongoose = require('mongoose');

const moderatorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Moderator', moderatorSchema);
