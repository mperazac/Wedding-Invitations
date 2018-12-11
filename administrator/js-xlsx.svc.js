'use strict';
/*global angular, jsXlsxService, $ */
angular
    .module('adminbodamauyjesy')
    .service('jsXlsxService', jsXlsxService);

jsXlsxService.$inject = ['$q'];

function jsXlsxService($q) {
    var deferred = null;
    this.getXlsxinJson = function (xlsxFile) {
        deferred = $q.defer();
        var reader = new FileReader();
        reader.onload = function(xls) {
            var data = xls.target.result;
            xw_xfer(data, process_wb);
        };
        reader.readAsBinaryString(xlsxFile);
        return deferred.promise;
    };

    var xw_xfer = function (data, cb) {
        var worker = new Worker('../bower_components/js-xlsx/xlsxworker2.js');
        worker.onmessage = function(e) {
            switch (e.data.t) {
                case 'ready':
                    break;
                case 'e':
                    console.error(e.data.d);
                    break;
                default:
                    var xx = ab2str(e.data).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                    cb(JSON.parse(xx));
                    break;
            }
        };
        var val = s2ab(data);
        worker.postMessage(val[1], [val[1]]);
    };

    var ab2str = function (data) {
        var o = "",
            l = 0,
            w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
        return o;
    }

    var s2ab = function (s) {
        var b = new ArrayBuffer(s.length * 2),
            v = new Uint16Array(b);
        for (var i = 0; i != s.length; ++i) v[i] = s.charCodeAt(i);
        return [v, b];
    }

    var to_json = function (workbook) {
        var result = {};
        workbook.SheetNames.forEach(function(sheetName) {
            var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            if (roa.length > 0) {
                result[sheetName] = roa;
            }
        });
        return result;
    }

    var process_wb = function (wb) {
        var output = "";
        output = JSON.stringify(to_json(wb), 2, 2);
        deferred.resolve(output);
        // jsonResult = output;
    }
}
