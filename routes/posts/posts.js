const express = require('express');

const requireLogin = require('../../middlewares/requireLogin');
const {
  createPost,
  getAllPosts,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
} = require('../../controllers/postController');

const postRouter = express.Router();

postRouter.post('/create', requireLogin, createPost);
postRouter.get('/allposts', requireLogin, getAllPosts);
postRouter.put('/like', requireLogin, likePost);
postRouter.put('/dislike', requireLogin, unlikePost);
postRouter.put('/save', requireLogin, savePost);
postRouter.put('/unsave', requireLogin, unsavePost);

module.exports = postRouter;
