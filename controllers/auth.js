const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../fileHandling');
const { BadRequest, NotFound, SyntaxError } = require('../utils/error');

const router = express.Router();

router.post('/register', upload.single('image'), async (req, res, next) => {
  try {
    let { name, password, email } = req.body;

    if (!name || !password || !email || !req.file) {
      throw new BadRequest('Please fill all fields');
    }
    password = bcrypt.hashSync(password, 10);

    const user = new User({ name, email, password, image: req.file.location });

    const newUser = await user.save();

    const token = jwt.sign({ userId: user.id }, 'secret', {
      expiresIn: '300m',
    });
    ('application/json');
    res.status(200).json({ token, userId: user.id, userName: user.name });
  } catch (err) {
    if (err.code === 11000) {
      next(new BadRequest('Email already exists'));
    } else {
      next(err);
    }
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequest('Please fill all fields');
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequest('Wrong Credentials');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequest('Wrong Credentials');
    }

    const token = jwt.sign({ userId: user._id }, 'secret', {
      expiresIn: '300m',
    });

    res.status(200).json({ userId: user._id, token, userName: user.name });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      throw new BadRequest('Something went wrong, try again');
    }
    const user = await User.findOneById({ _id: userId });
    user.token = '';
    await user.save();

    res.status(200).json('success');
  } catch (err) {
    next(err);
  }
});

router.post('/is-loggedIn', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new BadRequest('Please try to login again');
    }
    const isVerified = jwt.verify(token, 'secret');

    res.status(200).json(isVerified);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
