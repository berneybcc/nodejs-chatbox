var createError = require('http-errors');
var express = require('express'); 
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connDatabase = require('./datasource/conMongodb');
var indexRouter = require('./routes/index');
var routerRouter= require('./routes/router');
var cors = require('cors')
var app = express();
var cron  = require('node-cron');
var cronTareas = require('./controllers/cronTarea');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/chatbox', routerRouter);

cron.schedule('* 1 * * *',cronTareas.reportData);
//Conexion a mong odb
connDatabase;
 
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
