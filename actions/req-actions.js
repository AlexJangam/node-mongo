'use strict';
/*globals require, express, console, module*/
/*jslint unparam : true*/
var dao, dbConnect = require("../plugin/mongoPlugin.js"), dbName = "test", login, path, colName = "trail";

try {
    dao = dbConnect(dbName, login, path);
} catch (e) {
    console.log("base error ", e);
}

module.exports = function (app, express) {

    function errorRes(res, err) {
        res.status(400).send(err.toString());
    }

    function gResp(err, data, res) {
        if (err) {
            res.status(400).send({message : err.message});
        } else {
            res.status(200).send(JSON.stringify(data));
        }
    }

    function getDBNames(req, res) {
        dao.getDbName(function (err, name) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(name));
            }
        });
    }

    function dbList(req, res) {
        dao.getDbList(function (err, list) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(list));
            }
        });
    }

    function useDb(req, res) {
        var name = req.query.name;
        if (name) {
            dbName = req.body.name;
            dao.disconnect(function () {
              dao.connect(name, function () {
                gResp(null, 200, res);
              });
            })
        } else {
            gResp({message: "no data"}, null, res);
        }
    }

    function dropDb(req, res) {
        dao.dropDatabase(function (err, result) {
            if (!err) {
                res.send(JSON.stringify({"message" : "success"}));
            } else {
                res.send(JSON.stringify({"message" : "error"}));
            }
        });
    }

    function getCollections(req, res) {
        dao.getCollections(function (err, list) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(list));
            }
        });
    }

    function useCollection(req, res, next) {
        dao.useCollection(req.query.name, function (err) {
            if (err) {
                errorRes(res, err);
            } else {
                next();
            }
        });
    }

    function getData(req, res, next) {
        var query = req.query, collName = query.name, page = query.page || 0, count = query.count || 50, mainres = {};
        dao.getCollectionData(collName, page, count, function (err, data) {
            dao.getCollectionCount(collName, function (err2, cnt) {
                mainres.data = data;
                mainres.count = cnt;
                gResp(err || err2, mainres, res);
            });
        });
    }

    function addData(req, res) {
        var msg = {message : "success"}, data = req.body.data;
        //mongoPgn.add("collectionName", {data}, callback(optional))
        dao.add(data.colname, data.value, function (err, result) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(msg));
            }
        });
    }

    function addMany(req, res) {
        var data = req.body.data;
        //mongoPgn.addBulk("collectionName", [{data}], callback(optional))
        dao.addBulk(data.colname, data.value, function (err, result) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(result));
            }
        });
    }

    function searchData(req, res) {
        var reqst = req.body.data, coll = req.url.split("/mongo/search/")[1];

        if (coll.indexOf("/") !== -1 && coll.split("/")[1] !== undefined && coll.split("/")[1] === "first-only") {
            dao.getSample(coll.split("/")[0], function (err, data) {
                res.send(JSON.stringify(data));
            });
        } else {
            // mongoPgn.search("collectionName", "searchQuery", callback(optional))
            dao.search(coll, reqst.query, function (err, data) {
                if (err) {
                    errorRes(res, err);
                } else {
                    res.send(JSON.stringify(data));
                }
            });
        }

    }

    function findRemove(req, res) {
        var removeReq = req.body.data, coll = req.url.split("/mongo/remove/")[1];
        //mongoPgn.remove("collectionName", {}, onlyOne(T/F - op), callback(optional))
        dao.remove(coll, removeReq.query, removeReq.onlyOne, function (err, data) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(data));
            }
        });
    }

    function findUpdate(req, res) {
        var upReq = req.body.data, coll = req.url.split("/mongo/update/")[1];
        //mongoPgn.update("collectionName", "searchQuery", "upQuery", callback(optional), firstOnly)
        dao.update(coll, upReq.query, upReq.update, function (err, data) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(data));
            }
        }, upReq.onlyone);
    }

    return {
        getDBNames  : getDBNames,
        dbList  : dbList,
        useDb  : useDb,
        dropDb  : dropDb,
        getCollections  : getCollections,
        useCollection  : useCollection,
        getData : getData,
        addData  : addData,
        addMany  : addMany,
        searchData  : searchData,
        findRemove  : findRemove,
        findUpdate  : findUpdate
    };
};
