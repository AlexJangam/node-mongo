
module.exports.clone = function (data) {
  if (typeof data === "object") {
    return JSON.parse(JSON.stringify(data))
  }
  return data;
}
