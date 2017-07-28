'use strict';
var app = require('../../server/server');
module.exports = function (Project) {
    // Project.validatesPresenceOf('name');
  Project.validatesUniquenessOf('code');

  // count progress of project by id
  Project.projectWithProgress = function(id, cb) {
        var closedPromise = app.models.Backlog.count( {projectId : id, status: "closed"});
        var totalPromise = app.models.Backlog.count( {projectId : id});
        app.models.Project.findById(id, function(err, results) {
            if (err)
                return cb(err);
            else {
                var project = results;
                Promise.all([closedPromise, totalPromise]).then(results => {
                    project.closedBacklog = results[0];
                    project.totalBacklog = results[1];
                    project.progress = 0;
                    if(project.totalBacklog == 0)
                        cb(null, project);
                    else {
                        project.progress = (project.closedBacklog / project.totalBacklog * 100).toFixed(2);
                        cb(null, project);
                    }
                });
            }
        });
       
        
  };


  Project.remoteMethod("projectWithProgress", 
  {
        accepts: { arg: 'id', type: 'string', required: true},
        http: { path: '/:id/projectWithProgress', verb: "get", errorStatus: 401 },
        description: ["get project progress"],
        returns: {arg: "progress", type: "object", root: true}
        
  });
  
};
