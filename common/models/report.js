'use strict';
var app = require('../../server/server');

module.exports = function(Report) {

    Report.status = function(cb) {
        var currentDate = new Date();
        var currentHour = currentDate.getHours();
        var OPEN_HOUR = 8;
        var CLOSE_HOUR = 17;
        console.log('Current hour is %d:%d', currentHour,currentDate.getMinutes());
        var response;
        if (currentHour > OPEN_HOUR && currentHour < CLOSE_HOUR) {
        response = 'Masih jam kerja.';
        } else {
        response = 'Tidak jam kerja.';
        }
        cb(null, response);
    };


    Report.remoteMethod(
        'status', {
        http: {
            path: '/status',
            verb: 'get'
        },
        returns: {
            arg: 'status',
            type: 'string'
        }
        }
    );    

    //get open assignment
    Report.getAssignmentsOpenIncludeTask = function(account_id,cb){
        app.models.Assignment.find(
            {
                where:
                {
                accountId: account_id,
                status :"open"

            },
            include:{
                relation: 'task'
            }
           },function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, assignments);
        }
        })
    };


    Report.remoteMethod("getAssignmentsOpenIncludeTask",
        {
            accepts: [{ arg: 'accountId', type: 'string'}],
            http: { path:"/account/:account_id/assignments/get/open", verb: "get", errorStatus: 401,},
            description: ["Mengambil assignments yang berstatus open termasuk task setiap akun"],
            returns: {arg: "Assignments", type: "object"}
    })

    //get close assignment
    Report.getAssignmentsCloseIncludeTask = function(account_id,cb){
        app.models.Assignment.find(
            {
                where:
                { and: 
                       [{accountId: account_id},
                       {status: "closed"}]
                
            },
            include:{
                relation: 'task'
            }
           },function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, assignments);
        }
        })
    };


    Report.remoteMethod("getAssignmentsCloseIncludeTask",
        {
            accepts: [{ arg: 'accountId', type: 'string'}],
            http: { path:"/account/:account_id/assignments/get/closed", verb: "get", errorStatus: 401,},
            description: ["Mengambil assignments yang berstatus closed termasuk task setiap akun"],
            returns: {arg: "Assignments", type: "array",root:true}
    })
    
    Report.countAssignment = function(account_id,cb){
        app.models.Assignment.count({accountId: account_id},function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, count);
        }
        })
    };

  Report.remoteMethod("countAssignment",
    {
        accepts: [{ arg: 'accountId', type: 'string'}],
        http: { path:"/account/:account_id/assignments/count", verb: "get", errorStatus: 401,},
        description: ["Mengambil jumlah assignments setiap akun"],
        returns: {arg: "count", type: "object",root:true}
  })

    Report.countClosedAssignmentbyUser = function(account_id,cb){
        app.models.Assignment.count({accountId: account_id,status: "closed"},function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, count);
        }
        }) 
    };

    Report.remoteMethod("countClosedAssignmentbyUser",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/assignments/closed/", verb: "get", errorStatus: 401,},
        description: ["Menghitung assignment yang telah closed dari setiap akun."],
        returns: {arg: "count", type: "object",root:true}
    })

