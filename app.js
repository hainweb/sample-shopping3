var createError = require('http-errors');
var express = require('express');
var db = require('./config/connection')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const MongoStore = require('connect-mongo');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var hbs = require('express-handlebars');
var fileUpload = require('express-fileupload')
var session = require('express-session')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())

app.use(session({
  secret: 'ajinajinshoppingsecretisajin',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb+srv://hainofficialweb:0wCqDqaj0vQO28oD@samle-shopping.f5two.mongodb.net/?retryWrites=true&w=majority&appName=samle-shopping',
    collectionName: 'sessions' 
  }),
  cookie: { secure: false, maxAge: 6000000 }
}));    

// Connect to the database before setting up routes
db.connect((err) => {
  if (err) {
    console.error('Unable to connect to database', err);
    process.exit(1);
  } else {
    console.log('Database connected');
    
    // Set up routes after database connection is established
    app.use('/', userRouter);
    app.use('/admin', adminRouter);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  }
});

module.exports = app;