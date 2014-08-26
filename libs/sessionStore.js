var mongoose = require('libs/mongoose');

module.exports = function(session) {
    var MongoStore = require('connect-mongo')(session);
    return new MongoStore({mongoose_connection: mongoose.connection});
};
