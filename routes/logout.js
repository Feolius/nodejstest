exports.get = function(req, res, next) {
    var sid = req.session.id;
    var io = req.app.get('io');
    req.session.destroy(function(err) {
        io.engine.emit('session:reload', sid);
        if(err) return next(err);
        res.redirect('/');
    });
};
