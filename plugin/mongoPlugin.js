/*
* wt-node-mongo v1.0.0 (http://www.wenable.com/)
* Copyright Wenable Technologies pvt Ltd 2016 , Inc.
* Licensed under MIT (http://opensource.org/licenses/MIT)
* Desined for MongoDB v 3.2
* Developed by alexander pradeep jangam alexander.jangam@wenable.com
*/
/*globals module, require, express, console*/
/*jslint unparam: true, plusplus: true, nomen: true */

/**
  * connect : "connect" function connects do specified DB ( default "test" DB if not specified) and shall be called so switch between DBs.
  * disconnect : "disconnect" function disconnnects the current DB which is connected to.(If switched without disconnect)
  * getDbName: "getDbName" function gets name of connected Database.
  * getDbList : "listBDs" Gets the list of Database names of connected MongoDB.
  * getCollections : "getCollections" get the list of collections in connected Database.
  * newCollection : "createCollection" creates a new collection in Database.
  * add : "addToCollection" adds a document to the collection.
  * getPaginated : "getPagiCollData" gets specified limit of documents from collection ( used for pagination ).
  * getCollectionData : "getCollData" gets objects in collection.
  * getCollectionCount : "getCollCount" gets the count of documents in collection.
  * addMany : "addBulkToCollection" adds many documents to collection.
  * removeOne : "removeRecord" finds and removes a record from document.
  * remove : "removeRecords" finds and removes multiple documents from collection.
  * search : "searchResults" searches for documents which matches.
  * searchOne : "searchResult" searches the first document which matches.
  * getSample : "customSearch.searchOne" gets one sample data from the collection.
  * update : "updateRecords" updates existing documents and upsert can be mentioned.
  * updateOne : "updateRecord" updates a single record which matches.
  * dropDatabase: "dropDatabase" drops the databse from connected Mongodb.
  *

**/
var defaultPath = "mongodb://localhost:27017", MongoClient = require('mongodb').MongoClient, ObjectId = require('mongodb').ObjectID, genericDB = require('mongodb').Db, utils = require("./support/utils"), emsg = require("./support/emessages");
// mongodb://[username:password@]host1[:port1][, host2[:port2], ...[, hostN[:portN]]][/[database][?options]]


