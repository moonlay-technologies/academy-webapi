


'use strict';
var app = require('../../server/server');
var codeGenerator = require("../utils/code-generator");
module.exports = function (Assignment) {
    Assignment.assignmentProgress = function (id, cb) {
        console.log(id);
        app.models.Assignment.findById(id, { include: 'timerecords' },
            function (err, assignments) {
                if (err)
                    return cb(err);
                else {
                    var totalPersentasi = 0.0;
                    //   var totalDuration = 0.0; 
                    if (assignments.budget != 0)
                        totalPersentasi = ((assignments.elapsed / (assignments.budget * 3600)) * 100);
                    totalPersentasi = totalPersentasi.toFixed(4);
                    // console.log("Total Persentasi : "+ totalPersentasi);
                    cb(null, totalPersentasi);
                };
            });

    };

    Assignment.remoteMethod("assignmentProgress",
        {
            accepts:
            {
                arg: 'id', type: 'string', required: true
            },
            http: { path: '/:id/persentasi', verb: "get", errorStatus: 401 },
            returns: { arg: "Persentasi", type: "object" }
        });

    Assignment.getElapsed = function(id, cb){
        app.models.Timerecord.find({where: {assignmentId : id}}, 
        function(err, timerecords){
            if(err)  
                return cb(err);
            else{
                console.log(timerecords);
                var sum = timerecords.reduce(function(last,d){
                    return d.duration + last;
                }, 0);
                cb(null,sum);
            }
        })
    }


Assignment.remoteMethod("getElapsed", {
    accepts:
    {
        arg : 'id',
        type : 'string',
        required : true
    },
    http:
    {
        path: '/:id/elapsed',
        verb: "get",
        errorStatus: 401
    },
    returns:
    {
        arg : "Elapsed",
        type : "decimal"
    }
})
};
