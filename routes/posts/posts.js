const express = require('express');

const requireLogin = require('../../middlewares/requireLogin');
const { createPost, getAllPosts } = require('../../controllers/postController');

const postRouter = express.Router();

postRouter.post('/create', requireLogin, createPost);
postRouter.get('/allposts', requireLogin, getAllPosts);

module.exports = postRouter;
