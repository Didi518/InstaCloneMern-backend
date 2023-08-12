const express = require('express');

const requireLogin = require('../../middlewares/requireLogin');
const {
  createPost,
  getAllPosts,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  addComment,
  getAllComments,
  deleteComment,
  deletePost,
  explore,
} = require('../../controllers/postController');

const postRouter = express.Router();

postRouter.post('/create', requireLogin, createPost);
postRouter.get('/allposts', requireLogin, getAllPosts);
postRouter.put('/like', requireLogin, likePost);
postRouter.put('/dislike', requireLogin, unlikePost);
postRouter.put('/save', requireLogin, savePost);
postRouter.put('/unsave', requireLogin, unsavePost);
postRouter.put('/comment', requireLogin, addComment);
postRouter.get('/allcomments', requireLogin, getAllComments);
postRouter.put('/deletecomment', requireLogin, deleteComment);
postRouter.delete('/delete/:postId', requireLogin, deletePost);
postRouter.get('/explore', requireLogin, explore);

module.exports = postRouter;
