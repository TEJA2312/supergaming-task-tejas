require('dotenv').config()

const express = require('express');
const app = express();
const userController = require('./user/user.controller');
const connectToMongoDB = require('./config/database');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/user', userController);

connectToMongoDB();

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    stack: err.stack
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Supergaming server running on 8080`);
});