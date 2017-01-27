function serverCall(callData, sCB, errCB) {
	if(typeof callData.data == "object" && callData.method !== "GET") {
		callData.data = JSON.stringify(callData.data);
	}
	if(!errCB) {
		errCB = function(){};
	}
	try {

		$.ajax({
			url : callData.url,
			type : callData.method,
			crossDomain : true,
			contentType : 'application/json; charset=utf-8',
			dataType: "json",
			data : callData.data,
			params : callData.params,
			success : sCB,
			error :errCB
		});
	} catch (e) {
		console.log(e);
	}
}

function genericCall(url,method,data){
	var callOb = {
		url : url ? url : "/default",
		method : method ? method : "GET"
	}, senddata = {};
	// if(method=="GET"){}
	if (data && typeof data === "string") {
		senddata = {"data":data};
	} else if (data && typeof data === "object") {
		senddata = data;
	}

	callOb.data = senddata;
	return callOb;
}

$(document).ready(function () {
		var pagiCount = 50, page=0, pages = 1, totalCount = 0, regxFn;
		regxFn = {
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

		function clone(obj) {
			if (typeof obj === "object") {
				return JSON.parse(JSON.stringify(obj));
			}
			return obj;
		}

		function	finallyCall(data){
			var dtaJsn = data;
			if(typeof data == "object") {
				dtaJsn = JSON.stringify(data)
			}
			$(".lgs .resp").append("<div>"+(new Date() +"").slice(4,24) +" : "+ data +"</div>")
		}

		function oneNode(str, type, clsname) {
			var tNode = $(document.createElement(type || "td"));
			tNode.append(str.toString() || "-");
			if (clsname !== undefined) {
					tNode.addClass(clsname);
			}
			return tNode;
		}

		function createThEle(objs) {
			var key, oneVal, thead = $(".col-data-table .col-data-head"), thList = [], obj = objs[0];
			thead.html("");

			for (var i = 0; i < objs.length; i++) {
				obj = objs[i];
				for (key in obj) {
					if (obj.hasOwnProperty(key) && thList.indexOf(key) === -1) {
						thList.push(key);
					}
				}
			}
			for (var j = 0; j < thList.length; j++) {
				$(thead).append(oneNode(thList[j], "th"));
			}
			thead.prepend(oneNode(' ', "th"))
			return thList;
		}

		function addNewTh(thKey) {
			var key, oneVal, thead = $(".col-data-table .col-data-head");
			if (Array.isArray(thKey)) {
					for (var i = 0; i < thKey.length; i++) {
						thead.append(oneNode(thKey[i], "th"));
					}
			} else {
					thead.append(oneNode(thKey, "th"));
			}
		}

		var breakpoint = 100;

		function getType(ob, k1) {
			var retV = {}, k2, k3, tmpOb, nOb = Object.assign({}, ob);
			if (breakpoint-- < 0) {
				return
			}
			if (typeof ob === "object") {
				if (ob instanceof Date) {
					tmpOb = {};
					tmpOb[k1] = "Date"
					retV = tmpOb;//[tmpOb];
				} else if (ob instanceof Array) {
					tmpOb = {};
					tmpOb[k1] = "Array"
					retV = tmpOb;//[tmpOb];
				} else {
					//If object type.
					retV = {};
					retV[k1] = "object"
					// retV = [tmpOb];//"Object";
					for (k2 in nOb) {
						if (nOb.hasOwnProperty(k2)) {
								subType = getType(nOb[k2], k1 + "." +k2);
								// 	retV = retV.concat(subType);
								Object.assign(retV,subType);
						}
					}
				}
			} else {
				tmpOb = {};
				tmpOb[k1] = typeof ob;
				retV = tmpOb;//[tmpOb];
			}
			return clone(retV);
		}

		function getOrderedTrEle(obj, order) {
			var key, i, oneVal, resVal, trList = [], trNew = [], newKeys = [], keyIndex = 0, types, trow = $(document.createElement("tr")),
					viewIcon = '<i class="fa fa-eye"></i>', cls = "icon-td-def cursor", dataTypes = {}, subType;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					oneVal = obj[key];
					keyIndex = order.indexOf(key);
					resVal = (typeof oneVal === "object") ? "Object" : oneVal;

					types = getType(resVal, key);

					for (var typKey in types) {
						if (types.hasOwnProperty(typKey)) {
							dataTypes[typKey] = types[typKey];
						}
					}

					if (resVal instanceof Date) {
							resVal = resVal.toISOString();
					}
					if (keyIndex !== -1) {
						trList[keyIndex] = oneNode(resVal, "td");
					} else {
						newKeys.push(key);
						trNew.push(oneNode(resVal, "td"));
					}
				}
			}
			order = order.concat(newKeys);
			trList = trList.concat(trNew);
			for (i = 0; i < order.length; i++) {
				trow.append(trList[i] || oneNode("", "td"));
			}
			viewIcon = oneNode(viewIcon, "td", cls);
			viewIcon.attr("data-string", JSON.stringify(obj)).attr("data-type",JSON.stringify(dataTypes));
			viewIcon.attr("data-order", JSON.stringify(order));
			trow.prepend(viewIcon);
			return $(trow);
		}


		function initiateEdit(colName) {
				var eleStr = ".col-data-content td.icon-td-def";
				$(eleStr).off();
				$(eleStr).on("click",function () {
						var eleObj = JSON.parse($(this).attr("data-string")), dataTypes = JSON.parse($(this).attr("data-type"));
						popupModule("/public/modals/json-display.html", loadJsonContent, {colname : colName, data : eleObj, types : dataTypes}).then(function (data) {
								var newTr = getOrderedTrEle(data, JSON.parse($(eleStr).attr("data-order")), colName);
								$(eleStr).parents("tr").html(newTr.html());
								setTimeout(function () {
									initiateEdit(colName);
								}, 10);
						});
				});
		}

		function populateData(data, order, colName) {
			var i, oneVal, oneTr, tbody = $(".col-data-table .col-data-content"), fnlOrder = clone(order);
			tbody.html("");
			for (i = 0, iL = data.length; i < iL; i++) {
				oneVal = data[i];
				oneTr = getOrderedTrEle(oneVal, fnlOrder, colName);
				tbody.append(oneTr);
			}
			initiateEdit(colName);
		}

		function setFooter(colName, ttl) {
				var items = "0-0";
				totalCount = ttl || 0;
				pages = parseInt(totalCount/pagiCount) + 1;
				$(".pagi-footer .action").off();
				if (page < pages -1 ) {
						items = page * pagiCount + 1;
						items += " - " + (items + pagiCount - 1)
				} else {
					items = page * pagiCount + 1;
					items += " - " + ttl;
				}
				$(".pagi-footer #display-list").html(items);
				// $(".pagi-footer").attr("page",page).attr("count":pagiCount).attr("total": ttl);
				$(".pagi-footer .action.pagi-num").val(page + 1);
				$(".pagi-footer #page-count").html(pages);
				$(".pagi-footer .action.pagi-prev").on("click", function () {
						if (page > 0) {
							page--;
							collectionData(colName);
						}
				})
				$(".pagi-footer .action.pagi-next").on("click", function () {
					if (page < (pages - 1)) {
						page++;
						collectionData(colName);
					}
				});

				$(".pagi-footer .action.pagi-num").on("keyup", function () {
					var nPage = parseInt($(".pagi-footer .action.pagi-num").val());

					page =  isNaN(nPage - 1) ? page : (nPage - 1);
					if (!isNaN(nPage) && nPage < pages) {
							$(".action-toggle").addClass("action-modify");
					}
					$(".pagi-footer .action.pagi-num").val(page + 1);

				});


				$(".pagi-footer .action.pagi-go").on("click", function () {
						$(".action-toggle").removeClass("action-modify");
						var nPage = parseInt($(".pagi-footer .action.pagi-num").val());
						page =  nPage || page;
						if (!isNaN(nPage)) {
								collectionData(colName);
						}
						$(".pagi-footer .action.pagi-num").val(page);
				});

		}

		function displayContent(colName, collData) {
			var totalData = collData.data, firstEle = totalData[0], thList = totalData.length && createThEle(totalData) || [];
			populateData(totalData, thList, colName);
			setFooter(colName, collData.count);
		}

		$("#getDb .get-db-list").on("click",function(){
			$("#dblist_select").html("");
			serverCall(genericCall("/mongo/get-dblist"),function(val){
				var list = "", liOb, aOb, dbname;
				$(".db-list").html("");
				for(var i=0,iL=val.list.length;i<iL;i++){
					dbname = val.list[i].name;
					liOb = document.createElement("li");
					aOb = document.createElement("a");
					// <li class="nav-item">
					// 	<a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
					// </li>
					$(liOb).addClass("nav-item use-db");
					$(aOb).addClass("nav-link db-select");
					$(aOb).attr("href","#");
					$(aOb).html(dbname);
					$(liOb).attr("use-db",dbname)
					$(liOb).append(aOb);
					$(".db-list").append(liOb);
					selectDBInitiate();
					// list += val.list[i].name + " , ";
					// $("#dblist_select").append("<option val="+val.list[i].name+">"+val.list[i].name+"</option>")
				}

				// $("#dblist_select").val(val.name);
				// $("#getDb .addval").val(list);
				finallyCall(val);
			},
			function(data){
				console.log(data)
				finallyCall(data)
			},function(err){
				console.log(err)
			})
		});

		function collectionData(colName) {
			serverCall(genericCall("mongo/collection/data","GET",{
				name : colName,
				page : page,
				count : pagiCount
			}),
			function(data){
					displayContent(colName, data);
			},function(err){
					console.log(err)
			})
		}
		function selectColInitiate() {
			var mainCls = "#getDb li.use-db ul li.nav-link.col-select";
			$(mainCls).off();
			$(mainCls).on("click",function () {
				var colName = $(this).attr("col-name");
				$("#col-select-name").html(colName);
				$(mainCls).removeClass("active");
				$(this).addClass("active");
				page = 0;
				pages = 1;
				pagiCount = 50;
				collectionData(colName);
			});
		}

		function selectDBInitiate() {
			$("#getDb li.use-db .nav-link.db-select").off();
			$("#getDb li.use-db .nav-link.db-select").on("click",function(){
				$("#getDb li.use-db").removeClass("active");
				$("#getDb li.use-db ul").remove();
				var activeDB = $(this).parents(".use-db"), reqob = genericCall("/mongo/use-database","GET",{name : $(activeDB).attr("use-db")});
				activeDB.addClass("active");
				serverCall(reqob,
					function(val){
						serverCall(genericCall("/mongo/get-collections"),
						function(data){
							var uln = document.createElement("ul"), lin;
							for(var i in data){
								lin = document.createElement("li")
								lin.append(data[i]);
								$(lin).addClass("nav-link cursor col-select");
								$(lin).attr("col-name",data[i]);
								uln.append(lin);
							}
							activeDB.append(uln);
							selectColInitiate();
						},function(err){
							console.log(err)
						})
						finallyCall(val)
					},
					function(a,b,c){
						finallyCall(a)
					},function(err){
						console.log(err)
					})
				})
			}


			$("#getDb .delete").click(function(){
				serverCall(genericCall("/mongo/dropdb","DELETE"),function(val){
					$("#getDb .add").click()
					finallyCall(val)
				},
				function(data){
					finallyCall(data)
				},function(err){
					console.log(err)
				})
			})

			$("#addDb .add").click(function(){

				serverCall(genericCall("/mongo/set-database","POST",$("#addDb .addval").val()),function(val){
					var list = "";
					for(var i=0,iL=val.list.length;i<iL;i++){
						list += val.list[i].name + " , ";
						$("#dblist_select").append("<option val="+val.list[i].name+">"+val.list[i].name+"</option>")
					}
					$("#dblist_select").val(val.name)
					$("#getDb .addval").val(list);
					finallyCall(val)
				},
				function(data){
					console.log(data)
					finallyCall(data)
				},function(err){
					console.log(err)
				})
			})

			$("#dblist_select").on("change",function(){
				serverCall(genericCall("/mongo/set-database","POST",$("#dblist_select").val()),function(val){
					finallyCall(val)
				},
				function(data){
					console.log(data)
					finallyCall(data)
				},function(err){
					console.log(err)
				})
			})

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
				$("#addData .errormsg").hide()
				try {
					var pstDta = {
						colname : colList[$("#colList").val()*1],
						value : JSON.parse($("#addData .addval").val())
					}
					serverCall(genericCall("/mongo/add","POST",pstDta),function(data){
						finallyCall(data)
					})
				} catch (e) {
					$("#addData .errormsg").show();
				}

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
				if($(".selectables .fieldSel").val())
				reqData.query[$(".selectables .fieldSel").val()] = regxFn.subString($("#findQuery .selectables .searchVal").val());
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
});
