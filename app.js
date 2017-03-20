var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var legoCrafts = express();

// uncomment after placing your favicon in /public
//legoCrafts.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
legoCrafts.use(logger('dev'));
legoCrafts.use(bodyParser.json());
legoCrafts.use(bodyParser.urlencoded({ extended: false }));
legoCrafts.use(cookieParser());
legoCrafts.use(express.static(path.join(__dirname, 'lego')));


// catch 404 and forward to error handler
legoCrafts.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (legoCrafts.get('env') === 'development') {
  legoCrafts.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
legoCrafts.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = legoCrafts;
