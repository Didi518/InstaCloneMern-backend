const bcrypt = require('bcryptjs');

const Post = require('../models/Post');
const User = require('../models/User');

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie('refreshtoken', { path: '/api/auth/refresh_token' });
    return res.json({ msg: 'Déconnexion réussie' });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports.getMyPosts = async (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate('postedBy', '_id name')
    .populate('saved', '_id postId')
    .then((myPost) => {
      res.json({ myPost: myPost });
    })
    .catch((err) => {
      res.status(500).json({ msg: err.message });
    });
};

exports.getMySavedPosts = async (req, res) => {
  try {
    Post.find({ 'saved.savedBy': req.user._id })
      .then((myPosts) => {
        res.json({ myPosts });
      })
      .catch((err) => {
        res.status(400).json({ msg: 'Un problème est survenu' });
      });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { name, email, password: hashedPassword },
    { new: true }
  )
    .then((result) => {
      res.json({ msg: 'Profil mis à jour', result: result });
      console.log(result);
    })
    .catch((err) => {
      return res.status(400).json({ msg: err.message });
    });
};

exports.followUser = async (req, res) => {
  const followersUpdate = await User.findByIdAndUpdate(
    { _id: req.body.followId },
    { $push: { followers: req.user._id } },
    { new: true }
  ).then((result) => {
    return result;
  });
  if (followersUpdate) {
    await User.findOneAndUpdate(
      req.user._id,
      { $push: { following: req.body.followId } },
      { new: true }
    )
      .select('-password')
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(400).json({ msg: err.message });
      });
  }
};

exports.unfollowUser = async (req, res) => {
  const followingUpdate = await User.findByIdAndUpdate(
    { _id: req.body.unfollowId },
    { $pull: { followers: req.user._id } },
    { new: true }
  ).then((result) => {
    return result;
  });
  if (followingUpdate) {
    await User.findOneAndUpdate(
      req.user._id,
      { $pull: { following: req.body.unfollowId } },
      { new: true }
    )
      .select('-password')
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(400).json({ msg: err.message });
      });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    await User.findOne({ _id: req.params.id })
      .select('-password')
      .then((user) => {
        if (!user)
          return res.status(400).json({ msg: "Cet utilisateur n'existe pas" });
        Post.find({ postedBy: req.params._id })
          .populate('postedBy', '_id name')
          .then((posts) => {
            if (!posts) {
              return res.status(400).json({ msg: "Ce post n'existe pas" });
            }
            res.json({ user, posts });
          })
          .catch((err) => {
            return res.status(500).json({ msg: err.message });
          });
      });
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.suggestionUser = async (req, res) => {
  try {
    const newArr = [...req.user.following, req.user._id];
    const num = req.query.num || 10;
    const users = await User.aggregate([
      { $match: { _id: { $nin: newArr } } },
      { $sample: { size: Number(num) } },
      {
        $lookup: {
          from: 'users',
          localField: 'followers',
          foreignField: '_id',
          as: 'followers',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'following',
          foreignField: '_id',
          as: 'following',
        },
      },
    ]).project('-password');
    return res.json({ users, result: users.length });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.searchUser = (req, res) => {
  let userPattern = new RegExp('^' + req.body.query);
  User.find({ name: { $regex: userPattern } })
    .select('_id name email pic')
    .then((user) => {
      res.json({ user });
    })
    .catch((error) => {
      return res.status(500).json({ msg: error.message });
    });
};

exports.addStory = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        stories: {
          user: req.user._id,
          storyPic: req.body.pic,
          storyDate: new Date(),
        },
      },
    },
    { new: true }
  )
    .then((result) => {
      res.status(201).json(result);
      console.log(result);
    })
    .catch((error) => {
      return res.status(422).json({ msg: error.message });
    });
};

exports.getStory = (req, res) => {
  User.find({
    'stories.storyDate': {
      $lte: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  })
    .select('_id name pic stories')
    .then((userStories) => {
      res.status(200).json({ userStories: userStories });
    })
    .catch((error) => {
      return res.status(400).json({ msg: error.message });
    });
};