//opened Assignment
    Report.countOpenAssignmentbyUser = function(account_id,cb){
        app.models.Assignment.count({accountId: account_id,status: "open"},function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            console.log()
            console.log("ini yang open lohh " +count);
            cb(null, count);
        }
        }) 
    };

    Report.remoteMethod("countOpenAssignmentbyUser",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/assignments/open/", verb: "get", errorStatus: 401,},
        description: ["Menghitung assignment yang telah open dari setiap akun."],
        returns: {arg: "count", type: "object",root:true}
    })


    Report.getElapsedbyUser = function(account_id,cb){
        app.models.Assignment.find({where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var sum = assignments.reduce(function(last, d) {
                return d.elapsed + last;
            }, 0);
            cb(null, sum);
        }
        }) 
    };

    Report.remoteMethod("getElapsedbyUser",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/assignments/elapsed/", verb: "get", errorStatus: 401,},
        description: ["Mengambil total elapsed time dari setiap akun."],
        returns: {arg: "total", type: "object", root:true}
    })

    Report.getBudgetForUser = function(account_id,cb){
        app.models.Assignment.find({where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var sum = assignments.reduce(function(last, d) {
                return d.budget + last;
            }, 0);
            cb(null, sum);
        }
        }) 
    };

    Report.remoteMethod("getBudgetForUser",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/assignments/budget/", verb: "get", errorStatus: 401,},
        description: ["Mengambil total budget time dari setiap akun."],
        returns: {arg: "total", type: "object", root:true}
    }) 

    //
    Report.getEfficiencyInAllAssignments = function(account_id,cb){
        app.models.Assignment.find({where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var efficiency;
            var getData=[];
            var sumElapsed = assignments.reduce(function(last, d) {
                return d.elapsed + last;
            }, 0);
            var sumBudget = assignments.reduce(function(last, d) {
                return d.budget + last;
            }, 0);
            if(sumBudget!=0&&sumElapsed!=0){
                efficiency = ((sumBudget/sumElapsed)*100).toFixed(2);
            }
            cb(null, efficiency);
        }
        }) 
    };

    Report.remoteMethod("getEfficiencyInAllAssignments",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/assignments/efficiency/", verb: "get", errorStatus: 401,},
        description: ["Mengambil efisiensi setiap akun pada semua assignments."],
        returns: {arg: "efficiency", type: "object",root:true}
    })

    Report.getEfficiencyPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.find ({where:{accountId: account_id,
            date:{
                between: [start_time, end_time]
            }}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var efficiencyData = [];
            var sumElapsed = assignments.reduce(function(last, d) {
                return d.elapsed + last;
            }, 0);
            var sumBudget = assignments.reduce(function(last, d) {
                return d.budget + last;
            }, 0);
            var efficiency = ((sumBudget/sumElapsed)*100).toFixed(2) ;
            cb(null, efficiency);
        }
        }) 
    };
    Report.remoteMethod("getEfficiencyPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/efficiency/", verb: "get", errorStatus: 401,},
        description: ["Total efisiensi per akun berdasarkan tanggal."],
        returns: {arg: "efficiency", type: "object",root: true}
    })

    Report.getAssignmentsPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);

        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.find (
            {
                include: 'task',
                where:
                {accountId: account_id,
            date:{
                between: [start_time, end_time]
            }}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, assignments);
        }
        }) 
    };
    Report.remoteMethod("getAssignmentsPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/", verb: "get", errorStatus: 401,},
        description: ["Total Assignment per akun berdasarkan tanggal."],
        returns: {arg: "Assignments", type: "array",root: true}
    })
    
    //kalau dipanggil ke aurelia ga bekerja dengan baik
    Report.getClosedAssignmentsPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);

        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.find (
            {
                include: 'task',
                where:{
                    and:
                    [
                        {accountId: account_id},
                        {date:{
                            between: [start_time, end_time]}},
                        {  status: "closed"}
                    ]
                }
                },
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, assignments);
        }
        }) 
    };
    Report.remoteMethod("getAssignmentsPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/closed", verb: "get", errorStatus: 401,},
        description: ["Closed Assignment per akun berdasarkan tanggal."],
        returns: {arg: "Assignments", type: "array",root: true}
    })

    //kalau dipanggil ke aurelia ga bekerja dengan baik
    Report.getOpenAssignmentsPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);

        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.find (
            {
                include: 'task',
                where:
                {accountId: account_id,
            date:{
                between: [start_time, end_time],
                status: 'open'
            }}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, assignments);
        }
        }) 
    };
    Report.remoteMethod("getAssignmentsPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/open", verb: "get", errorStatus: 401,},
        description: ["Open Assignment per akun berdasarkan tanggal."],
        returns: {arg: "Assignments", type: "array",root: true}
    })

    

    //sekarang kita berada dari sini kebawahhh        
    //belum//hasil masih duplikat

    Report.getProjectperAccount = function(account_id,cb){
        var projects=[];
        app.models.Assignment.find({where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
           return cb(err);
        else {
            var promiseProject = [];            
            for(var a of assignments){
                var temp = app.models.Project.findOne({where: {id: a.project_id}});
                promiseProject.push(temp);     
            } 
            Promise.all(promiseProject).then(results => {

            var out = [];
            for (var i = 0, l = results.length; i < l; i++) {
                var unique = true;
                for (var j = 0, k = out.length; j < k; j++) {
                    if (results[i].code === out[j].code) {
                        unique = false;
                    }
                }
                if (unique) {
                    out.push(results[i]);
                }
            }
                cb(null, out);
            })
        }
        }) 
    };

    Report.remoteMethod("getProjectperAccount",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/project", verb: "get", errorStatus: 401,},
        description: ["Mengambil project setiap akun."],
        returns: {arg: "Projects", type: "array",root:true}
    })

    Report.countProjectperAccount = function(account_id,cb){
        var projects=[];
        app.models.Assignment.find({where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
           return cb(err);
        else {
            var promiseProject = [];            
            for(var a of assignments){
                var temp = app.models.Project.findOne({where: {id: a.project_id}});
                promiseProject.push(temp);     
            } 
            Promise.all(promiseProject).then(results => {

                var out = [];
            for (var i = 0, l = results.length; i < l; i++) {
                var unique = true;
                for (var j = 0, k = out.length; j < k; j++) {
                    if (results[i].code === out[j].code) {
                        unique = false;
                    }
                }
                if (unique) {
                    out.push(results[i]);
                }
            }
                cb(null, out.length);
            })
        }
        }) 
    };

    Report.remoteMethod("countProjectperAccount",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/project/count", verb: "get", errorStatus: 401,},
        description: ["Mengambil project setiap akun."],
        returns: {arg: "Projects", type: "object",root:true}
    })

   
};

 