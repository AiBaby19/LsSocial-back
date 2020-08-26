const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const { BadRequest, NotFound, SyntaxError } = require('../utils/error');

const router = express.Router();

router.get('/', authToken, async (req, res, next) => {
  try {
    const skip =
      req.query.skip && /^\d+$/.test(req.query.skip)
        ? Number(req.query.skip)
        : 0;

    const posts = await Post.find({}, undefined, { skip, limit: 10 })
      .populate('user', 'image name')
      .populate('like', 'user')
      .lean()
      .sort({ create_date: -1 });

    const allPosts = posts.map((post) => transformData(post));
    res.status(200).json(allPosts);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'image name')
      .populate('like', 'user');

    if (!post) {
      throw new NotFound(`Post wasn't found`);
    }
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const post = new Post(req.body);
    const newPost = await post.save();
    const { _doc } = await newPost
      .populate('user', 'image name')
      .populate('like', 'user')
      .execPopulate();

    res.status(200).json(transformData(_doc));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/like', async (req, res, next) => {
  try {
    const { userId } = req.body;

    let likes = await Like.findOne({ post: req.params.id });
    let likeAmount = 1;

    if (!likes) {
      likes = new Like({ post: req.params.id, user: [userId] });
      const { _id } = await likes.save();

      const post = await Post.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { like: _id } },
        { new: true, useFindAndModify: false }
      );
    } else {
      const isUser = likes.user.find((id) => id.toString() === userId);

      if (!isUser) {
        likes.user.push(userId);
        await likes.save();
      } else {
        likes.user = likes.user.filter((id) => id !== isUser);
        likeAmount = -1;

        if (likes.user.length === 0) {
          await Like.deleteOne();
          await Post.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { like: null } },
            { new: false, useFindAndModify: false }
          );
        } else {
          await likes.save();
        }
      }
    }

    res.status(200).json(likeAmount);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authToken, async (req, res, next) => {
  try {
    let { content, edit_date } = req.body;

    edit_date = new Date();

    const id = mongoose.Types.ObjectId(req.params.id);

    const { _doc } = await Post.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: { content, edit_date } },
      { new: true, useFindAndModify: false }
    ).populate('like', 'user');

    res.status(200).json(transformData(_doc));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Post.findOneAndDelete({ _id: req.params.id });
    await Like.findOneAndDelete({ post: req.params.id });
    res.status(200).json('success');
  } catch (err) {
    next(err);
  }
});

function authToken(req, res, next) {
  try {
    const token = req.headers['x-access-token'];
    if (!token) {
      throw new BadRequest('Access denied');
    }

    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        throw new BadRequest('Access denied');
      } else {
        req.userId = decoded.userId;
        next();
      }
    });
  } catch (err) {
    next(err);
  }
}

const transformData = (post) => {
  return {
    ...post,
    create_date: transformDate(post.create_date),
    edit_date: transformDate(post.edit_date),
    ...(post.like && {
      likes: post.like.user.length,
      like: { ...post.like, user: [] },
    }),
  };
};

const transformDate = (date) => {
  if (!date) return;
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
};

module.exports = router;
