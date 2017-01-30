function confirmation(resp, actions) {
    'use strict';
    var keys, kname, nDate = {}, subKeys, subOb = {}, rData = resp.data;

    $(".json-del-confirmation .one-docuemnt").html(resp.colname || "-");

    $(".json-del-confirmation .json-actions .action").off();
    $(".json-del-confirmation .json-actions .cancel").on("click", function () {
      actions.dismiss();
    });
    $(".json-del-confirmation .json-actions .save").off()
    $(".json-del-confirmation .json-actions .save").on("click", function () {
      actions.close();
      /** /
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
