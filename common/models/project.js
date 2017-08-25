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
                    if (total != 0)
                        progress = ((completed / total) * 100).toFixed(2);

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

    Project.progressBacklog = function (id, cb) {
        var dateNow = new Date();
        var completedPromise = app.models.Backlog.count({ projectId: id, status: "closed" });
        var planningPromise = app.models.Backlog.count({ projectId: id, status: "open", deadline: {gte: dateNow}});
        var overDuePromise = app.models.Backlog.count({ projectId: id, status: "open", deadline: {lt: dateNow} });
        var totalPromise = app.models.Backlog.count({ projectId: id});
        
        Promise.all([completedPromise, planningPromise, overDuePromise, totalPromise]).then(results => {
            var backlogProgress ={};
            backlogProgress.completed = results[0];
            backlogProgress.planning = results[1];
            backlogProgress.overDue = results[2];
            backlogProgress.total = results[3];

            cb(null, backlogProgress);
        })

    };


    Project.remoteMethod("progressBacklog",
    {
        accepts: { arg: 'id', type: 'string', required: true },
        http: { path: '/:id/backlog/progress', verb: "get", errorStatus: 401 },
        description: ["get backlog progress"],
        returns: { arg: "progress", type: "object", root: true }
    });

    Project.progressTask = function (id, cb) {
        var dateNow = new Date();
        var completedPromise = app.models.Task.count({ projectId: id, status: "closed" });
        var planningPromise = app.models.Task.count({ projectId: id, status: "open", deadline: {gte: dateNow}});
        var overDuePromise = app.models.Task.count({ projectId: id, status: "open", deadline: {lt: dateNow} });
        var totalPromise = app.models.Task.count({ projectId: id});
        
        Promise.all([completedPromise, planningPromise, overDuePromise, totalPromise]).then(results => {
            var tasksProgress ={};
            tasksProgress.completed = results[0];
            tasksProgress.planning = results[1];
            tasksProgress.overDue = results[2];
            tasksProgress.total = results[3];
            cb(null, tasksProgress);
        })

    };


    Project.remoteMethod("progressTask",
    {
        accepts: { arg: 'id', type: 'string', required: true },
        http: { path: '/:id/tasks/progress', verb: "get", errorStatus: 401 },
        description: ["get tasks progress"],
        returns: { arg: "progress", type: "object", root: true }
    });
        

};
