const express = require('express');

const requireLogin = require('../../middlewares/requireLogin');
const {
  logout,
  getMyPosts,
  getMySavedPosts,
  updateProfile,
  followUser,
  unfollowUser,
  getUserDetails,
  suggestionUser,
  searchUser,
  addStory,
  getStory,
} = require('../../controllers/userController');

const userRouter = express.Router();

userRouter.get('/logout', requireLogin, logout);
userRouter.get('/mypost', requireLogin, getMyPosts);
userRouter.get('/mysavedposts', requireLogin, getMySavedPosts);
userRouter.put('/update_profile', requireLogin, updateProfile);
userRouter.put('/follow', requireLogin, followUser);
userRouter.put('/unfollow', requireLogin, unfollowUser);
userRouter.get('/user/:id', requireLogin, getUserDetails);
userRouter.get('/suggestions', requireLogin, suggestionUser);
userRouter.post('/search', requireLogin, searchUser);
userRouter.post('/add_story', requireLogin, addStory);
userRouter.get('/get_story', requireLogin, getStory);

module.exports = userRouter;
