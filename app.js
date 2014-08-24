var express = require('express');
var http = require('http');
var path = require('path');
var config = require('config');
var log = require('libs/log')(module);
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var HttpError = require('error').HttpError;
var errorHandler = require('errorhandler');
var session = require('express-session');
var mongoose = require('libs/mongoose');
var MongoStore = require('connect-mongo')(session);
//
//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var server = http.createServer(app);
server.listen(config.get('port'), function() {
    log.info('Express listening on port ' + config.get('port'));
});



app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: config.get('session:secret'),
    cookie: config.get('session:cookie'),
    name: config.get('session:key'),
    store: new MongoStore({mongoose_connection: mongoose.connection})
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));
require('libs/socketIO')(server);
require('routes')(app);

///// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


//// development error handler
//// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        if(typeof err == 'number' ) {
            err = new HttpError(err);
        }
        if(err instanceof HttpError) {
            res.sendHttpError(err);
        } else {
            log.error(err);
            err = new HttpError(500);
            errorHandler()(err, req, res, next);
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    if(typeof err == 'number' ) {
        err = new HttpError();
    }
    if(err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        log.error(err);
        err = new HttpError(500);
        res.sendHttpError(err);
    }
});


module.exports = app;
