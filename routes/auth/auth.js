const express = require('express');
const {
  register,
  login,
  refreshToken,
  resetPassword,
  newPassword,
} = require('../../controllers/authController');

const authRouter = express.Router();

authRouter.post('/signup', register);
authRouter.post('/signin', login);
authRouter.post('/reset_password', resetPassword);
authRouter.post('/new_password', newPassword);
authRouter.post('/refresh_token', refreshToken);
authRouter.get('/logout', (req, res) => {});

module.exports = authRouter;
