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

    //get assignment
    Report.getAssignmentsIncludeTask = function(account_id,cb){
        app.models.Assignment.find(
            {
            where:
                {
                accountId: account_id,
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


    Report.remoteMethod("getAssignmentsIncludeTask",
        {
            accepts: [{ arg: 'accountId', type: 'string'}],
            http: { path:"/account/:account_id/assignments/", verb: "get", errorStatus: 401,},
            description: ["Mengambil assignments termasuk task setiap akun"],
            returns: {arg: "Assignments", type: "object",root:true}
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
        http: { path:"/account/:account_id/assignments/closed/count", verb: "get", errorStatus: 401,},
        description: ["Menghitung assignment yang telah closed dari setiap akun."],
        returns: {arg: "count", type: "object",root:true}
    })

//open Assignment
    Report.countOpenAssignmentbyUser = function(account_id,cb){
        app.models.Assignment.count({accountId: account_id,status: "open"},function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, count);
        }
        }) 
    };

    Report.remoteMethod("countOpenAssignmentbyUser",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/assignments/open/count", verb: "get", errorStatus: 401,},
        description: ["Menghitung assignment yang telah open dari setiap akun."],
        returns: {arg: "count", type: "object",root:true}
    })

    //elapsed by user
    Report.getElapsedbyUser = function(account_id,cb){
        app.models.Assignment.find({where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var sum = assignments.reduce(function(last, d) {
                return d.elapsed + last;
            }, 0);
            cb(null, (sum/3600).toFixed(3));
        }
        }) 
    };

    Report.remoteMethod("getElapsedbyUser",
    {
        accepts: [{ arg: 'account_id', type: 'string' }],
        http: { path:"/account/:account_id/assignments/elapsed/", verb: "get", errorStatus: 401,},
        description: ["Mengambil total elapsed time dari setiap akun."],
        returns: {arg: "total", type: "object", root:true}
    })

