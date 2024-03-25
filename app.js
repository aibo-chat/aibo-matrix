let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let matrixBotAccountRoute = require('./routes/matrix-bot-account-route');

let app = express();

require('./processor/core-processor').main().then();
require('./task/task').main().then();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/matrix', indexRouter);
app.use('/matrix/users', usersRouter);
app.use('/matrix', matrixBotAccountRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (typeof err == 'string') {
    res.json({code: 500, msg: err});
    return
  } else if (err.msg) {
    res.json(err);
    return;
  } else if (err.message) {
    res.json({code: 500, msg: err.message})
    return;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
