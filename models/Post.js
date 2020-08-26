const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  like: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Like',
  },
  likes: {type: Number, default: 0},
  content: String,
  create_date: Date,
  edit_date: { type: Date, default: null },
  
});

module.exports = mongoose.model('Post', PostSchema);
