exports.get = function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
};
