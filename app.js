var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');
var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('quiz'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use( function(req, res, next) {

    // guardar path en session.redir para despues de login
    if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;
    }

    // Hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

// Auto-logout
app.use( function(req, res, next) {
  var ahora = new Date().getTime(); // ahora - Obtener la hora actual
  if (req.session.activo === undefined) { // Inicializar la hora de la sesion con la hora actual
    req.session.activo = ahora;
  }
  //se calcula la diferencia entre las 2 fechas
  var duracion = ahora - req.session.activo;
  var tiempo = 2*60*1000; //el tiempo en milisegundos (2 minutos)
  if (duracion > tiempo) {
    //se elimina la variable inicio de la sesion
    delete req.session.activo;
    // si existe un usuario en la sesion se elimina de la sesion
    if (req.session.user) {
      delete req.session.user;
      req.session.errors = [ { "message": 'Superado el tiempo de inactividad' } ];
      res.redirect("/login");
    } else {
//      res.redirect("/");
    }
  } else {
    //se actualiza los datos
    req.session.activo = ahora;
  }
  next();
});

app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;
