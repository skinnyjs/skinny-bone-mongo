var MongoManager = require('./lib/mongo');

module.exports = function attachMongo(skinny, options) {
    "use strict";

    skinny.mongo = new Mongo(skinny, options);

    skinny.on('*initialize', function *initializeMongoManager() {
        yield skinny.mongo.connect();
    });

    skinny.on('*shutdown', function *shutdownMongoManager() {
        yield skinny.mongo.disconnect();
    });
};