// main function for operations
module.exports = function (dbName, login, path) {
    'use strict';
    var connUrl = defaultPath + "/" + dbName, mainDb = {}, customSearch;
    if (typeof path === 'string') {
        connUrl = path;
    }

    function connect(name) {
        var connectDB = (typeof name === "string" && defaultPath + "/" + name) || connUrl, prom = utils.promise();
        try {
            mainDb.close();
        } catch (e) {
            console.log("DB not connected.");
        }
        MongoClient.connect(connectDB, login, function (err, mdb) {
            if (err) {
                console.log("Connect Err ", err);
            } else {
                mainDb = mdb;
            }
            prom.post(err, (!err && emsg.success) || null);
        });
        return prom.prom;
    }
    connect();

    function disconnect(cb) {
        mainDb.close();
        mainDb = null;
        cb();
    }

    function nocollection(cb) {
        cb(emsg.nocollection);
    }

    //db.admin().listDatabases
    function listBDs() {
        var prom = utils.promise();
        mainDb.admin().listDatabases(function (err, dbs) {
            var sendData = {
                name : mainDb.databaseName,
                list : dbs !== undefined ? dbs.databases : []
            };
            prom.post(err, sendData);
        });
        return prom.prom;
    }

    function getDbName() {
        var prom = utils.promise();
        prom.post("", mainDb.getName());
        return prom.prom;
    }

    function createCollection(name) {
        var prom = utils.promise();
        if (name) {
            mainDb.createCollection(name, function (err, con) {
                prom.post(err, emsg.success);
            });
        } else {
            nocollection(prom.post);
        }
        return prom.prom;
    }

    function getCollections(callB) {
        var colList = [], prom = utils.promise();
        mainDb.collections(function (err, collections) {
            var i, iL;
            if (err) {
                console.log("err", err);
            } else if (!collections) {
                prom.post(null, []);
            } else {
                for (i = 0, iL = collections.length; i < iL; i++) {
                    if (collections[i].s.name !== "system.indexes") {
                        colList.push(collections[i].s.name);
                    }
                }
            }
            prom.post(err, colList);
        });
        return prom.prom;
    }


    // Add an entry to collection in DB
    function addToCollection(colName, data) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (!data) {
            prom.post(emsg.invalid);
        } else {
            mainDb.collection(colName).insertOne(data, {"new" : true}, prom.post);
        }
        return prom.prom;
    }

    // Add a set of objects to DB
    function addBulkToCollection(colName, data, callB) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (!data) {
            prom.post(emsg.invalid);
        } else {
            mainDb.collection(colName).insertMany(data, function (err, res) {
                prom.post(err, res);
            });
        }
        return prom.prom;
    }

    function id_Obj(findData) {
      if (findData.hasOwnProperty("_id")) {
          findData._id = new ObjectId(findData._id);
      }
    }
    //Update Records
    function updateRecord(colName, findData, upData, upsert) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (typeof upData !== "object") {
            prom.post(emsg.invalid);
        } else {
            id_Obj(findData);
            mainDb.collection(colName).
                findOneAndUpdate(findData, upData, {"new" : true, upsert : upsert || false}, function (err, resp) {
                    prom.post(err, resp && resp.value);
                });
        }
        return prom.prom;
    }

    function updateRecords(colName, findData, upData, upsert) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (typeof upData !== "object" || (upsert && typeof upsert !== "boolean")) {
            prom.post(emsg.invalid);
        } else {
            mainDb.collection(colName).update(findData, {$set : upData}, {upsert : upsert || false}, function (err, resp) {
                prom.post(err, resp && resp.value);
            });
        }
        return prom.prom;
    }

    //Deleting records from collection
    function removeRecord(colName, findData) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (typeof findData !== "object") {
            prom.post(emsg.invalid);
        } else {
            id_Obj(findData);
            mainDb.collection(colName).findOneAndDelete(findData, function (err, resp) {
                prom.post(err, resp && resp.value);
            });
        }
        return prom.prom;
    }

    function removeRecords(colName, findData, callB) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (typeof findData !== "object") {
            prom.post(emsg.invalid);
        } else {
            mainDb.collection(colName).remove(findData, prom.post);
        }
        return prom.prom;
    }


    function getPagiCollData(colName, page, count) {
        var prom = utils.promise();
        if (colName) {
            mainDb.collection(colName).find({}).skip(page * count).limit(count).toArray(function (err, docs) {
                prom.post(err, docs);
            });
        } else {
            prom.post({message : "no collection name specified."});
        }
        return prom.prom;
    }

    function getCollData(colName, page, count) {
        var prom = utils.promise();
        if (colName) {
            mainDb.collection(colName).find({}).toArray(function (err, docs) {
                prom.post(err, docs);
            });
        } else {
            prom.post({message : "no collection name specified."});
        }
        return prom.prom;
    }

    function getCollCount(colName, query) {
        var prom = utils.promise(), findData = (typeof query === "object" && query) || {};
        if (!colName) {
            nocollection(prom.post);
        } else {
            mainDb.collection(colName).find(findData).count(prom.post);
        }
        return prom.prom;
    }

    //Default search Queries
    function searchResult(colName, findData) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (typeof findData !== "object") {
            prom.post(emsg.invalid);
        } else {
            mainDb.collection(colName).findOne(findData, prom.post);
        }
        return prom.prom;
    }

    function searchResults(colName, findData) {
        var prom = utils.promise();
        if (!colName) {
            nocollection(prom.post);
        } else if (typeof findData !== "object") {
            prom.post(emsg.invalid);
        } else {
            mainDb.collection(colName).find(findData).toArray(prom.post);
        }
        return prom.prom;
    }

    function dropDatabase() {
        var prom = utils.promise();
        mainDb.dropDatabase(prom.post);
        return prom.prom;
    }

    customSearch = {
        searchOne : function (colName) {
            searchResult(colName, {});
        },
        searchById : function (colName, id) {
            searchResult(colName, {"_id" : id});
        }
    };


    return {
        connect : connect,
        disconnect : disconnect,
        getDbName: getDbName,
        getDbList : listBDs,
        getCollections : getCollections,
        newCollection : createCollection,
        add : addToCollection,
        getCollectionData : getCollData,
        getPaginated : getPagiCollData,
        getCollectionCount : getCollCount,
        addMany : addBulkToCollection,
        removeOne : removeRecord,
        remove : removeRecords,
        search : searchResults,
        searchOne : searchResult,
        getSample : customSearch.searchOne,
        update : updateRecords,
        updateOne : updateRecord,
        dropDatabase: dropDatabase
    };
};
