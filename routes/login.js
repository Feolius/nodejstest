var User = require('models/user').User;
var AuthError = require('models/user').AuthError;
var async = require('async');
var HttpError = require('error').HttpError;
exports.get = function(req, res, next) {
    res.render('login');
};

exports.post = function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    User.authorize(username, password, function(err, user) {
        if(err) {
            if (err instanceof AuthError) {
                return next(new HttpError(403, err.message));
            } else {
                next(err);
            }
        }
        req.session.user = user._id;
        res.send({});
    })
};