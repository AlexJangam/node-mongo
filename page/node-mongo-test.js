function serverCall(callData,sCB,errCB){

	if(typeof callData.data == "object")callData.data = JSON.stringify(callData.data)
	if(!errCB)errCB=function(){}
	$.ajax({
	url: callData.url,
	type: callData.method,
	crossDomain: true,
	contentType: 'application/json; charset=utf-8',
	dataType: "json",
	data: callData.data,
	success: sCB,
	error:errCB,

  })
}
var regxFn = {
	subString : function(vRegx){

		return {
			$regex: ".*"+vRegx+".*",
			$options: "i"
		}
	}
}

function encrypt(str){
return CryptoJS.SHA256(str).toString();
}
function genericCall(url,method,data){
	var callOb = {
		url:url?url:"/default",
		method:method?method:"GET",
		data:{"data":data?data:""}
	};
	return callOb;
}

function	finallyCall(data){
	var dtaJsn = data;
	if(typeof data == "object")
		dtaJsn = JSON.stringify(data)

	$(".lgs .resp").append("<div>"+(new Date() +"").slice(4,24) +" : "+ data +"</div>")
}
$("#addCollection .add").click(function(){
	val = $("#addCollection .addval").val();
	console.log(val)
	serverCall(genericCall("/mongo/set-collection","POST",val),
	function(data){
		console.log(data)
		finallyCall(data)
	},function(err){
		console.log(err)
	})
})
var colList = []
$("#getCollection .add").click(function(){
	serverCall(genericCall("/mongo/get-collections"),
	function(data){
		$("#getCollection .addval").val(data)
		colList = data;$("#colList").html("")
		for(var i in data){
			$("#colList").append("<option value="+i+">"+data[i]+"</option>")
		}
		finallyCall(data)
	},function(err){
		console.log(err)
	})
})

$("#addData .add").click(function(){
	var pstDta = {
	colname : colList[$("#colList").val()*1],
	value : JSON.parse($("#addData .addval").val())
	}
	serverCall(genericCall("/mongo/add","POST",pstDta),function(data){
			finallyCall(data)
	})
})

$("#addBulkData .add").click(function(){
	var pstDta = {
	colname : colList[$("#colList").val()*1],
	value : JSON.parse($("#addBulkData .addval").val())
	}
	console.log(pstDta.value)
	serverCall(genericCall("/mongo/add-bulk","POST",pstDta),function(data){
		finallyCall(data)
	})
})


$("#searchQuery .search").click(function(){
	var query,reqData = {};
	try {
		console.log($("#searchQuery .searchval").val())
		query = $("#searchQuery .searchval").val();
		console.log("query",query)
		reqData.query = JSON.parse(query)
	} catch (e) {
		console.log("error",e,reqData)
		reqData.query = {}
	}

	var coll = colList[$("#colList").val()*1];

	if(coll!=undefined){
		serverCall(genericCall("/mongo/search/"+coll,"POST",reqData),
			function(data){
			finallyCall(data)
		})
	}else{
		alert("select a collection")
	}
})

$("#removeQuery .remove").click(function(){
	var query,onlyOne,rmData = {};
	try {
		query = $("#removeQuery .removeval").val();
		if(typeof query == "string")query = JSON.parse(query)

	} catch (e) {
		console.log("error",e,query)
		query = {}
	}
	rmData.query = query;
	rmData.onlyOne=$("#removeQuery .cnt").is(":checked");

	var coll = colList[$("#colList").val()];

	if(coll!=undefined){
		serverCall(genericCall("/mongo/remove/"+coll,"DELETE",rmData),
			function(data){
			finallyCall(data)
		})
	}else{
		alert("select a collection")
	}

})

$(".lgs .clear").click(function(){
	$(".lgs .resp").html("")
})

$("#credentials .check").click(function(){
	reqData = {}
	$("#credentials .reslt").html("");
	reqData.query = {
		name : $("#credentials .name").val(),
		password : encrypt($("#credentials .oldpswd").val())
	}

	serverCall(genericCall("/mongo/search/credentials","POST",reqData),
		function(data){
			if(data.length > 0)
			$("#credentials .reslt").html("User Exists");
		finallyCall(data)
	})
})

