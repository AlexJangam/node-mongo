/*



Install Instrunctions
----------------------
npm install mongodb
npm install express


*/


var portNo = 1022;//Port node uses for this demo
var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use('/public', express.static(__dirname + '/page'));
app.use(bodyParser.json())
app.use(function(req, res ,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
});

/* Mongo DB functions		*/
var dbName = "test",colName = "trail";
var dbConnect = require("./plugin/mongoPlugin.js")
var mong = dbConnect(dbName)

//	setCollection  , newCollection , getCollections , add , addBulk , search 

/*   */
var data1 = {"testData":"testValue"}
//mong.newCollection(colName)
//mong.add(colName,data1);
/*
mong.getCollections(function(list){
	for(var i=0,iL=list.length;i<iL;i++){
		console.log(list[i].db)
	}
}) // */

//*/


function testConn(){	
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		var colTm = db.collection('testCol')
		var doc1 = {'hello':'doc1'}
		var doc2 = {'hello':'doc2'}
		colTm.insertOne(doc1)
		
	  if(err) console.log(err);
	 /* db.collectionNames(function(err, collections){
		  console.log("test ",collections);
	  });  // */
	  db.close()
	});	
}

function errorRes(res,err){
	res.status("400")
	res.send(err)
}

app.get("/mongo/get-collections", function(req, res) {
	mong.getCollections(function(err,list){
		if(err)errorRes(res,err)
		else res.send(JSON.stringify(list))
	})
})
app.post("/mongo/set-collection", function(req, res) {
	var msg = {message:"success"}
	console.log(req.body)
	mong.newCollection(req.body.data,function(err){
		if(err){
			errorRes(res,err)
		}else{
			res.send(JSON.stringify(msg))
		}
	})
})


app.post("/mongo/add", function(req, res) {
	var msg = {message:"success"}
	var data = req.body.data;
	console.log(data)
	//mongoPgn.add("collectionName",{data},callback(optional))
		mong.add(data.colname,JSON.parse(data.value),function(err){
		if(err){
			errorRes(res,err)
		}else{
			res.send(JSON.stringify(msg))
		}
	})
})

app.post("/mongo/add-bulk", function(req, res) {
	var msg = {message:"success"}
	var data = req.body.data;
	console.log(data.value)
	//mongoPgn.addBulk("collectionName",[{data}],callback(optional))
		mong.addBulk(data.colname,data.value,function(err){
		if(err){
			errorRes(res,err)
		}else{
			res.send(JSON.stringify(msg))
		}
	})
})

app.post("/mongo/search/*", function(req, res) {
	var msg = {message:"success"}
	var data = req.body.data;
	var coll = req.url.split("/mongo/search/")[1];
	//	mongoPgn.search("collectionName","searchQuery",callback(optional))
		mong.addBulk(coll,data,function(err){
		if(err){
			errorRes(res,err)
		}else{
			res.send(JSON.stringify(msg))
		}
	})
})

/*Do not modify this #fileReader start 	*/
app.listen(portNo,function(){
	console.log("Port Open : ",portNo)
})
/*Do not modify this #fileReader end*/
