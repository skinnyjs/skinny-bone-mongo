var monk = require('monk');
var coMonk = require('co-monk');
var thunkify = require('thunkify');

monk.prototype.onOpen = function (err, result) {
	"use strict";
	
    this.emit('open', err, result);
};

function Mongo(skinny, options) {
    "use strict";

    this.skinny = skinny;
    this.options = options;

    this.connections = {};
};

Mongo.prototype.connect = function *connect() {
	"use strict";

    for (var connectionName in this.options.connections) {
        var connectionOptions = this.options.connections[connectionName];

        this.connections[connectionName] = monk(connectionOptions.connectionString);

        // @todo call synchronously so we get connection exception in initialize (now it is thrown later)
        this.connections[connectionName].once('open', function (err, result) {
            if (err) {
                throw err;
            }
        });
        this.connections[connectionName].close = thunkify(this.connections[connectionName].close);
    }
};

Mongo.prototype.disconnect = function *disconnect() {
	"use strict";

    for (var connectionName in this.options.connections) {
        if (this.connections[connectionName] !== undefined) {
            yield this.connections[connectionName].close();
        }
    }
};

Mongo.prototype.getConnection = function (name) {
    "use strict";

    if (!(name in this.connections)) {
        throw new Error("Connection " + name + " is undefined");
    }

    return this.connections[name];
};

Mongo.prototype.getCollection = function (connectionName, collectionName) {
    "use strict";

    var db = this.getConnection(connectionName);

    return coMonk(db.get(collectionName));
}

module.exports = Mongo;