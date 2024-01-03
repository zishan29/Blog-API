const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: { type: String, required: true, minLength: 1 },
  content: { type: String, required: true, minLength: 1 },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  timeStamp: { type: Date, default: Date.now, required: true },
  published: { type: Boolean, default: false },
});

module.exports = mongoose.model('Post', PostSchema);
