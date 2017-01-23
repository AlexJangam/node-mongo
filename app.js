'use strict';
/*globals require, express, console*/

var portNo = 1022,
    express = require('express'),
    app = express(),
    mong,
    path,
    login;



require("./actions/req-preactions")(app, express,__dirname);
require("./actions/req-controller")(app, express);


/* Do not modify this #fileReader start  */
app.listen(portNo, function () {
    console.log("Port Open : ", portNo);
});
/*Do not modify this #fileReader end*/
