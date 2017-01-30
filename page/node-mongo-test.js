'use strict';
/*globals console, document, setTimeout, CryptoJS, popupModule, loadJsonContent, $ */
/*jslint plusplus:true, nomen: true */
var collectionData;

function random(exp) {
    return parseInt(Math.random() * Math.pow(10, exp || 5), 10);
}
function serverCall(callData, sCB, errCB) {
    if (typeof callData.data === "object" && callData.method !== "GET") {
        callData.data = JSON.stringify(callData.data);
    }
    if (!errCB) {
        errCB = function (er) {
            console.error("default error", er);
        };
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
            error : errCB
        });
    } catch (err) {
        console.error("Error", err);
    }
}

function genericCall(url, method, data) {
    var callOb = {
        url : url || "/default",
        method : method || "GET"
    }, senddata = {};
    // if (method==="GET") {}
    if (data && typeof data === "string") {
        senddata = {"data" : data};
    } else if (data && typeof data === "object") {
        senddata = data;
    }
    callOb.data = senddata;
    return callOb;
}

var pagiCount = 50, page = 0, pages = 1, totalCount = 0,
    regxFn = {
        subString : function (vRegx) {
            return {
                $regex: ".*" + vRegx + ".*",
                $options: "i"
            };
        }
    };

function encrypt(str) {
    return CryptoJS.SHA256(str).toString();
}

function clone(obj) {
    if (typeof obj === "object") {
        return JSON.parse(JSON.stringify(obj));
    }
    return obj;
}

function finallyCall(data) {
    var dtaJsn = data;
    if (typeof data === "object") {
        dtaJsn = JSON.stringify(data);
    }
    $(".lgs .resp").append("<div>" + (new Date().toString()).slice(4, 24) + " : " + dtaJsn + "</div>");
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
    var key, i, j, thead = $(".col-data-table .col-data-head"), thList = [], obj = objs[0];
    thead.html("");

    for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        for (key in obj) {
            if (obj.hasOwnProperty(key) && thList.indexOf(key) === -1) {
                thList.push(key);
            }
        }
    }
    for (j = 0; j < thList.length; j++) {
        $(thead).append(oneNode(thList[j], "th"));
    }
    thead.prepend(oneNode(' ', "th"));
    return thList;
}

function addNewTh(thKey) {
    var i, thead = $(".col-data-table .col-data-head");
    if (Array.isArray(thKey)) {
        for (i = 0; i < thKey.length; i++) {
            thead.append(oneNode(thKey[i], "th"));
        }
    } else {
        thead.append(oneNode(thKey, "th"));
    }
}

var breakpoint = 100;

