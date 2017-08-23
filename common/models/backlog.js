'use strict';
var app = require('../../server/server');
var codeGenerator = require("../utils/code-generator");

module.exports = function (Backlog) {
  Backlog.validatesUniquenessOf('code', { message: 'code already exists' });

  Backlog.observe("before save", (context, next) => {
    var Project = app.models.Project;
    var data = context.instance || context.data;

    if (context.isNewInstance)
      data.code = codeGenerator();

    Project.findById(data.projectId, (err, project) => {
      if (err)
        return next(err);
      data.projectId = project.id;
      next();
    })
  });


  //Get detail backlog
  Backlog.backlogDetail = function(id, cb) {
      var backlogPromise = app.models.Backlog.findById(id);
      var closedPromise = app.models.Task.count( {backlogId : id, status: "closed"});
      var totalPromise = app.models.Task.count( {backlogId : id});
      Promise.all([backlogPromise, closedPromise, totalPromise]).then(results => {
            var backlog = results[0];
            backlog.closedTask = results[1];
            backlog.totalTask = results[2];
            var result = backlog.closedTask / backlog.totalTask * 100;
            backlog.progress = result.toFixed(2);
            cb(null, backlog);
        });
  };

  Backlog.remoteMethod("backlogDetail",
    {
        accepts: { arg: 'id', type: 'string', required: true},
        http: { path: '/:id/detailBacklog', verb: "get", errorStatus: 401},
        description: ["get backlog detail with progress"],
        returns: {arg: 'backlog', type: 'object', root: true}
        
    });
};
