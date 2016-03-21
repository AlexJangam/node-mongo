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

/*  * /
var MongoClient1 = require('mongodb').MongoClient;
MongoClient1.connect("mongodb://localhost:27017/"+dbName, function(err, db) {
if(err)console.log("err",err)
db.collection(colName).removeOne({ "del" : "true" },function(){
  console.log(db.collection(colName))
  getCollectionse()
})

})

//*/



function errorRes(res,err){
	res.status("400")
	res.send(err)
}

app.get("/mongo/get-dblist", function(req, res) {
	mong.getDbList(function(err,list){
		if(err)errorRes(res,err)
		else res.send(JSON.stringify(list))
	})
})

app.post("/mongo/set-dblist", function(req, res) {
	mong = dbConnect(req.dbName)
  res.send("dbName")
})

app.get("/mongo/get-collections", function(req, res) {
	mong.getCollections(function(err,list){
		if(err)errorRes(res,err)
		else res.send(JSON.stringify(list))
	})
})
app.post("/mongo/set-collection", function(req, res) {
	var msg = {message:"success"}
	console.log("Set Collection",req.body)
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
	//console.log("Add Data",data)
	//mongoPgn.add("collectionName",{data},callback(optional))
		mong.add(data.colname,data.value,function(err,result){
      console.log(result)
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
	console.log("Add Bulk")
	//mongoPgn.addBulk("collectionName",[{data}],callback(optional))
		mong.addBulk(data.colname,data.value,function(err,result){
		if(err){
			errorRes(res,err)
		}else{
			res.send(JSON.stringify(result))
		}
	})
})

app.post("/mongo/search/*", function(req, res) {
	var msg = {message:"success"}
	var reqst = req.body.data;
  //collection name in path
	var coll = req.url.split("/mongo/search/")[1];
  if(coll.indexOf("/")!=-1 && coll.split("/")[1]!=undefined && coll.split("/")[1]=="first-only"){
    mong.getSample(coll.split("/")[0],function(err,data){
      res.send(JSON.stringify(data))
    })
  }else{
    //	mongoPgn.search("collectionName","searchQuery",callback(optional))
      mong.search(coll,reqst.query,function(err,data){
      if(err){
        errorRes(res,err)
      }else{
        res.send(JSON.stringify(data))
      }
    })
  }

})

app.delete("/mongo/remove/*",function(req, res){
  var msg = {message:"success"}
  var removeReq = req.body.data;
  //collection name in path
  var coll = req.url.split("/mongo/remove/")[1];
  //mongoPgn.remove("collectionName",{},onlyOne(T/F - op),callback(optional))
  mong.remove(coll,removeReq.query,removeReq.onlyOne,function(err,data){
    if(err){ errorRes(res,err);}
    else{	res.send(JSON.stringify(data)); }
  })
})

app.put("/mongo/update/*",function(req, res){
  var msg = {message:"success"}
  var upReq = req.body.data;
  //collection name in path
  var coll = req.url.split("/mongo/update/")[1];
  console.log(upReq);
  //mongoPgn.update("collectionName","searchQuery","upQuery",callback(optional),firstOnly)
  mong.update(coll,upReq.query,upReq.update,function(err,data){
    if(err){ errorRes(res,err);}
    else{	res.send(JSON.stringify(data)); }
  },upReq.onlyone)
})

/*Do not modify this #fileReader start 	*/
app.listen(portNo,function(){
	console.log("Port Open : ",portNo)
})
/*Do not modify this #fileReader end*/
