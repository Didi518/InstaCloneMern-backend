const express = require('express');
const cors = require('cors');
const env = require('dotenv');
const mongoose = require('mongoose');

const authRouter = require('./routes/auth/auth');
const postRouter = require('./routes/posts/posts');

const app = express();

mongoose.set('strictQuery', false);

env.config();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Le serveur fonctionne sur le port: ${port}`);
  mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection.on('connected', () => {
    console.log('connecté à mongo');
  });
  mongoose.connection.on('error', (err) => {
    console.log('non connecté à mongo', err);
  });
});
