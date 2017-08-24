'use strict';
var app = require('../../server/server');
module.exports = function (Project) {
    // Project.validatesPresenceOf('name');
  Project.validatesUniquenessOf('code');

  // count progress of project by id
  Project.projectProgress = function(id, cb) {
      console.log(id);
      var closedPromise = app.models.Backlog.count( {projectId : id, status: "closed"});
      var totalPromise = app.models.Backlog.count( {projectId : id});
        Promise.all([closedPromise, totalPromise]).then(results => {
            var closedBacklog = results[0];
            var totalBacklog = results[1];
            var result = closedBacklog / totalBacklog * 100;
            result = result.toFixed(2);
            cb(null, {closedBacklog, totalBacklog, result});
        });
  };

  Project.remoteMethod("projectProgress", 
  {
        accepts: { arg: 'id', type: 'string', required: true},
        http: { path: '/:id/progress', verb: "get", errorStatus: 401 ,},
        description: ["get project progress"],
        returns: {arg: "progress", type: "object"}
        
  });

    // get detail and count progress of project by id 
  Project.projectDetailProgress = function(id, cb) {
      console.log(id);
      var projectPromise = app.models.Backlog.findById(id);
      var closedPromise = app.models.Backlog.count( {projectId : id, status: "closed"});
      var totalPromise = app.models.Backlog.count( {projectId : id});
        Promise.all([projectPromise, closedPromise, totalPromise]).then(results => {
            var project = results[0];
            project.closedBacklog = results[1];
            project.totalBacklog = results[2];
            var result = project.closedBacklog / project.totalBacklog * 100;
            project.progress = result.toFixed(2);
            cb(null, project);
        });
  };

  Project.remoteMethod("projectDetailProgress", 
    {
        accepts: { arg: 'id', type: 'string', required: true},
        http: { path: '/:id/detailProject', verb: "get", errorStatus: 401},
        description: ["get project detail with progress"],
        returns: {arg: 'project', type: 'object', root: true}
        
    });
  
};