$("#credentials .change").click(function(){
	$("#credentials .reslt").html("");
	srchData = {
		name : $("#credentials .name").val(),
		password : encrypt($("#credentials .oldpswd").val())
	}
	reqData = {};
	reqData = {
		query : srchData,
		update : {password : encrypt($("#credentials .nwpswd").val())},
		onlyone:true
	}
	serverCall(genericCall("/mongo/update/credentials","PUT",reqData),
		function(data){
			if(data.length > 0)
			$("#credentials .reslt").html("User Exists");
		finallyCall(data)
	},function(err){
		console.log(err);
		finallyCall(err.responseText)
	})
})

$("#findQuery .selectables .fetch").click(function(){
	serverCall(genericCall("/mongo/search/"+colList[$("#colList").val()*1]+"/first-only","POST",{}),
		function(data){
			collStates = [];
			$("#findQuery .fieldSel .rmuse").remove();
		for(var i in data){
			$("#findQuery .fieldSel").append("<option class='rmuse' value="+i+">"+i+"</option>");
			collStates.push(i);
		}
		finallyCall(data)
	},function(err){
		console.log(err);
		finallyCall(err.responseText)
	})
})

$("#findQuery .selectables .search").click(function(){
	var reqData = {query:{}};
	console.log($(".selectables .fieldSel").val());
	if($(".selectables .fieldSel").val())
	reqData.query[$(".selectables .fieldSel").val()]=regxFn.subString($("#findQuery .selectables .searchVal").val());
	$("#findQuery .result").html("")
	serverCall(genericCall("/mongo/search/"+colList[$("#colList").val()*1],"POST",reqData),
		function(data){
		var tableE = $(document.createElement("table"))
		collStates = {}
			for(var k in data[0]){
				collStates[k]=k;
			}

		tableE.append(makeTableRow(collStates,true))

		for (var i = 0,iL= data.length;i<iL; i++) {
			tableE.append(makeTableRow(data[i]))
		}

		$("#findQuery .result").append(tableE);
		initiateClick()
		finallyCall(data)
	},function(err){
		console.log(err);
		finallyCall(err.responseText)
	})
})

function makeTableRow(data,head){
	var actions = "<td><button class='save'>Save</button>"+"<button class='delete'>delete</button></td>"
	var trD = $(document.createElement("tr"))
	trD.addClass(data._id)
	for(var td in data){
		var tdE = $(document.createElement("td"));
		if(td != "_id" && !head )
		tdE.append("<input value="+data[td]+"></input>")
		else tdE.append(data[td])
		tdE.addClass(td);

		trD.append(tdE)
	}
	if(!head)trD.append(actions)
	else trD.append("<td>Save/Delete</td>")
	return trD;
}

function initiateClick(){
	$("#findQuery .result .save").off();
	$("#findQuery .result .delete").off();
	$("#findQuery .result .save").on("click",function(){
		var clsNme = $(this).parents("tr").attr("class");
		var updtDta = {}
		$(" ." +clsNme +" td").each(function(){
			if($(this).attr("class") != undefined){
				if($(this).children("input").val())
				updtDta[$(this).attr("class")] = $(this).children("input").val();
			}
		})
		respDat = {
			query : { "_id": clsNme },
			update : updtDta,
			onlyone:true
		}
		serverCall(genericCall("/mongo/update/"+colList[$("#colList").val()],"PUT",respDat),
			function(data){

			finallyCall(data)
		},function(err){
			console.log(err);
			finallyCall(err.responseText)
		})
		console.log(respDat);
	})

	$("#findQuery .result .delete").on("click",function(){
		respDat = {
			query : { "_id":$(this).parents("tr").attr("class")},
			onlyOne:true
		}

	serverCall(genericCall("/mongo/remove/"+colList[$("#colList").val()],"delete",respDat),
		function(data){

		finallyCall(data)
	},function(err){
		console.log(err);
		finallyCall(err.responseText)
	})
	$(this).parents("tr").remove();
	})

}
