/*

 * wt-node-mongo v1.0.0 (http://www.wenable.com/)
 * Copyright Wenable Technologies pvt Ltd 2016 , Inc.
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 * Desined for MongoDB v 3.2
 * Developed by alexander pradeep jangam alexander.jangam@wenable.com
*/


var mongoPg
,defaultPath = "mongodb://localhost:27017";

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var genericDB = require('mongodb').Db;
// mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]

// main function for operations
mongoPg = function(dbName,path,callback){
	var connUrl = defaultPath+"/"+dbName,connDB,defColName;
	if(typeof path ==='function')callback = path;
	else if(typeof path ==='string')connUrl = path;

	function operationDB(opfn){
		//console.log("connUrl",connUrl)
		MongoClient.connect(connUrl, function(err, mdb) {
		if(err)console.log("err",err)

		//* * //removing slash will interchange
		opfn(mdb)
		try {
			} catch (e) {
			console.log("commonError:",e);
			mdb.close()
		}
		//*/	opfn(mdb)
		})
	}
	function exeCallBack(err,data,callB,db){
		// common callback execution with validation check for function
		if(typeof callB === "function")callB(err,data)
		db.close();
	}
	//db.admin().listDatabases
	var listBDs = function(postGet){
		operationDB(function(db){
			db.admin().listDatabases(function(err, dbs) {
				var sendData = {name:db.databaseName,list:dbs.databases}
				exeCallBack(err,sendData,postGet,db)
			});
		})
	}
	var getDbName = function(callB){
		operationDB(function(db){
				exeCallBack("",db.getName(),callB,db);
		})

	}
	var createCollection = function(name,postCreate){
		defColName = name;
		if(name){
		operationDB(function(db){
			db.createCollection(name,function(err,con){
				console.log("creating",name)
				if(err)console.log("Error",err)
				if(colList.indexOf(name)==-1)colList.push(name)
				exeCallBack(err,con,postCreate,db);
			});
			//db.close();
		})}
	}

	// set a default colection name to work with, and its latest created collection if not mentioned.
	function setDefaultCollection(nm){
		defColName = nm;
	}
	var colList = [];
	function getCollections(callB){

		operationDB(function(db){
			colList = [];
			db.collections(function(err, collections) {
			  if (err)console.log("err",err);
			  for(var i=0,iL=collections.length;i<iL;i++){
				  if(collections[i].s.name != "system.indexes")
				  colList.push(collections[i].s.name)
			  }
			  exeCallBack(err,colList,callB,db);
			});

		  })
	}


	function insertOps(colcName,data,callB,many){
		if(colList.indexOf(colcName)==-1){
			colList.push(colcName)
			console.log("Add new Collection",colcName);
		}
		// function for data insertion
		if(typeof colcName =="object" && defColName!= undefined){
			//setting data and callB in case we used default collections name, where first element will be data
			data = colcName;colcName = defColName;
			if(typeof data ==='function')callB = data;
		}
		if(colcName){
		operationDB(function(db){
			if(many){
				db.collection(colcName).insertMany(data,function(err,res){
				exeCallBack(err,res,callB,db)
				})
			}else {
				db.collection(colcName).insertOne(data,function(err,res){
				exeCallBack(err,res,callB,db)
			})
			}

		})}
	}

	getCollections()

	// Add an entry to DB
	var addToCollection = function(colcName,data,callB){
		insertOps(colcName,data,callB,false);
	}

	// Add a set of objects to DB
	var addBulkToCollection = function(colcName,data,callB){
		insertOps(colcName,data,callB,true)
	}

	//Update Records
	var updateRecords = function(colcName,findData,upData,callB,firstOnly){
		if(typeof colcName =="object" && defColName!= undefined){
			findData = colcName;upData = findData;colcName = defColName;
			if(typeof upData ==='function')callB = data;
		}

		if(colcName){
			if(findData._id){
				findData._id = ObjectId(findData._id)
			}
		operationDB(function(db){
			if(firstOnly === true){
					db.collection(colcName).updateOne(findData,
						{$set :upData},function(err,result){
					exeCallBack(err,result,callB,db)});
			}else {
				db.collection(colcName).updateMany(findData,{$set :upData},function(err,result){
				exeCallBack(err,result,callB,db)});

			}
		})}
	}

	//Deleting records from collection
	var removeRecords = function(colcName,findData,onlyOne,callB){
		if(typeof colcName =="object" && defColName!= undefined){
			findData = colcName;onlyOne = findData;colcName = defColName;
		}
		else if(typeof onlyOne ==='function'){callB = onlyOne;onlyOne=false;}
		if(typeof findData !="object"){
			throw "invalid format to remove data";
		}else{
			if(typeof colcName =="string"){
				operationDB(function(db){
					if(findData._id)findData._id = ObjectId(findData._id)
					if(onlyOne){
						db.collection(colcName).removeOne(findData,function(err,result){
						exeCallBack(undefined,result,callB,db)
						});
					}else {
						db.collection(colcName).remove(findData,function(err,result){
						exeCallBack(err,result,callB,db)});
					}
				})}

		}
	}


	//Default search Queries
	var searchResult = function(colcName,data,callB,onlyOne){

		if(typeof colcName =="object" && defColName!= undefined){
			data = colcName;colcName = defColName;
			if(typeof data ==='function')callB = data;
		}
		if(colcName){
		operationDB(function(db){
			if(onlyOne){
				db.collection(colcName).findOne(data,function(err,reslt){
					exeCallBack(err,reslt,callB,db)
				})
			}else{
				db.collection(colcName).find(data).toArray(function(err, docs){
					exeCallBack(err,docs,callB,db)
				})
			}
		})
		}
	}

	var dropDatabase = function(callB){
		operationDB(function(db){
			db.dropDatabase(function(err,result){
				exeCallBack(err,result,callB,db)
			})

		})
	}

	var customSearch = {
		searchOne : function(colcName,callB){
			searchResult(colcName,{},callB,true)
		},
		searchById : function(){}
	}



	return {
		getDbName: getDbName,
		getDbList : listBDs,
		setCollection : setDefaultCollection,
		getCollections : getCollections,
		newCollection : createCollection,
		add : addToCollection,
		addBulk : addBulkToCollection,
		remove : removeRecords,
		search : searchResult,
		getSample : customSearch.searchOne,
		update : updateRecords,
		dropDatabase: dropDatabase
	}


}


module.exports = mongoPg;
