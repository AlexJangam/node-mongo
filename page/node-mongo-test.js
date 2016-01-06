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
	error:errCB
  })
}

function genericCall(url,method,data){
	var callOb = {
		url:url?url:"/default",
		method:method?method:"GET",
		data:{"data":data?data:""}
	};
	return callOb;
}
$("#addCollection .add").click(function(){
	val = $("#addCollection .addval").val();
	console.log(val)
	serverCall(genericCall("/mongo/set-collection","POST",val),
	function(data){
		console.log(data)
	},function(err){
		console.log(err)
	})
})
var colList = []
$("#getCollection .add").click(function(){
	serverCall(genericCall("/mongo/get-collections"),
	function(data){
		$("#getCollection .addval").val(data)
		colList = data;
		for(var i in data){
			$("#colList").append("<option value="+i+">"+data[i]+"</option>")
		}
		
	},function(err){
		console.log(err)
	})
})

$("#addData .add").click(function(){
	var pstDta = {
	colname : colList[$("#addData #colList").val()*1],
	value : JSON.parse($("#addData .addval").val())
	}
	serverCall(genericCall("/mongo/add","POST",pstDta))
})

$("#addBulkData .add").click(function(){
	var pstDta = {
	colname : colList[$("#addData #colList").val()*1],
	value : JSON.parse($("#addBulkData .addval").val())
	}
	console.log(pstDta.value)
	serverCall(genericCall("/mongo/add-bulk","POST",pstDta))
})