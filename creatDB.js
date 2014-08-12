var async = require('async');
var mongoose = require('libs/mongoose');

async.series([open, dropDatabase, createUsers, close], function(err) {
    console.log(arguments);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db =mongoose.connection.db;
    db.dropDatabase(callback);
}

function createUsers(callback) {
    require('models/user');
    var users = [{ username: "Vasya", password: "secret"}, { username: "Petya", password: "secret"}, { username: "govno", password: "secret"}];
    async.each(users, function(userData, callback) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}

function close(callback) {
    mongoose.disconnect(callback);
}
