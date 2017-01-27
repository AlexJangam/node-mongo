
function loadJsonContent(resp, actions) {
    $(".json-display .one-docuemnt").html(resp.colname || "-");
    $(".json-display .json-text").val((resp.data && JSON.stringify(resp.data, 0, 2)) || "{}");

    $(".json-display .json-actions .action").off();
    $(".json-display .json-actions .cancel").on("click", function () {
        actions.dismiss();
    })

    $(".json-display .json-actions .save").on("click", function () {
      var dataObj = JSON.parse($(".json-display .json-text").val()),
          types = resp.types, ky, typ;

      /**/
      serverCall(genericCall("/mongo/update/" + resp.colname,"PUT",{
          data : dataObj,
          types : types
      }), function (data) {
        console.log("data", data);
        try {
          actions.close(data);
        } catch (e) {
          console.log(e);
        }

      }, function (er) {
          console.log("call error", er);
      });
      //*/

    });
}
