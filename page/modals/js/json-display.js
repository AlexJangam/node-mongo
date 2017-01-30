function restructure(rData,objTypes) {

  for (keys in objTypes) {
    if (objTypes.hasOwnProperty(keys) && objTypes[keys] === "Date") {
        nDate = {
          $date : rData[keys]
        };

        if (keys.indexOf(".") === -1) {
          rData[keys] = clone(nDate);
        } else {
          subKeys = keys.split(".");
          subOb = rData[subKeys[0]];
          for (var i = 1; i < subKeys.length; i++) {

            if (i !== (subKeys.length - 1)) {
              subOb = subOb[subKeys[i]];
            } else {
              nDate.$date = subOb[subKeys[i]];
              subOb[subKeys[i]] = clone(nDate);
            }
          }
          // console.log(subOb, subKeys[i]);
        }
    }
  }
}

var breakpoint = 100;

function reverseStructure(ob, k1, preOb, preKey) {
    var retV = {}, k2, tmpOb, nOb = Object.assign({}, ob), subType;
    if (breakpoint-- < 0) {
        return;
    }
    if (ob && typeof ob === "object") {
        if (ob["$date"]) {
            tmpOb = {};
            tmpOb[k1] = "Date";
            preOb[preKey || k1] = ob["$date"];
            retV = tmpOb;//[tmpOb];
        } else if (ob instanceof Array) {
            tmpOb = {};
            tmpOb[k1] = "Array";
            retV = tmpOb;//[tmpOb];
        } else if (!k1) {// first time.
          for (k2 in nOb) {
              if (nOb.hasOwnProperty(k2)) {
                  subType = reverseStructure(nOb[k2], k2, ob );
                  //   retV = retV.concat(subType);
                  Object.assign(retV, subType);
              }
          }
        } else {
            //If object type.
            retV = {};
            retV[k1] = "object";
            // retV = [tmpOb];//"Object";
            for (k2 in nOb) {
                if (nOb.hasOwnProperty(k2)) {
                    subType = reverseStructure(nOb[k2], k1 + "." + k2, ob, k2);
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


function loadJsonContent(resp, actions) {
    var keys, kname, nDate = {}, subKeys, subOb = {}, rData = resp.data;

    restructure(rData, resp.types);

    $(".json-display .one-docuemnt").html(resp.colname || "-");
    $(".json-display .json-text").val((resp.data && JSON.stringify(resp.data, 0, 2)) || "{}");

    $(".json-display .json-actions .action").off();
    $(".json-display .json-actions .cancel").on("click", function () {
        actions.dismiss();
    });

    $(".json-display .json-actions .save").on("click", function () {
      var dataObj = JSON.parse($(".json-display .json-text").val()),
          types = resp.types, ky, typ, result;
        types = reverseStructure(dataObj);
      /**/
      serverCall(genericCall("/mongo/update/" + resp.colname,"PUT",{
          data : dataObj,
          types : types
      }), function (data) {
        try {
          // actions.close(data);
        } catch (e) {
          console.log(e);
        }

      }, function (er) {
          console.log("call error", er);
      });
      //*/

    });
}
