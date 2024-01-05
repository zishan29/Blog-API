const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Post = require('../models/posts');
const Users = require('../models/user');
const Comment = require('../models/comment');

exports.getAllPosts = asyncHandler(async (req, res, next) => {
  try {
    const posts = req.user
      ? await Post.find().populate('user')
      : await Post.find({ published: true }).populate('user');
    res.status(200).json({ posts });
  } catch (err) {
    if (err) {
      res.status(403).json({ err });
    }
  }
});

exports.getPost = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('user');
    if (!post || post.length === 0) {
      res.status(404).json({ message: 'No post with this id exists' });
    }
    res.status(200).json({ post });
  } catch (err) {
    if (err) {
      res.status(403).json({ err });
    }
  }
});

exports.updatePost = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.admin) {
      const post = await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        content: req.body.content,
        published: req.body.published,
        _id: req.params.id,
      });
      if (!post) {
        res
          .status(404)
          .json({ err: `No posts with id ${req.params.id} exists` });
      }
      res
        .status(200)
        .json({ message: `Post with id ${req.params.id} updated`, post });
    }
    res.status(403).json({ message: 'You must an admin to update this post' });
  } catch (err) {
    if (err) {
      res.status(403).json({ err });
    }
  }
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.admin) {
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) {
        res
          .status(404)
          .json({ err: `No posts with id ${req.params.id} exists` });
      }
      const deletedComments = await Comment.deleteMany({
        id: req.params.id,
      });
      res.status(200).json({
        message: `Post with id ${req.params.id} deleted successfully`,
        comments: deletedComments,
      });
    }
    res
      .status(403)
      .json({ message: 'You must be a admin to delete this post' });
  } catch (err) {
    res.status(403).json({ err });
  }
});

exports.createPost = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = {};
    errors.array().forEach((error) => {
      const { param, msg } = error;
      if (!errorMessages[param]) {
        errorMessages[param] = [];
      }
      errorMessages[param].push(msg);
    });

    return res.status(400).json({ errors: errorMessages });
  }

  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      published: req.body.published,
      user: req.user._id,
    });

    await post.save();
    res.status(200).json({ post, user: req.user });

    await Users.findOneAndUpdate(
      { _id: post.user },
      { $push: { posts: post } },
    );
  } catch (err) {
    res.status(400).json({ err });
  }
});
