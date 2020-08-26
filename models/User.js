const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  image: String,
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Like',
    },
  ],
});

module.exports = mongoose.model('User', UserSchema);
