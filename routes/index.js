var User = require('models/user').User;
var HttpError = require('error').HttpError;
var ObjectId = require('mongodb').ObjectID;
module.exports = function (app) {
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
        try {
            var id = new ObjectId(req.params.uid);
        } catch (e) {
            next(404);
            return;
        }
        User.findById(id, function (err, user) {
            if(err) return next(err);
            if(!user) {
                next(new HttpError(404, "User not found"));
            }
            res.json(user);
        });
    });
};

