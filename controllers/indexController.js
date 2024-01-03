const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signUp = [
  body('username').custom(async (username) => {
    const user = await User.findOne({ username });
    if (user) {
      throw new Error('Username already exists');
    }
    return true;
  }),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  asyncHandler(async (req, res, next) => {
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

      res.status(400).json({ errors: errorMessages });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      admin: true,
    });
    try {
      await user.save();
      res.status(200).json({ message: 'User created successfully' });
    } catch (err) {
      next(err);
    }
  }),
];

exports.login = asyncHandler(async (req, res, next) => {
  try {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err || !user) {
        res.status(403).json({
          info,
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          next(err);
        }
        // create token
        const body = {
          _id: user._id,
          username: user.username,
          admin: user.admin,
        };
        const token = jwt.sign({ user: body }, process.env.SECRET_KEY, {
          expiresIn: '1d',
        });

        res.status(200).json({ body, token });
      });
    })(req, res, next);
  } catch (err) {
    res.status(403).json({
      err,
    });
  }
});
