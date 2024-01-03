const express = require('express');
const passport = require('passport');
const indexController = require('../controllers/indexController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/signup', indexController.signUp);

router.post('/login', indexController.login);

router.get('/posts', postController.getAllPosts);

router.get('/posts/:id', postController.getPost);

router.post(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.createPost,
);

router.put(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  postController.updatePost,
);

router.delete(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  postController.deletePost,
);

router.get('/comments', commentController.getAllComments);

router.get('/comments/:id', commentController.getSingleComment);

router.get('/posts/:id/comments', commentController.getAllCommentsOnAPost);

router.post('/posts/:id/comments', commentController.createComment);

router.delete(
  '/posts/:postid/comments/:commentid',
  passport.authenticate('jwt', { session: false }),
  commentController.deleteSingleComment,
);

module.exports = router;
