'use strict';
var app = require('../../server/server');
var codeGenerator = require("../utils/code-generator");


module.exports = function (Assignment) {
    Assignment.assignmentProgress = function (id, cb) {
        app.models.Assignment.findById(id, { include: 'timerecords' },
            function (err, assignments) {
                if (err)
                    return cb(err);
                else {
                    var totalPersentasi = 0.0;
                    var totalDuration = 0.0;
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
                    var distance = 0.0;
                    var end = new Date(assignments.deadline)//assignments.deadline
                    var _second = 1000;
                    var _minute = _second * 60;
                    var _hour = _minute * 60;
                    var _day = _hour * 24;
                    var now = new Date()
                    var keterangan = 0.0;
                    distance = (end - now);
                    if (distance < 0) {
                        keterangan = "Expired"
                        cb(null, keterangan)

    Assignment.assignmentSubtraction = function (id, cb) {
        app.models.Assignment.findById(id, { include: 'timerecords' },
            function (err, assignments) {
                if (err)
                    return cb(err);
                else {
                    var diffDays = 0.0;
                    var totalDeadline = 0.0;
                    var date2 = assignments.deadline;
                    var date = new Date();
                    var time = 0.0;
                    if (assignments.deadline != 0) {
                        totalDeadline = Math.abs(date2 - date);
                        diffDays = Math.ceil(totalDeadline / (3600 * 1000 * 24)) + "" + " days more";
                        time = Math.ceil(diffDays * 8);
                        console.log("Deadline:" + diffDays)
                        console.log("Time :" + time)
                        console.log("id: " + assignments.id)
                        cb(null, diffDays);
                        //cb(null, time);
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
            returns: { arg: "Subtraction", type: "object" }
        });

    Assignment.validatesUniquenessOf('code', { message: 'code already exists' });


    Assignment.observe("before save", (context, next) => {
        var Backlog = app.models.Backlog;
        var data = context.instance || context.data;

        if (context.isNewInstance) {
            data.code = codeGenerator();
            Backlog.findById(data.backlogId, (err, backlog) => {
                if (err)
                    return next(err);
                data.backlogId = backlog.id;
                data.projectId = backlog.projectId;
            })
        }
        next();
    })
};
