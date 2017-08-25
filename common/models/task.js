'use strict';
var app = require('../../server/server');
var codeGenerator = require("../utils/code-generator");

module.exports = function (Task) {

  Task.getElapsedbyAssignment = function (id, cb) {
    app.models.Assignment.find({ where: { taskId: id } }, function (err, assignments) {
      if (err || id === 0)
        return cb(err);
      else {
        console.log(assignments);
        var sum = assignments.reduce(function (last, d) {
          return d.elapsed + last;
        }, 0);
        cb(null, sum);
      }
    })
  };

  //Mengambil task 5 hari sebelum deadline
  Task.getDueTaskThisWeek = function (cb) {
    var startDate = (new Date()).setHours(0, 0, 0, 0);
    var endDate = (new Date(new Date().getTime() + (18 * 24 * 60 * 60 * 1000))).setHours(23, 59, 59, 0);
    var isoStartDate = new Date(startDate).toISOString();
    var isoEndDate = new Date(endDate).toISOString();
    var task = app.models.Task;
    task.find(
      {
        // Mengambil project antara tgl isStarDate - isoEndData dan status = open
        where: { deadline: { between: [isoStartDate, isoEndDate] }, status: "open" },

        include: [
          // include project id dan name
          {
            relation: 'project',
            scope: { fields: ['id', 'name'] }
          },
          //include backlog id dan name
          {
            relation: 'backlog',
            scope: { fields: ['id', 'name'] }
          },
          // mengambil Assignments        
          {
            relation: 'assignments',
            scope: {
              fields: ['id', 'status', 'deadline', 'accountId'],
              where: {status: 'open'},
              include: [{relation: 'account', scope: {fields: ['id', 'username']}}]
            }
          }]
      },
      function (err, results) {
        if (err)
          return cb(err);
        else
          cb(null, results);
      })
  };

  Task.remoteMethod("getDueTaskThisWeek",
    {
      http: { path: '/getDueTaskThisWeek', verb: "get", errorStatus: 401 },
      description: ["get task where will be submit in 5 days"],
      returns: { arg: 'Task', type: 'object', root: true }

    });


  Task.remoteMethod("getElapsedbyAssignment",
    {
      accepts: [{ arg: 'id', type: 'string', required: true }],
      http: { path: '/:id/actual', verb: "get", errorStatus: 401 },
      returns: { arg: "Actual", type: "decimal" }
    })
};       