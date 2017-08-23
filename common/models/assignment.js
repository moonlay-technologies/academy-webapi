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

    Assignment.assignmentSubtraction = function (id, cb) {
        app.models.Assignment.findById(id, { include: 'timerecords' },
            function (err, assignments) {
                if (err)
                    return cb(err);
                else {
                    var diffDays = 0.0;
                    var totalDeadline = 0.0;
                    var date2 =  new Date (assignments.deadline)//assignments.deadline
                    var date = new Date()
                    var time = 0.0;
                    console.log(date)
                    console.log(date2.getTime())
                    
                    if (assignments.deadline != 0) {
                        totalDeadline = Math.abs(date2 - date);
                        diffDays = Math.ceil(totalDeadline / (3600 * 1000 * 24)) ;
                        time = Math.ceil(diffDays * 8)+ " hours more";
                        console.log("Deadline:" + time)
                        console.log("id: " + assignments.id)
                        cb(null, time);
                    }
                };
            });

    };

    Assignment.remoteMethod("assignmentSubtraction",
        {
            accepts:
            {
                arg: 'id', type: 'string', required: true
            },
            http: { path: '/:id/subtraction', verb: "get", errorStatus: 401 },
            returns: { arg: "Subtraction", type: "date" }
        });




    Assignment.getElapsed = function (id, cb) {
        app.models.Timerecord.find({ where: { assignmentId: id } },
            function (err, timerecords) {
                if (err)
                    return cb(err);
                else {
                    console.log(timerecords);
                    var sum = timerecords.reduce(function (last, d) {
                        // var elapsed = (d.waktu + last)/3600;
                        // return elapsed.toFixed(4);
                        return d.waktu + last;
                    }, 0);
                    cb(null, sum);
                }
            })
    }


    Assignment.remoteMethod("getElapsed", {
        accepts:
        {
            arg: 'id',
            type: 'string',
            required: true
        },
        http:
        {
            path: '/:id/elapsed',
            verb: "get",
            errorStatus: 401
        },
        returns:
        {
            arg: "Elapsed",
            type: "decimal"
        }
    })
};
