/*globals module, require, express, console*/


module.exports = function (app, express) {
    'use strict';

    var action = require("./req-actions")(app, express);

    app.get("/mongo/get-dbname", action.getDBNames);
    app.get("/mongo/get-dblist", action.dbList);
    app.get("/mongo/use-database", action.useDb);
    app.get("/mongo/collection/data", action.getData);
    app.get("/mongo/get-collections", action.getCollections);
    app.post("/mongo/:collection/add", action.addData);
    app.post("/mongo/:collection/add-bulk", action.addMany);
    app.post("/mongo/search/*", action.searchData);
    app.put("/mongo/update/*", action.findUpdate);
    app.delete("/mongo/remove/*", action.findRemove);
    app.delete("/mongo/dropdb", action.dropDb);
};
