const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Post = require('../models/posts');
const Comment = require('../models/comment');

exports.getAllCommentsOnAPost = asyncHandler(async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.id });
    res.status(200).json({ comments });
  } catch (err) {
    if (err) {
      res.status(403).json({ err });
    }
  }
});

exports.getAllComments = asyncHandler(async (req, res, next) => {
  try {
    const comments = await Comment.find({});
    if (!comments) {
      res.status(404).json({ message: 'No comments' });
    }
    res.status(200).json({ comments });
  } catch (err) {
    next(err);
  }
});

exports.getSingleComment = asyncHandler(async (req, res, next) => {
  try {
    const comment = await Comment.find({ _id: req.params.id });
    if (!comment) {
      res
        .status(404)
        .json({ message: `No comment with ${req.params.id} found` });
    }
    res.status(200).json({ comment });
  } catch (err) {
    next(err);
  }
});

exports.deleteSingleComment = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.admin) {
      const comment = await Comment.findByIdAndDelete({
        _id: req.params.commentid,
      });
      if (!comment) {
        res
          .status(404)
          .json({ message: `No comment with id ${req.params.commentid}` });
      }

      const deletedComment = await Post.findOneAndUpdate(
        {
          _id: req.params.postid,
        },
        {
          $pullAll: {
            comments: [req.params.commentid],
          },
        },
        { new: true },
      );

      res.status(200).json({
        message: `Deleted comment with id ${req.params.commentid} and removed from ${req.params.postid}`,
        comment,
        deletedComment,
      });
    }
    res
      .status(403)
      .json({ message: 'You must be an admin to update the post' });
  } catch (err) {
    next(err);
  }
});

exports.createComment = asyncHandler(async (req, res, next) => {
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
    const comment = new Comment({
      username: req.body.username,
      email: req.body.email,
      comment: req.body.comment,
      postId: req.params.id,
    });

    await comment.save();

    await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { comments: comment._id } }, // Push the comment's _id instead of the whole comment object
    );

    return res.status(200).json({ message: 'Comment saved', comment });
  } catch (err) {
    return res.status(400).json({ err });
  }
});
