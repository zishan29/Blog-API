const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  username: { type: String, required: [true, 'Please provide a username'] },
  email: { type: String, required: [true, 'Please provide a email'] },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    minLength: 3,
  },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  timeStamp: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('Comment', CommentSchema);
