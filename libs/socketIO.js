var log = require('libs/log')(module);

module.exports = function(server) {
    var io = require('socket.io')(server);
    io.origins('localhost:*');
    io.on('connection', function (socket) {
        socket.on('message', function (data, cb) {
            socket.broadcast.emit('message', data);
            cb(data);
        });
    });
};