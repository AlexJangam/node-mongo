
/*globals require, express, console, module*/
/*jslint unparam : true, plusplus: true, nomen: true*/
var dao, dbConnect = require("../plugin/mongoPlugin"), dbName = "test", login, path, colName = "trail", utils = require("../support/utils");

try {
    dao = dbConnect(dbName, login, path);
} catch (e) {
    console.log("base error ", e);
}

module.exports = function (app, express) {
    'use strict';
    function errorRes(res, err) {
        res.status(400).send(err);
    }

    function gResp(err, data, res) {
        if (err) {
            res.status(400).send({message : err.message});
        } else {
            res.status(200).send(JSON.stringify(data));
        }
    }

    function getDBNames(req, res) {
        dao.getDbName().then(function (err, name) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(name));
            }
        });
    }

    function dbList(req, res) {
        dao.getDbList().then(function (err, list) {
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
                dao.connect(name).then(function () {
                    gResp(null, 200, res);
                });
            });
        } else {
            gResp({message: "no data"}, null, res);
        }
    }

    function dropDb(req, res) {
        dao.dropDatabase().then(function (err, result) {
            if (!err) {
                res.send(JSON.stringify({"message" : "success"}));
            } else {
                res.send(JSON.stringify({"message" : "error"}));
            }
        });
    }

    function getCollections(req, res) {
        dao.getCollections().then(function (err, list) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(list));
            }
        });
    }

    function getData(req, res, next) {
        var query = req.query, collName = query.name, page = parseInt(query.page, 10) || 0, count = parseInt(query.count, 10) || 50, mainres = {};
        dao.getCollectionData(collName, page, count).then(function (err, data) {
            dao.getCollectionCount(collName).then(function (err2, cnt) {
                mainres.data = data;
                mainres.count = cnt;
                gResp(err || err2, utils.clone(mainres), res);
            });
        });
    }

    function formatPostData(data, types) {
        var key, type, nData = utils.clone(data), noval, nOb = {}, i, iL, iC;
        try {
            for (key in types) {
                if (types.hasOwnProperty(key)) {
                    type = types[key];
                    switch (type) {
                    case "Date":
                        if (type.indexOf(".") === -1) {
                            nData[key] = new Date(nData[key]);
                        } else {
                            noval = type.split(".");
                            iL = noval.length;
                            iC = iL - 1;
                            for (i = 0; i < iL; i++) {
                                if (i === 0) {
                                    nOb = nData[noval[0]];
                                } else if (i === iC) {
                                    nOb[iC] = new Date(nOb[iC]);
                                } else {
                                    nOb = nOb[noval[i]];
                                }
                            }
                        }
                        break;
                    }
                }
            }
            return nData;
        } catch (e) {
            return data;
        }
    }

    function addData(req, res) {
        var reqob = req.body, colname = req.params.collection, types = reqob.types, data = utils.clone(reqob.data);
        //mongoPgn.add("collectionName", {data}, callback(optional))
        if (types) {
            data = formatPostData(data, types);
        }
        if (colname && reqob.data) {
            dao.add(colname, data).then(function (err, result) {
                var nRes = (result && result.ops && utils.clone(result.ops)) || result;
                if (err) {
                    errorRes(res, err);
                } else {
                    if (nRes && nRes.length === 1) {
                        nRes = nRes[0];
                    }
                    res.send(nRes);
                }
            });

        } else {
            errorRes(res, {message : "invalid data"});
        }
    }

    function findUpdate(req, res) {
        var reqob = req.body, findOb, types = reqob.types, data = utils.clone(reqob.data), colname = req.url.split("/mongo/update/")[1];
        //mongoPgn.add("collectionName", {data}, callback(optional))
        if (types) {
            data = formatPostData(data, types);
        }
        findOb = {"_id" : data._id};
        delete data._id;
        if (colname && reqob.data) {
            dao.updateOne(colname, findOb, data, false).then(function (err, result) {
                if (err) {
                    errorRes(res, err);
                } else {
                    res.send(utils.clone(result));
                }
            });
        } else {
            errorRes(res, {message : "invalid data"});
        }
    }

    function findUpdateMany(req, res) {
        var upReq = req.body.data, coll = req.url.split("/mongo/update/")[1];
        //mongoPgn.update("collectionName", "searchQuery", "upQuery", callback(optional), firstOnly)
        dao.update(coll, upReq.query, upReq.update).then(function (err, data) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(data));
            }
        });
    }

    function addMany(req, res) {
        var data = req.body.data;
        //mongoPgn.addBulk("collectionName", [{data}], callback(optional))
        dao.addMany(data.colname, data.value).then(function (err, result) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(result));
            }
        });
    }

    function searchData(req, res) {
        var reqst = req.body, coll = req.url.split("/mongo/search/")[1];

        if (coll.indexOf("/") !== -1 && coll.split("/")[1] !== undefined && coll.split("/")[1] === "first-only") {
            dao.getSample(coll.split("/")[0]).then(function (err, data) {
                res.send(JSON.stringify(data));
            });
        } else {
            // mongoPgn.search("collectionName", "searchQuery", callback(optional))
            dao.search(coll, reqst.query).then(function (err, data) {
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
        dao.removeOne(coll, removeReq.query).then(function (err, data) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(data));
            }
        });
    }

    function findRemoveMany(req, res) {
        var removeReq = req.body.data, coll = req.url.split("/mongo/remove/")[1];
        //mongoPgn.remove("collectionName", {}, onlyOne(T/F - op), callback(optional))
        dao.remove(coll, removeReq.query).then(function (err, data) {
            if (err) {
                errorRes(res, err);
            } else {
                res.send(JSON.stringify(data));
            }
        });
    }

    return {
        getDBNames  : getDBNames,
        dbList  : dbList,
        useDb  : useDb,
        dropDb  : dropDb,
        getCollections  : getCollections,
        getData : getData,
        addData  : addData,
        addMany  : addMany,
        searchData  : searchData,
        findRemove  : findRemove,
        findUpdate  : findUpdate,
        updateMany : findUpdateMany,
        removeMany : findRemoveMany
    };
};
