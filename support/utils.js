/*globals module, console*/

module.exports = function () {
    'use strict';
    function clone(data) {
        if (typeof data === "object") {
            return JSON.parse(JSON.stringify(data));
        }
        return data;
    }

    var breakpoint = 100;

    function getTypes(ob, k1) {
        if (breakpoint < 0) {
            breakpoint = breakpoint - 1;
            return;
        }
        var retV = {}, k2, tmpOb, nOb = Object.assign({}, ob), subType;
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
                        subType = getTypes(nOb[k2], k1 + "." + k2);
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


    function getObjKeyTypes(obj, tries) {
        var key, oneVal, retType = {}, types;
        breakpoint = parseInt(tries, 10) || 100;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                oneVal = obj[key];
                types = getTypes(oneVal, key);
                Object.assign(retType, types);
            }
        }
        return retType;
    }

    return {
        clone : clone,
        getTypes : getObjKeyTypes
    };
};
