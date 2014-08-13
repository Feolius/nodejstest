var User = require('models/user').User;
var async = require('async');
var HttpError = require('error').HttpError;
exports.get = function(req, res, next) {
    res.render('login');
};

exports.post = function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    async.waterfall([
        function(callback) {
            var query  = User.where({ username: 'test' });
            query.findOne(callback);
        },
        function (callback, user) {
            if(user) {
                if(user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    return next(new HttpError(403, "User not found"));
                }
            } else {
                var user = new User({username: username, password: password});
                user.save(function(err) {
                    if(err) return next(err);
                    callback(null, user);
                })
            }
        }
    ], function(err, user) {
        if(err) return next(err);
        req.session.user = user._id;
        res.send({});
    });
};