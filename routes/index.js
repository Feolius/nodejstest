var User = require('models/user').User;
var HttpError = require('error').HttpError;
module.exports = function () {
    app.get('/', function(req, res, next){
        res.render('index', {
//        title: 'title',
            body: 'Test'
        });
    });


    app.get('/users', function(req, res, next) {
        User.find({}, function (err, users) {
            if(err) return next(err);
            res.json(users);
        })
    });

    app.get('/user/:uid', function(req, res, next) {
        User.findById(req.params.uid, function (err, user) {
            if(err) return next(err);
            if(!user) {
                next(new HttpError(404, "User not found"));
            }
            res.json(user);
        });
    });
};

