const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const User = require('../models/User');
const {
  createAccessToken,
  createRefreshToken,
} = require('../middlewares/token');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(422).json({ msg: 'Merci de remplir tous les champs' });
    }
    const userEmail = await User.findOne({ email });
    if (userEmail)
      return res.status(400).json({ msg: 'Cet e-mail existe déjà' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.json({ msg: 'Compte créé' });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ msg: 'Merci de remplir tous les champs' });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "Ce compte n'existe pas, ou plus, ou pas encore..." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Le mot de passe est incorrect' });
    const access_token = createAccessToken({ id: user._id });
    const refresh_token = createRefreshToken({ id: user._id });
    res.cookie('refreshtoken', refresh_token, {
      httpOnly: true,
      path: '/api/refresh_token',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      msg: 'Connecté',
      access_token,
      user: { ...user._doc, password: '' },
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshtoken;
    if (refresh_token)
      return res.status(400).json({ msg: 'Merci de vous connecter' });
    jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, result) => {
        if (err)
          return res.status(400).json({ msg: 'Merci de vous connecter' });
        const user = await User.findById(result.id)
          .select('-password')
          .populate('_id name pic followers following');
        if (!user)
          return res.status(400).json({ msg: 'Utilisateur introuvale' });
        const access_token = createAccessToken({ id: result.id });
        res.json({ access_token, user });
      }
    );
  } catch (error) {
    return res.status(500).json({ msg: 'Un problème est survenu' });
  }
};

exports.resetPassword = async (req, res) => {
  let smtpTransport = nodemailer.createTransport({
    host: 'smtp',
    service: 'Gmail',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });
  crypto.randomBytes(32, (err, buffer) => {
    if (err) return res.status(400).json({ msg: 'Token invalide' });
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user)
        return res
          .status(422)
          .json({ msg: 'Utilisateur introuvable avec cet e-mail' });
      user.resetToken = token;
      user.expiredToken = Date.now() + 3600000;
      user.save().then((result) => {
        smtpTransport.sendMail({
          to: user.email,
          from: 'noreply@insta.com',
          subject: 'Réinitialisation du Mot de Passe',
          html: `
            <h4>Vous avez demandé la réinitialisation de votre mot de passe</h4>
            <h5>Cliquez sur ce  <a href="${process.env.RESET_URI}/reinitialisation/${token}">lien<a/> pour le mettre à jour</h5>
          `,
        });
        res.json({ msg: 'Vérifiez vos e-mails' });
      });
    });
  });
};

exports.newPassword = (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({
    resetToken: sentToken,
    expiredToken: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user)
        return res
          .status(422)
          .json({ msg: 'Utilisateur introuvable avec cet e-mail' });
      bcrypt.hash(newPassword, 12).then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.expiredToken = undefined;
        user.save().then((savedUser) => {
          res.json({ msg: 'Mot de passe mis à jour' });
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: 'Un problème est survenu' });
    });
};
