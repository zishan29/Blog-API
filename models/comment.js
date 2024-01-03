const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  comment: { type: String, required: true, minLength: 3 },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  timeStamp: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('Comment', CommentSchema);
