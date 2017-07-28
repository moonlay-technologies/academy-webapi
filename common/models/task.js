'use strict';
var app = require('../../server/server');
var codeGenerator = require("../utils/code-generator");

module.exports = function (Task) {
  Task.validatesUniquenessOf('code', { message: 'code already exists' });

  Task.observe("before save", (context, next) => {
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

  //Mengambil task 5 hari sebelum close
  Task.getDueTask = function(cb) {
    var startDate = (new Date()).setHours(0,0,0,0);
    var endDate = (new Date(new Date().getTime()+(4*24*60*60*1000))).setHours(23,59,59,0);
    var isoStartDate = new Date(startDate).toISOString();
    var isoEndDate = new Date(endDate).toISOString();
    var task = app.models.Task;
    task.find(
      { where:
        { close: {between: [isoStartDate, isoEndDate] }}
      }, 
      function(err, results) {
        if (err) 
          return cb(err);
        else
          cb(null, results);
      })
    };

  Task.remoteMethod("getDueTask",
  {
    http: { path: '/dueToDay', verb: "get", errorStatus: 401 },
    description: ["get due task where will be close in 5 days"],
    returns: {arg: 'Task', type: 'object', root: true}
        
   });  
};
