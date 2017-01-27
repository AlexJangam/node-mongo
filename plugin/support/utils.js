/*global module, console, setTimeout */

module.exports.promise = function (name) {
    'use strict';
    var allFns = [], dummy = function () { return; }, err = dummy;
    function ecb(e) {//Execute error function.
        return function (fn) {
            fn(e);
        };
    }

    function thnFn(fnCB) {//all functions from "then" are added into series of functions and exected one bt one
        allFns.push(fnCB);
        return {then : thnFn, error : err};
    }

    function exec() {//final function to be called after async call prom.exec
        var argArr = [], arg, i;
        for (arg = 0; arg < arguments.length; arg += 1) {
            argArr.push(arguments[arg]);
        }

        function sendOut() {//Once response is ready, execute .then functions
            err = dummy;
            for (i = 0; i < allFns.length; i += 1) {
                try {
                    //execute all functions added to "then" promise.
                    allFns[i].apply(allFns[i], argArr);
                } catch (erRes) {
                    err = ecb(erRes);
                    console.log((name ? (name + " : ") : "") + "failed at promise ", i + 1, " with message ", erRes);
                }
            }
        }

        if (allFns.length > 0) {
            sendOut();//If promise functions are added, then execute immediately
        } else {
            setTimeout(sendOut, 10);//If promise functions are yet to be added then run after 10ms.
        }
    }
    return {
        prom : {then : thnFn, error : err},
        post : exec
    };
};
