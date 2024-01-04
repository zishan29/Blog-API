require('dotenv').config();
require('./passportjs/passport');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const Cors = require('micro-cors');

const indexRouter = require('./routes/index');

const app = express();

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const cors = Cors({
  allowedOrigins: [
    'https://blog-bice-tau-13.vercel.app',
    'http://localhost:3000',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(cors);

app.use('/', indexRouter);

module.exports = app;
