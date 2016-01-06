/*

 * wt-node-mongo v1.0.0 (http://www.wenable.com/)
 * Copyright Wenable Technologies pvt Ltd 2016 , Inc.
 * Licensed under MIT (http://opensource.org/licenses/MIT)

*/


var mongoPg
,defaultPath = "mongodb://localhost:27017";

var MongoClient = require('mongodb').MongoClient;

// mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]

// main function for operations
mongoPg = function(dbName,path,callback){
	var connUrl = defaultPath+"/"+dbName,connDB,defColName;
	if(typeof path ==='function')callback = path;
	else if(typeof path ==='string')connUrl = path;
	
	function operationDB(opfn){
		console.log("connUrl",connUrl)
		MongoClient.connect(connUrl, function(err, mdb) {
		if(err)console.log("err",err)
		opfn(mdb);
		//mdb.close()
		})

	}
	function exeCallBack(err,data,callB,db){
		// common callback execution with validation check for function
		if(typeof callB === "function")callB(err,data)
		db.close();
	}
	
	var createCollection = function(name,postCreate){
		defColName = name;
		if(!postCreate)postCreate = function(){}
		operationDB(function(db){
			db.createCollection(name,function(err,con){
				console.log("creating",name)
				if(err)console.log("Error",err)
				if(colList.indexOf(name)==-1)colList.push(name)
				
				exeCallBack(err,con,postCreate,db);
			});
			//db.close();
		})
	}
	
	// set a default colection name to work with, and its latest created collection if not mentioned.
	function setDefaultCollection(nm){
		defColName = nm;
	}
	var colList;
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
			console.log("Add new Collection");
		}
		// function for data insertion 
		if(typeof colcName =="object" && defColName!= undefined){
			//setting data and callB in case we used default collections name, where first element will be data 
			data = colcName;colcName = defColName;
			if(typeof data ==='function')callB = data;
		}
		operationDB(function(db){
			if(many){
				db.collection(colcName).insertMany(data,function(err,res){
				exeCallBack(err,res,callB,db)
				})				
			}else {
				db.collection(colcName).insertOne(data,function(err,res){
				console.log("err",err)
				exeCallBack(err,res,callB,db)
			})
			}

		})
	}
	var colList = []
	getCollections()
	
	// Add an entry to DB
	var addToCollection = function(colcName,data,callB){
		insertOps(colcName,data,callB,false);
	}
	
	// Add a set of objects to DB
	var addBulkToCollection = function(colcName,data,callB){
		insertOps(colcName,data,callB,true)
	}
	

	
	//Default search Queries
	var searchResult = function(colcName,data,callB){
		var retRes = [];
		if(typeof colcName =="object" && defColName!= undefined){
			data = colcName;colcName = defColName;
			if(typeof data ==='function')callB = data;
		}
		operationDB(function(db){
			var cursor = db.collection(colcName).find(data);
			  cursor.each(function(err, doc) {
			  if (doc != null) {
				 console.dir(doc);
				 retRes.push(doc);
			  } else {
				 console.error("no document");
			  }
			})
			exeCallBack(undefined,res,callB,db)
		})
	}
	
	var customSearch = {
		searchById : function(){}
	}
	
	return {
		setCollection : setDefaultCollection,
		getCollections : getCollections,
		newCollection : createCollection,
		add : addToCollection,
		addBulk : addBulkToCollection,
		search : searchResult,
	}
	
	
}


module.exports = mongoPg;

