var log = require('libs/log')(module);
var cookie = require('cookie');
var config = require('config');
var cookieParser = require('cookie-parser')(config.get('session:secret'));
var cookieSignature = require('cookie-signature');

module.exports = function(server) {
    var io = require('socket.io')(server);
    io.origins('localhost:*');
    io.on('connection', function (socket) {
        socket.on('message', function (data, cb) {
            socket.broadcast.emit('message', data);
            cb(data);
        });
    });
    io.use(function(socket, next) {
        var request = socket.request;
        cookieParser(request, {}, function(parseErr) {

            if(parseErr)  return next('Error parsing cookies.', false);

            var sessionID = (request.secureCookies && request.secureCookies[config.get('session:key')]) ||
                (request.signedCookies && request.signedCookies[config.get('session:key')]) ||
                (request.cookies && request.cookies[config.get('session:key')]);

            socket.handshake.sid = sessionID; // Add it to the socket object
        });

//        console.log(c);
        next();
    });
};