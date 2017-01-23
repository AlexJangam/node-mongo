/*globals require, express, console, module*/
/*jslint unparam : true*/

var bodyParser = require('body-parser'),
    fs = require("fs");
module.exports = function (app, express, maindir) {
    'use strict';
    app.get("/public", function (req, res, next) {
        try {
            fs.readFile(maindir + "/page/node-mongo.html", "utf8", function (err, data) {
                var resultArray = data;//do operation on data that generates say resultArray;
                if (err) {
                    throw err;
                }
                res.send(resultArray);
            });
        } catch (e) {
            res.send(404);
        }
    });


    app.use('/public', express.static(maindir + '/page'));
    app.use(bodyParser.json());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });


};