function getType(ob, k1) {
    var retV = {}, k2, tmpOb, nOb = Object.assign({}, ob), subType;
    if (breakpoint-- < 0) {
        return;
    }
    if (typeof ob === "object") {
        if (ob instanceof Date) {
            tmpOb = {};
            tmpOb[k1] = "Date";
            retV = tmpOb;//[tmpOb];
        } else if (ob instanceof Array) {
            tmpOb = {};
            tmpOb[k1] = "Array";
            retV = tmpOb;//[tmpOb];
        } else {
            //If object type.
            retV = {};
            retV[k1] = "object";
            // retV = [tmpOb];//"Object";
            for (k2 in nOb) {
                if (nOb.hasOwnProperty(k2)) {
                    subType = getType(nOb[k2], k1 + "." + k2);
                    //   retV = retV.concat(subType);
                    Object.assign(retV, subType);
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

function getOrderedTrEle(obj, order, types) {
    var key, i, oneVal, resVal, trList = [], trNew = [], newKeys = [], keyIndex = 0, trow = $(document.createElement("tr")),
        viewIcon = '<i class="fa fa-eye icon-td-view cursor"></i> <i class="fa fa-trash icon-td-del cursor"></i>', cls = "icon-td-def cursor";
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            oneVal = obj[key];
            keyIndex = order.indexOf(key);
            resVal = (typeof oneVal === "object") ? "Object" : oneVal;

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
    viewIcon.attr("data-string", JSON.stringify(obj)).
             attr("data-order", JSON.stringify(order)).
             attr("data-type", JSON.stringify(types));
    trow.prepend(viewIcon);
    return $(trow);
}

function initiateEdit(colName) {
    var mainEle = ".col-data-content td.icon-td-def", eleStr = ".col-data-content td.icon-td-def .icon-td-view", delEle = ".col-data-content td.icon-td-def .icon-td-del";
    $(eleStr).off();
    $(delEle).off();
    $(eleStr).on("click", function () {
        var eleObj = JSON.parse($(mainEle).attr("data-string")), dataTypes = JSON.parse($(mainEle).attr("data-type"));
        popupModule("/public/modals/json-display.html?version=" + random(5), loadJsonContent,
            {
                colname : colName,
                data : eleObj,
                types : dataTypes
            }).
            then(function (data) {
                var newTr = getOrderedTrEle(data, JSON.parse($(eleStr).attr("data-order")), colName);
                $(eleStr).parents("tr").html(newTr.html());
                setTimeout(function () {
                    initiateEdit(colName);
                }, 10);
            });
    });

    $(delEle).on("click", function () {
        var eleObj = JSON.parse($(mainEle).attr("data-string")), dataTypes = JSON.parse($(mainEle).attr("data-type")),
            thisEle = $(this);
        popupModule("/public/modals/del-confirmation.html?version=" + random(5), confirmation,{}).
            then(function () {
                thisEle.parents("tr").remove();
                setTimeout(function () {
                    initiateEdit(colName);
                }, 10);
                serverCall(genericCall("/mongo/remove/" + colName, "DELETE", {
                  data : eleObj
                }), function (data) {
                  console.log("done");
                }, function (er) {
                  console.log("call error", er);
                });
            });
    });
}

function populateData(data, order, types, colName) {
    var i, iL, oneVal, oneTr, tbody = $(".col-data-table .col-data-content"), fnlOrder = clone(order);
    tbody.html("");
    for (i = 0, iL = data.length; i < iL; i++) {
        oneVal = data[i];
        oneTr = getOrderedTrEle(oneVal, fnlOrder, types, colName);
        tbody.append(oneTr);
    }
    initiateEdit(colName);
}


function setFooter(colName, ttl) {
    var items = "0-0";
    totalCount = ttl || 0;
    pages = parseInt(totalCount / pagiCount, 10) + 1;
    $(".pagi-footer .action").off();
    if (page < pages - 1) {
        items = page * pagiCount + 1;
        items += " - " + (items + pagiCount - 1);
    } else {
        items = page * pagiCount + 1;
        items += " - " + ttl;
    }
    $(".pagi-footer #display-list").html(items);
    // $(".pagi-footer").attr("page", page).attr("count":pagiCount).attr("total": ttl);
    $(".pagi-footer .action.pagi-num").val(page + 1);
    $(".pagi-footer #page-count").html(pages);
    $(".pagi-footer .action.pagi-prev").on("click", function () {
        if (page > 0) {
            page--;
            collectionData(colName);
        }
    });

    $(".pagi-footer .action.pagi-next").on("click", function () {
        if (page < (pages - 1)) {
            page++;
            collectionData(colName);
        }
    });

    $(".pagi-footer .action.pagi-num").on("keyup", function () {
        var nPage = parseInt($(".pagi-footer .action.pagi-num").val(), 10);
        page =  isNaN(nPage - 1) ? page : (nPage - 1);
        if (!isNaN(nPage) && nPage < pages) {
            $(".action-toggle").addClass("action-modify");
        }
        $(".pagi-footer .action.pagi-num").val(page + 1);

    });


    $(".pagi-footer .action.pagi-go").on("click", function () {
        $(".action-toggle").removeClass("action-modify");
        var nPage = parseInt($(".pagi-footer .action.pagi-num").val(), 10);
        page =  nPage || page;
        if (!isNaN(nPage)) {
            collectionData(colName);
        }
        $(".pagi-footer .action.pagi-num").val(page);
    });

}

function displayContent(colName, collData) {
    var totalData = collData.data, thList = (totalData.length && createThEle(totalData)) || [];
    populateData(totalData, thList, collData.types, colName);
    setFooter(colName, collData.count);
}

function collectionData(colName) {
    serverCall(genericCall("/mongo/collection/data", "GET", {
        name : colName,
        page : page,
        count : pagiCount
    }),
        function (data) {
            displayContent(colName, data);
        }, function (err) {
            console.error("Error", err);
        });
}


function selectColInitiate() {
    var mainCls = "#getDb li.use-db ul li.nav-link.col-select";
    $(mainCls).off();
    $(mainCls).on("click", function () {
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
    $("#getDb li.use-db .nav-link.db-select").on("click", function () {
        $("#getDb li.use-db").removeClass("active");
        $("#getDb li.use-db ul").remove();
        var activeDB = $(this).parents(".use-db"), reqob = genericCall("/mongo/use-database", "GET", {name : $(activeDB).attr("use-db")});
        activeDB.addClass("active");
        serverCall(reqob,
            function (val) {
                serverCall(genericCall("/mongo/get-collections"),
                    function (data) {
                        var uln = document.createElement("ul"), i, lin;
                        for (i in data) {
                            if (data.hasOwnProperty(i)) {
                                lin = document.createElement("li");
                                lin.append(data[i]);
                                $(lin).addClass("nav-link cursor col-select");
                                $(lin).attr("col-name", data[i]);
                                uln.append(lin);
                            }
                        }
                        activeDB.append(uln);
                        selectColInitiate();
                    }, function (err) {
                        console.error("Error", err);
                    });
                finallyCall(val);
            },
            function (a) {
                finallyCall(a);
            }, function (err) {
                console.error("Error", err);
            });
    });
}


function makeTableRow(data, head) {
    var actions = "<td><button class='save'>Save</button>" + "<button class='delete'>delete</button></td>", td, tdE, trD = $(document.createElement("tr"));
    trD.addClass(data._id);
    for (td in data) {
        if (data.hasOwnProperty(td)) {
            tdE = $(document.createElement("td"));
            if (td !== "_id" && !head) {
                tdE.append("<input value=" + data[td] + "></input>");
            } else {
                tdE.append(data[td]);
            }
            tdE.addClass(td);
            trD.append(tdE);
        }
    }
    if (!head) {
        trD.append(actions);
    } else {
        trD.append("<td>Save/Delete</td>");
    }
    return trD;
}
var colList = [];
function initiateClick() {
    $("#findQuery .result .save").off();
    $("#findQuery .result .delete").off();
    $("#findQuery .result .save").on("click", function () {
        var clsNme = $(this).parents("tr").attr("class"), updtDta = {}, respDat;
        $(" ." + clsNme + " td").each(function () {
            if ($(this).attr("class") !== undefined) {
                if ($(this).children("input").val()) {
                    updtDta[$(this).attr("class")] = $(this).children("input").val();
                }
            }
        });
        respDat = {
            query : { "_id": clsNme },
            update : updtDta,
            onlyone : true
        };
        serverCall(genericCall("/mongo/update/" + colList[$("#colList").val()], "PUT", respDat),
            function (data) {
                finallyCall(data);
            }, function (err) {
                console.error("Error", err);
                finallyCall(err.responseText);
            });
    });

    $("#findQuery .result .delete").on("click", function () {
        var respDat = {
            query : { "_id" : $(this).parents("tr").attr("class")},
            onlyOne : true
        };

        serverCall(genericCall("/mongo/remove/" + colList[$("#colList").val()], "delete", respDat),
            function (data) {
                finallyCall(data);
            }, function (err) {
                console.error("Error", err);
                finallyCall(err.responseText);
            });
        $(this).parents("tr").remove();
    });

}



$(document).ready(function () {

    $("#getDb .get-db-list").on("click", function () {
        $("#dblist_select").html("");
        serverCall(genericCall("/mongo/get-dblist"), function (val) {
            var liOb, aOb, dbname, i, iL;
            $(".db-list").html("");
            for (i = 0, iL = val.list.length; i < iL; i++) {
                dbname = val.list[i].name;
                liOb = document.createElement("li");
                aOb = document.createElement("a");
                // <li class="nav-item">
                //   <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
                // </li>
                $(liOb).addClass("nav-item use-db");
                $(aOb).addClass("nav-link db-select");
                $(aOb).attr("href", "#");
                $(aOb).html(dbname);
                $(liOb).attr("use-db", dbname);
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
            function (data) {
                finallyCall(data);
            }, function (err) {
                console.error("Error", err);
            });
    });


    $("#getDb .delete").click(function () {
        serverCall(genericCall("/mongo/dropdb", "DELETE"), function (val) {
            $("#getDb .add").click();
            finallyCall(val);
        },
            function (data) {
                finallyCall(data);
            }, function (err) {
                console.error("Error", err);
            });
    });

    $("#addDb .add").click(function () {
        serverCall(genericCall("/mongo/set-database", "POST", $("#addDb .addval").val()), function (val) {
            var list = "", i, iL;
            for (i = 0, iL = val.list.length; i < iL; i++) {
                list += val.list[i].name + " , ";
                $("#dblist_select").append("<option val=" + val.list[i].name + ">" + val.list[i].name + "</option>");
            }
            $("#dblist_select").val(val.name);
            $("#getDb .addval").val(list);
            finallyCall(val);
        },
            function (data) {
                finallyCall(data);
            }, function (err) {
                console.error("Error", err);
            });
    });

    $("#dblist_select").on("change", function () {
        serverCall(genericCall("/mongo/set-database", "POST", $("#dblist_select").val()), function (val) {
            finallyCall(val);
        }, function (data) {
            finallyCall(data);
        }, function (err) {
            console.error("Error", err);
        });
    });

    $("#addCollection .add").click(function () {
        var val = $("#addCollection .addval").val();
        serverCall(genericCall("/mongo/set-collection", "POST", val), function (data) {
            finallyCall(data);
        }, function (err) {
            console.error("Error", err);
        });
    });

    $("#getCollection .add").click(function () {
        serverCall(genericCall("/mongo/get-collections"), function (data) {
            var i;
            $("#getCollection .addval").val(data);
            colList = data;
            $("#colList").html("");
            for (i in data) {
                if (data.hasOwnProperty(i)) {
                    $("#colList").append("<option value=" + i + ">" + data[i] + "</option>");
                }
            }
            finallyCall(data);
        }, function (err) {
            console.error("Error", err);
        });
    });

    $("#addData .add").click(function () {
        $("#addData .errormsg").hide();
        try {
            var pstDta = {
                colname : colList[Number($("#colList").val()) || undefined],
                value : JSON.parse($("#addData .addval").val())
            };
            serverCall(genericCall("/mongo/add", "POST", pstDta), function (data) {
                finallyCall(data);
            });
        } catch (e) {
            $("#addData .errormsg").show();
        }

    });

    $("#addBulkData .add").click(function () {
        var pstDta = {
            colname : colList[Number($("#colList").val()) || undefined],
            value : JSON.parse($("#addBulkData .addval").val())
        };
        serverCall(genericCall("/mongo/add-bulk", "POST", pstDta), function (data) {
            finallyCall(data);
        });
    });


    $("#searchQuery .search").click(function () {
        var query, reqData = {}, coll;
        try {
            query = $("#searchQuery .searchval").val();
            reqData.query = JSON.parse(query);
        } catch (e) {
            reqData.query = {};
        }

        coll = colList[Number($("#colList").val()) || undefined];

        if (coll !== undefined) {
            serverCall(genericCall("/mongo/search/" + coll, "POST", reqData), function (data) {
                finallyCall(data);
            });
        } else {
            console.error("select a collection");
        }
    });

    $("#removeQuery .remove").click(function () {
        var query, rmData = {}, coll;
        try {
            query = $("#removeQuery .removeval").val();
            if (typeof query === "string") {
                query = JSON.parse(query);
            }
        } catch (e) {
            console.error("error", e, query);
            query = {};
        }
        rmData.query = query;
        rmData.onlyOne = $("#removeQuery .cnt").is(":checked");

        coll = colList[$("#colList").val()];

        if (coll !== undefined) {
            serverCall(genericCall("/mongo/remove/" + coll, "DELETE", rmData), function (data) {
                finallyCall(data);
            });
        } else {
            console.error("select a collection");
        }
    });

    $(".lgs .clear").click(function () {
        $(".lgs .resp").html("");
    });

    $("#credentials .check").click(function () {
        var reqData = {};
        $("#credentials .reslt").html("");
        reqData.query = {
            name : $("#credentials .name").val(),
            password : encrypt($("#credentials .oldpswd").val())
        };

        serverCall(genericCall("/mongo/search/credentials", "POST", reqData), function (data) {
            if (data.length > 0) {
                $("#credentials .reslt").html("User Exists");
            }
            finallyCall(data);
        });
    });

    $("#credentials .change").click(function () {
        $("#credentials .reslt").html("");
        var srchData = {
            name : $("#credentials .name").val(),
            password : encrypt($("#credentials .oldpswd").val())
        }, reqData = {
            query : srchData,
            update : {password : encrypt($("#credentials .nwpswd").val())},
            onlyone : true
        };
        serverCall(genericCall("/mongo/update/credentials", "PUT", reqData), function (data) {
            if (data.length > 0) {
                $("#credentials .reslt").html("User Exists");
            }
            finallyCall(data);
        }, function (err) {
            finallyCall(err.responseText);
        });
    });

    $("#findQuery .selectables .fetch").click(function () {
        serverCall(genericCall("/mongo/search/" + colList[Number($("#colList").val()) || undefined] + "/first-only", "POST", {}), function (data) {
            var i, collStates = [];
            $("#findQuery .fieldSel .rmuse").remove();
            for (i in data) {
                if (data.hasOwnProperty(i)) {
                    $("#findQuery .fieldSel").append("<option class='rmuse' value=" + i + ">" + i + "</option>");
                    collStates.push(i);
                }
            }
            finallyCall(data);
        }, function (err) {
            finallyCall(err.responseText);
        });
    });

    $("#findQuery .selectables .search").click(function () {
        var reqData = {query : {}};
        if ($(".selectables .fieldSel").val()) {
            reqData.query[$(".selectables .fieldSel").val()] = regxFn.subString($("#findQuery .selectables .searchVal").val());
        }
        $("#findQuery .result").html("");
        serverCall(genericCall("/mongo/search/" + colList[Number($("#colList").val()) || undefined], "POST", reqData),
            function (data) {
                var tableE = $(document.createElement("table")), collStates = {}, k, i, iL;
                for (k in data[0]) {
                    if (data[0].hasOwnProperty(k)) {
                        collStates[k] = k;
                    }
                }

                tableE.append(makeTableRow(collStates, true));

                for (i = 0, iL = data.length; i < iL; i++) {
                    tableE.append(makeTableRow(data[i]));
                }

                $("#findQuery .result").append(tableE);
                initiateClick();
                finallyCall(data);
            }, function (err) {
                finallyCall(err.responseText);
            });
    });

});
