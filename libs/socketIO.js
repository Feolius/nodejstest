var log = require('libs/log')(module);
var cookie = require('cookie');
var config = require('config');
var cookieParser = require('cookie-parser')(config.get('session:secret'));
var async = require('async');
var session = require('express-session');
var sessionStore = require('libs/sessionStore')(session);
var HttpError = require('error').HttpError;
var User = require('models/user').User;

function loadSession(sid, callback) {
    sessionStore.get(sid, function(err, session) {
        if(arguments.length == 0) {
            callback(null, null);
        } else {
            callback(err, session);
        }
    });
}

function loadUser(session, callback) {
    if(!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return callback(null, null);
    }

    log.debug("Retrieving user ", session.user);
    User.findById(session.user, function(err, user) {
        if(err) return callback(err);
        if(!user) {
            callback(null, null);
        }
        log.debug("User find: ", user);
        callback(null, user);
    })
}

module.exports = function(server) {
    var io = require('socket.io')(server);
    io.origins('localhost:*');
    io.use(function(socket, next) {
        async.waterfall([function(callback) {
            var request = socket.request;
            cookieParser(request, {}, function(parseErr) {

                if(parseErr) return callback(parseErr);

                var sid = (request.secureCookies && request.secureCookies[config.get('session:key')]) ||
                    (request.signedCookies && request.signedCookies[config.get('session:key')]) ||
                    (request.cookies && request.cookies[config.get('session:key')]);
                if(sid) {
                    socket.handshake.sid = sid; // Add it to the socket object
                    loadSession(sid, callback)
                } else {
                    callback(new HttpError(401, "Session id was not found in cookies"));
                }
            });
        }, function(session, callback) {
            loadUser(session, callback);
        }, function(user, callback) {
            if(!user) {
                callback(new HttpError(403, "Anonymous session may be not correct"));
            }
            socket.handshake.user = user;
            callback(null);
        }], function(err) {
            next(err);
        });
        next();
    });
    io.on('connection', function (socket) {
        var user = socket.handshake.user;
        if(user) {
            var username = user.get('username');
            socket.on('connect', function() {
                var username = user.get('username');
                this.broadcast.emit('join', username);

            });
            socket.broadcast.emit('join', username);

            socket.on('message', function (text, cb) {
                socket.broadcast.emit('message', username, text);
                cb && cb();
            });

            socket.on('disconnect', function() {
                socket.broadcast.emit('leave', username);
            });
        }
    });
    var router = require('socket.io-events')();
    router.on(function (sock, args, next) {
        var name = args.shift(), msg = args.shift();
        console.log(name);
//        sock.emit('received event', name, msg);
    });
    io.use(router);
//    io.on('session:reload', function(sid) {
//        var clients = io.sockets.clients();
//
//        clients.forEach(function (client) {
//            if(client.handshake.session.id != sid) return;
//
//            loadSession(sid, function(err, session) {
//               if(err) {
//                   client.emit('error');
//                   client.disconnect();
//                   return;
//               }
//
//                if(!session) {
//                    client.emit('error', "handshake unauthorised");
//                    client.disconnect();
//                    return;
//                }
//
//                client.handshake.session = session;
//            });
//        });
//    });
    return io;
}