// core modules
var path = require('path');
var url = require('url');

// third party modules
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var createError = require('http-errors');
var mongoose = require('mongoose');
const methodOverride = require('method-override');
require('dotenv').config();

// app initialization
var app = express();

// database connection
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.ndofn6s.mongodb.net/`)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// route modules
var indexRouter = require('./routes/index');
var photosRouter = require('./routes/photos');
var apiphotos = require('./routes/api/api.photos');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser('cscie31-secret'));
app.use(session({
  secret:"cscie31",
  resave: true,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// use routes
app.use('/', indexRouter);
app.use('/photos', photosRouter);
app.use('/api/photos', apiphotos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