//budget for user
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
        http: { path:"/account/:account_id/assignments/budget", verb: "get", errorStatus: 401,},
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
            var sum = assignments.reduce(function(last, d) 
            {  
                if(d.status=='closed'){
                    return 1 + last;
                }else {
                    return 0+last;
                }     
            }, 0);
            var sumElapsed = assignments.reduce(function(last, d) 
            {   
                if(d.status=='closed'){
                    return d.elapsed + last;
                }else {
                    return 0+last;
                }   
            }, 0);
            var sumBudget = assignments.reduce(function(last, d) {
                if(d.status=='closed'){
                    return d.budget + last;
                }else {
                    return 0+last;
                }
            }, 0);

            if(sumBudget!=0&&sumElapsed!=0){
                efficiency = ((sumBudget/(sumElapsed/3600))*100).toFixed(2);
            }else{
                efficiency = " - "
            }
            console.log("count "+sum);
            console.log("effisiensi "+efficiency);
            efficiency = efficiency/sum;
            cb(null, efficiency.toFixed(2));
        }
        }) 
    };

    Report.remoteMethod("getEfficiencyInAllAssignments",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/assignments/efficiency/", verb: "get", errorStatus: 401,},
        description: ["Mengambil rata-rata efisiensi setiap akun pada semua assignments."],
        returns: {arg: "efficiency", type: "object",root:true}
    })

    Report.getEfficiencyPerDate = function(account_id,date_start,date_end,cb){

        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        // start_time.setHours(start_time-1);
        console.log(start_time)
        end_time.setHours((((end_time.getHours()+(end_time.getTimezoneOffset()/-60))+(23-(end_time.getTimezoneOffset()/-60)))),59,59,0);
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
            var efficiency;
            var sum = assignments.reduce(function(last, d) 
            {  
                if(d.status=='closed'){
                    return 1 + last;
                }else {
                    return 0+last;
                }     
            }, 0);
            var sumElapsed = assignments.reduce(function(last, d) 
            {   
                if(d.status=='closed'){
                    return d.elapsed + last;
                }else {
                    return 0+last;
                }   
            }, 0);
            var sumBudget = assignments.reduce(function(last, d) {
                if(d.status=='closed'){
                    return d.budget + last;
                }else {
                    return 0+last;
                }
            }, 0);

            if(sumBudget!=0&&sumElapsed!=0){
                efficiency = ((sumBudget/(sumElapsed/3600))*100).toFixed(2);
            }else{
                efficiency = " - "
            }
            console.log("count "+sum);
            console.log("effisiensi "+efficiency);
            efficiency = efficiency/sum;
            cb(null, efficiency.toFixed(2));
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


    ///////////////////////////////////////////////////////////////////////////////////////////////
    Report.getAssignmentsPerDate = function(account_id,date_start,date_end,cb){
        
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        // start_time.setHours(start_time-1);
        console.log(start_time)
        end_time.setHours((((end_time.getHours()+(end_time.getTimezoneOffset()/-60))+(23-(end_time.getTimezoneOffset()/-60)))),59,59,0);
        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.find (
            {
                include: {
                    relation:'task',
                    scope:{
                        include:'project'
                    }
                },
                order:'date DESC',
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
        description: ["Assignment per akun berdasarkan tanggal."],
        returns: {arg: "Assignments", type: "object",root: true}
    })

    Report.countAssignmentsPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        // start_time.setHours(start_time-1);
        console.log(start_time)
        end_time.setHours((((end_time.getHours()+(end_time.getTimezoneOffset()/-60))+(23-(end_time.getTimezoneOffset()/-60)))),59,59,0);
        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.count(
            {
                accountId: account_id,
                date:{
                between: [start_time, end_time]
            }},
            function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, count);
        }
        }) 
    };
    Report.remoteMethod("countAssignmentsPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/count", verb: "get", errorStatus: 401,},
        description: ["Total Assignment per akun berdasarkan tanggal."],
        returns: {arg: "count", type: "object",root: true}
    })


    ///////////////////////////////////////////count closed and open assignment by date/////////////////////////////////////////////////////////////////////
    ////////////////////<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    Report.countClosedAssignmentsPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        // start_time.setHours(start_time-1);
        console.log(start_time)
        end_time.setHours((((end_time.getHours()+(end_time.getTimezoneOffset()/-60))+(23-(end_time.getTimezoneOffset()/-60)))),59,59,0);
        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();
        app.models.Assignment.count(
            {
                accountId: account_id,
                status: "closed",
                date:{
                between: [start_time, end_time]},
            },
            function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, count);
        }
        }) 
    };
    Report.remoteMethod("countClosedAssignmentsPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/closed/count", verb: "get", errorStatus: 401,},
        description: ["Menghitung 'closed assignment' per akun berdasarkan tanggal."],
        returns: {arg: "count", type: "object",root: true}
    })

    Report.countOpenAssignmentsPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        // start_time.setHours(start_time-1);
        console.log(start_time)
        end_time.setHours((((end_time.getHours()+(end_time.getTimezoneOffset()/-60))+(23-(end_time.getTimezoneOffset()/-60)))),59,59,0);
        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

       app.models.Assignment.count(
            {
                accountId: account_id,
                status: 'open',
                date:{
                between: [start_time, end_time]},
            },
            function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            cb(null, count);
        }
        }) 
    };
    Report.remoteMethod("countOpenAssignmentsPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/open/count", verb: "get", errorStatus: 401,},
        description: ["Menghitung 'Open Assignment' per akun berdasarkan tanggal."],
        returns: {arg: "Count", type: "object",root: true}
    })

    /////////////////////////////////////////////budget and elapsed by date//////////////////////////////////////////////////////////////////
    /////////////////////////////////////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Report.getBudgetPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        // start_time.setHours(start_time-1);
        console.log(start_time)
        end_time.setHours((((end_time.getHours()+(end_time.getTimezoneOffset()/-60))+(23-(end_time.getTimezoneOffset()/-60)))),59,59,0);
        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.find (
            {
                where:
                {accountId: account_id,
            date:{
                between: [start_time, end_time]
            }}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var sumBudget = assignments.reduce(function(last, d) {
                return d.budget + last;
            }, 0);
            cb(null, sumBudget);
        }
        }) 
    };
    Report.remoteMethod("getBudgetPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/budget", verb: "get", errorStatus: 401,},
        description: ["Get total Budget in Date range per Account."],
        returns: {arg: "Total Budget", type: "object",root: true}
    })
    
    Report.getElapsedPerDate = function(account_id,date_start,date_end,cb){
        var start_time = new Date(date_start);
        var end_time = new Date(date_end);
        // start_time.setHours(start_time-1);
        console.log(start_time)
        end_time.setHours((((end_time.getHours()+(end_time.getTimezoneOffset()/-60))+(23-(end_time.getTimezoneOffset()/-60)))),59,59,0);
        start_time=start_time.toUTCString();
        end_time=end_time.toUTCString();

        app.models.Assignment.find (
            {
                where:
                {accountId: account_id,
            date:{
                between: [start_time, end_time]
            }}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            
            var sumElapsed = assignments.reduce(function(last, d) {
                return d.elapsed + last;
            }, 0);
            cb(null, (sumElapsed/3600).toFixed(3));
        }
        }) 
    };
    Report.remoteMethod("getElapsedPerDate",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'date_start', type: 'string'},{ arg: 'date_end', type: 'string'}],
        http: { path:"/account/:account_id/:date_start/to/:date_end/assignments/elapsed", verb: "get", errorStatus: 401,},
        description: ["Get Elapsed Time in Date range per Account."],
        returns: {arg: "Elapsed time", type: "object",root: true}
    })  

    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    Report.getProjectperAccount = function(account_id,cb){
        app.models.Assignment.find(
            {
                include: {
                    relation:'task',
                    scope:{
                        include:'project'
                    }
                },
                where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
           return cb(err);
        else { 
            var promiseTask = []; 
            var promiseProject = [];    
            var temp;          
            for(var a of assignments){
                if(a.taskId!=null){
                    temp = app.models.Task.findOne({where: {id: a.taskId}});
                    promiseTask.push(temp);
                }
                console.log(a.taskId)
            } 
            temp = null;
            Promise.all(promiseTask).then( results=>{
                for(var r of results){
                    if(r.projectId!=null){
                        temp = app.models.Project.findOne({where: {id: r.projectId}});
                        promiseProject.push(temp);  
                    }
                }
                console.log("task");
                console.log(results);
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
            })
        }
        }) 
    };

    Report.remoteMethod("getProjectperAccount",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/project", verb: "get", errorStatus: 401,},
        description: ["Mengambil project setiap akun."],
        returns: {arg: "Projects", type: "object",root:true}
    })

    Report.countProjectperAccount = function(account_id,cb){
        var projects=[];
        app.models.Assignment.find({where: {accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
           return cb(err);
        else {
            var promiseTask = []; 
            var promiseProject = [];    
            var temp;          
            for(var a of assignments){
                if(a.taskId!=null){
                    temp = app.models.Task.findOne({where: {id: a.taskId}});
                    promiseTask.push(temp);
                }
                console.log(a.taskId)
            } 
            temp = null;
            Promise.all(promiseTask).then( results=>{
                for(var r of results)
                    {
                    if(r.projectId!=null)
                        {
                        temp = app.models.Project.findOne({where: {id: r.projectId}});
                        promiseProject.push(temp);  
                    }
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

//get assignment project account
    Report.getAssignmentInProject = function(account_id,project_id,cb){
        app.models.Assignment.find({include:"task",where:{accountId: account_id}},function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var arr = [];
            var newData = {};
            for(var a of assignments){   
                if(a.projectId===project_id){
                    arr.push(a);
                }
            }            
            cb(null,ass);
        }
        }) 
    };

    Report.remoteMethod("getAssignmentInProject",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'project_id', type: 'string'}],
        http: { path:"/account/:account_id/:project_id/assignments", verb: "get", errorStatus: 401,},
        description: ["Mengambil assignment pada Project."],
        returns: {arg: "assignments", type: "object",root:true}
    })

    Report.countAssignmentInProject = function(account_id,project_id,cb){
        app.models.Assignment.find({include:"task",accountId: account_id,projectId: project_id},function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var arr = [];
            var newData = {};
            for(var a of assignments){   
                if(a.projectId==project_id){
                    arr.push(a);
                }
            }            
            cb(null,arr);
        }
        }) 
    };

    Report.remoteMethod("countAssignmentInProject",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'project_id', type: 'string'}],
        http: { path:"/account/:account_id/:project_id/assignments/count", verb: "get", errorStatus: 401,},
        description: ["Menghitung assignment dari setiap project."],
        returns: {arg: "count", type: "object",root:true}
    })

    Report.getEfficiencyPerProject = function(account_id,project_id,cb){
        app.models.Assignment.find({where: {projectId: project_id}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            console.log(assignments)
            var sumElapsed = assignments.reduce(function(last, d) {
                return d.elapsed + last;
            }, 0);
            var sumBudget = assignments.reduce(function(last, d) {
                return d.budget + last;
            }, 0);
            var efficiency= 0;
            if((sumBudget!=null&&sumBudget!=0) && (sumElapsed!=null&&sumElapsed!=0)){
                efficiency = (((sumBudget)/(sumElapsed/3600))*100).toFixed(2);
            }else{
                efficiency = 0;
            }
            cb(null, efficiency);
        }
        }) 
    };
    Report.remoteMethod("getEfficiencyPerProject",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{ arg: 'project_id', type: 'string'}],
        http: { path:"/account/:account_id/:project_id/efficiency/", verb: "get", errorStatus: 401,},
        description: ["Total efisiensi per akun berdasarkan project."],
        returns: {arg: "efficiency", type: "object",root: true}
    })

    
    //get assignment yang terlewatkan
    Report.getExceededAssignments = function(account_id,cb){
        var date = new Date();
        app.models.Assignment.find({where: {and: [{accountId: account_id},{deadline: {lt: date}},{status: 'open'}]}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            console.log(assignments);
            cb(null, assignments);
        }
        }) 
    };
    Report.remoteMethod("getExceededAssignments",
    {
        accepts: [{ arg: 'account_id', type: 'string', require: true}],
        http: { path:"/account/:account_id/assignments/exceeded", verb: "get", errorStatus: 401,},
        description: ["mengambil assignment yang melewati deadline."],
        returns: {arg: "assignments", type: "object",root: true}
    })

    Report.countExceededAssignments = function(account_id,cb){
        var date = new Date();
        app.models.Assignment.count({accountId: account_id,deadline: {lt: date},status: 'open'},
            function(err, count){
        if(err || account_id === 0)
            return cb(err);
        else {
            console.log(count);
            cb(null, count);
        }
        }) 
    };
    Report.remoteMethod("countExceededAssignments",
    {
        accepts: [{ arg: 'account_id', type: 'string', require: true}],
        http: { path:"/account/:account_id/assignments/exceeded/count", verb: "get", errorStatus: 401,},
        description: ["menghitung assignment yang melewati deadline."],
        returns: {arg: "coumnt", type: "object",root: true}
    })

    ///////////////////////////dipanggil untuk data di chart///////////////////////////////////////////////
    Report.getDataInLatestSixMonths = function(account_id,today,cb){
        var date = new Date(today);
        var end_date = new Date();
        end_date.setDate(new Date(date.getFullYear(),date.getMonth(),0).getDate())
        end_date.setHours((((end_date.getHours()+(end_date.getTimezoneOffset()/-60))+(23-(end_date.getTimezoneOffset()/-60)))),59,59,0);
        var difference  = date.getMonth()-5; 
        var start_date = new Date(date.getFullYear(),date.getMonth()-5,1);
        // start_date.setHours((((start_date.getHours()+(start_date.getTimezoneOffset()/-60)))),59,59,0);
        console.log(start_date);


        app.models.Assignment.find (
            {
                where:
                {accountId: account_id,
            date:{
                between: [start_date, end_date]
            }}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {

            var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            var months=[];
            var budget = [];
            var elapsed = [];
            var totalAssignment = [];
            var efficiency = [];
            console.log("start : "+start_date.getMonth()+"\n end : "+end_date.getMonth());
                var today = new Date();
                var d;
                var month;

                // for(var i = 5; i >= 0; i -= 1) {
                // if(i = 5){d = new Date(today.getFullYear(), today.getMonth() - i,);}
                // else{

                // }
                // console.log(d.getFullYear()+" "+d.getDate())
                // month = monthNames[d.getMonth()];
                // months.push(month);
                // }
                if(difference<0){
                    for(var i = start_date.getMonth();i<=end_date.getMonth();i++){
                        months.push(""+monthNames[i]+" "+start_date.getFullYear());
                        var temBudget = 0 ;
                        var temElapsed = 0;
                        var temTotalAssignment = 0;
                        var temEfficiency = 0;
                        for(var a of assignments){
                            var tempDate = new Date(a.date);
                            if(tempDate.getMonth()==i){
                                temTotalAssignment += 1;
                                temBudget += a.budget;
                                temElapsed += a.elapsed;
                                temEfficiency = (temBudget/(temElapsed/3600))    
                                // console.log("ini hasilnya "+tempDate)

                            }
                            // var sumBudget = assignments.reduce(function(last, d) {
                            //     return d.budget + last;
                            // }, 0);
                        }
                        budget.push(temBudget);
                        elapsed.push(((temElapsed)/3600).toFixed(2));
                        totalAssignment.push(temTotalAssignment)
                        efficiency.push(temEfficiency);
                    }   
                }
                // for(var i = start_date.getMonth();i<=end_date.getMonth();i++){
                //     months.push(""+monthNames[i]+" "+start_date.getFullYear());
                //     var temBudget = 0 ;
                //     var temElapsed = 0;
                //     var temTotalAssignment = 0;
                //     var temEfficiency = 0;
                //     for(var a of assignments){
                //         var tempDate = new Date(a.date);
                //         if(tempDate.getMonth()==i){
                //             temTotalAssignment += 1;
                //             temBudget += a.budget;
                //             temElapsed += a.elapsed;
                //             temEfficiency = (temBudget/(temElapsed/3600))    
                //             // console.log("ini hasilnya "+tempDate)

                //         }
                //         // var sumBudget = assignments.reduce(function(last, d) {
                //         //     return d.budget + last;
                //         // }, 0);
                //     }
                //     budget.push(temBudget);
                //     elapsed.push(((temElapsed)/3600).toFixed(2));
                //     totalAssignment.push(temTotalAssignment)
                //     efficiency.push(temEfficiency);
                // }
            
                var data = {
                "horizontal":months,
                "value":
                    {
                        "budget":budget,
                        "elapsed":elapsed,
                        "efficiency":efficiency
                    },
                "totalAssignment":totalAssignment    
            }
            cb(null, data);
        }
        }) 
    };
    Report.remoteMethod("getDataInLatestSixMonths",
    {
        accepts: [{ arg: 'account_id', type: 'string'},{arg: 'today',type:'string'}],
        http: { path:"/account/:account_id/:today/data/sixmonths", verb: "get", errorStatus: 401,},
        description: ["Get data untuk line chart per enam bulan terakhir."],
        returns: {arg: "data", type: "object",root:"true"}
    })
    // ^^
    // ||
    //<<< belum selesai


    Report.getDataInThisMonth = function(account_id,cb){
        var date = new Date();
        var end_date = new Date(date);
        var daysInMonths = new Date(date.getFullYear(),date.getMonth(),0).getDate();
        end_date.setDate(daysInMonths);
        var start_date = new Date();
        start_date.setDate(1);
        app.models.Assignment.find (
            {
                where:
                {accountId: account_id,
            date:{
                between: [start_date, end_date]
            }}},
            function(err, assignments){
        if(err || account_id === 0)
            return cb(err);
        else {
            var days = []
            var budget = [];
            var elapsed = [];
            var totalAssignment = [];
            var efficiency = [];
            console.log(date.getDate());
            var temBudget = 0 ;
            var temElapsed = 0;
            var temTotalAssignment = 0;
            var temEfficiency = 0;

                for(var i = 1;i<=daysInMonths;i++){

                    days.push(""+i);
                    var closedDate;
                    
                    for(var a of assignments){
                        var tempDate = new Date(a.date);
                        closedDate = new Date(a.closedDate);
                        console.log(closedDate.getDate());

                        if(closedDate.getDate()==i){
                            console.log("tanggal tutup : "+i)
                              
                            temTotalAssignment -= 1;
                            temBudget -= a.budget;
                            temElapsed -= (a.elapsed/3600);
                            // temEfficiency = (a.budget/(a.elapsed/3600))  
                            
                        }
                        if(tempDate.getDate()==i){
                            console.log("tanggal : "+i )
                            temTotalAssignment += 1;
                            temBudget += a.budget;
                            temElapsed += (a.elapsed/3600); 
                            // temEfficiency = 0
                        }
                    }
                    if(i<=date.getDate())
                        {
                            budget.push(temBudget);
                            elapsed.push(temElapsed);
                            efficiency.push(temEfficiency);
                            totalAssignment.push(temTotalAssignment)
                        }
                }
            
                var data = {
                "horizontal":days,
                "value":
                    {
                        "budget":budget,
                        "elapsed":elapsed,
                        "efficiency":efficiency
                    },
                "totalAssignment":totalAssignment    
            }
            cb(null, data);
        }
        }) 
    };
    Report.remoteMethod("getDataInThisMonth",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/data/this_months", verb: "get", errorStatus: 401,},
        description: ["Get data untuk chart sebulan terakhir."],
        returns: {arg: "data", type: "object",root:"true"}
    })

    Report.getWorkHoursInThisMonth = function(account_id,cb){
        var date = new Date();
        var end_date = new Date(date);
        var daysInMonths = new Date(date.getFullYear(),date.getMonth(),0).getDate();
        end_date.setDate(daysInMonths);
        var start_date = new Date();
        start_date.setDate(1);
        app.models.Timerecord.find (
            {
                include:{
                    relation:'assignment',
                    scope:{
                        accountId: account_id
                    }
                },
                where:
                {
                    date:
                    {
                        between: [start_date, end_date]
                    }
                }    
            },
            function(err, timerecords){
        if(err || account_id === 0)
            return cb(err);
        else {
            var days = []
            var duration = [];
            console.log(date.getDate());
            var temDuration = 0 ;
                for(var i = 1;i<=daysInMonths;i++){
                    days.push(""+i);                    
                    for(var a of timerecords){
                        var tempDate = new Date(a.date);
                        console.log(tempDate);
                        if(tempDate.getDate()==i){
                            console.log("tanggal : "+i )
                            temDuration += a.duration;
                        }
                    }
                    if(i<=date.getDate())
                        {
                            duration.push(temDuration);
                        }
                }
                var data = {
                "horizontal":days,
                "value":
                    {
                        "duration":duration,
                    },
            }
            cb(null, data);
        }
        }) 
    };
    Report.remoteMethod("getWorkHoursInThisMonth",
    {
        accepts: [{ arg: 'account_id', type: 'string'}],
        http: { path:"/account/:account_id/workHours/this_months", verb: "get", errorStatus: 401,},
        description: ["Get jumlah jam kerja setiap hari untuk chart sebulan terakhir."],
        returns: {arg: "data", type: "object",root:"true"}
    })
    //<<<<<<<<<<<<<<<<<<<<<<<<<<hingga di sini untuk data di chart<<<<
};

 