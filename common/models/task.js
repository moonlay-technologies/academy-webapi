'use strict';
var app = require('../../server/server');
var codeGenerator = require("../utils/code-generator");

module.exports = function (Task) {

Task.getElapsedbyAssignment = function (id, cb)
{
    app.models.Assignment.find({where: {taskId: id}}, function (err, assignments){
    if(err || id === 0)
        return cb(err);
    else{
        console.log(assignments);
        var sum = assignments.reduce(function(last, d) {
            return d.elapsed + last;
        }, 0);
        cb(null, sum);
    }
})};
    
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


Task.remoteMethod("getElapsedbyAssignment",
{
    accepts:[{arg: 'id', type: 'string', required: true}],
    http:{path: '/:id/actual', verb: "get", errorStatus: 401},
    returns:{arg: "Actual", type:"decimal"}})
};       