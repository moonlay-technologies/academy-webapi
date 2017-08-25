'use strict';
var app = require('../../server/server');
module.exports = function (Project) {
    // Project.validatesPresenceOf('name');
    Project.validatesUniquenessOf('code');

    // count progress of project by id
    Project.projectProgressById = function (id, cb) {
        var dateNow = new Date();
        var completedPromise = app.models.Backlog.count({ projectId: id, status: "closed" });
        var totalPromise = app.models.Backlog.count({ projectId: id, status: "open" });

        app.models.Project.findById(id, function (err, results) {
            if (err)
                return cb(err);
            else {
                var project = results;
                Promise.all([completedPromise, totalPromise]).then(results => {
                    var completed = results[0];
                    var total = results[1];
                    var progress = 0;
                    if(total != 0) 
                        progress = ((completed/total) * 100).toFixed(2);
                    
                    project.completedBacklog = completed;
                    project.totalBacklog = total;
                    project.progress = progress;
                    cb(null, project);
                });
            }
        });

    };


    Project.remoteMethod("projectProgressById",
    {
        accepts: { arg: 'id', type: 'string', required: true },
        http: { path: '/:id/projectProgressById', verb: "get", errorStatus: 401 },
        description: ["get project progress by id"],
        returns: { arg: "progress", type: "object", root: true }
    });

};
