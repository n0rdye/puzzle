const db = require('./db');
const func = require('./func');
const moment = require("moment");
const vars = require('./vars');

module.exports.load = (inp,cook,res)=>{
    try {
        db.gv("templates","name",`'${inp["name"]}'`,(pdata)=>{pdata = pdata[0];
            console.log(pdata);
            if (pdata != null){
                res.send({out:"good",body:pdata["body"]});
            }
            else{
                res.send({out:"bad proj"});
            }
        })
    } catch (error) {
        func.log("backend template loading error - ");
    }
}

module.exports.load_all = (inp,cook,res)=>{
    try {
        db.gav("templates","0",(pdata)=>{
            res.send({out:"good",body:pdata});
        })
    } catch (error) {
        func.log("backend templates loading err0r - " - error);
    }
}

module.exports.loads = (inp,cook,res)=>{
    try {
        db.gv("templates",'gid',`${inp["gid"]}`,(pdata)=>{
            res.send({out:"good",body:pdata});
        })
    } catch (error) {
        func.log("backend templates loading err0r - " - error);
    }
}


module.exports.load_groups = (inp,cook,res)=>{
    try {
        db.gav("template_groups","0",(pdata)=>{
            res.send({out:"good",body:pdata});
        })
    } catch (error) {
        func.log("backend templates loading err0r - " - error);
    }
}

module.exports.new_group = (inp,cook,res)=>{
    try {
        db.gv("template_groups","name",`'${inp["name"]}'`,(gdata)=>{gdata = gdata[0]
            if(gdata == null){
                func.log(`admin ${cook["uuid"]} created template group ${inp["name"]}`);
                db.nr("template_groups","`name`,`count`",`'${inp["name"]}','0'`,true);
                res.send({out:"good"});
            }
            else{
                res.send({out:"bad"});
            }
        })
    } catch (error) {
        func.log("backend template group creating err0r - "+error);
    }
}

module.exports.del_group = (inp,cook,res)=>{
    try {
        db.gv("template_groups","name",`'${inp["name"]}'`,(pdata)=>{pdata=pdata[0]
            // res.send({out:"good",body:pdata});
            if(pdata != null){
                db.dl("template_groups","id",pdata["id"],()=>{
                    res.send({out:"good"});
                    func.log(`good boy ${cook["uuid"]} deleted template group ${inp["name"]}`);
                },true)
            }
            else{
                res.send({out:"bad"});
            }
        })
    } catch (error) {
        func.log("backend template group delete err0r - " - error);
    }
}

module.exports.rename = (inp,cook,res)=>{
    try {
        db.gv("templates","`id`",`'${inp["id"]}'`,(proj_name)=>{ proj_name = proj_name[0];
            // console.log(proj_name);
            if(proj_name == null){
                db.sv("templates","name",`${inp["name"]}`,"id",`${inp["id"]}`, (db)=>{
                    res.send({out:"good"});
                })
            }
        })
    } catch (error) {
        func.log("backend templates loading err0r - " - error);
    }
}

module.exports.del = (inp,cook,res)=>{
    try {
        db.gv("templates","name",`'${inp["name"]}'`,(pdata)=>{pdata=pdata[0]
            // res.send({out:"good",body:pdata});
            if(pdata != null){
                db.dl("templates","id",pdata["id"],()=>{
                    res.send({out:"good"});
                    func.log(`good boy ${cook["uuid"]} deleted project ${inp["name"]}`);
                },true)
            }
            else{
                res.send({out:"bad"});
            }
        })
    } catch (error) {
        func.log("backend templates delete err0r - " - error);
    }
}

module.exports.save = (inp,cook,res)=>{
    try {
        db.gv("templates","name",`'${inp["name"]}'`,(pdata)=>{pdata = pdata[0]
            var date = moment().format('YYYY-MM-DD');
            var time = moment().format('hh:mm:ss');
            if(pdata == null){
                // func.log("proj not in");
                // func.log(pname,udata["id"],proj);
                func.log(`good boy ${cook["uuid"]} created template ${inp["name"]}`);
                db.nr("templates","`name`,`body`,`img`,`creation_date`,`gid`",`'${inp["name"]}','${inp["proj"]}','${inp["img"]}','${date+"T"+time}','${inp["gid"]}'`,true);
                res.send({out:"good"});
            } else if (pdata != null){
                if(inp["proj"] != JSON.stringify({height:"2",width:"4"})){
                    db.gv("templates","id",pdata["id"],(projin)=>{projin = projin[0]
                        db.sv("templates","body",inp["proj"],"id",projin["id"],()=>{},true);
                        db.sv("templates","last_change_date",`${date+"T"+time}`,"id",projin["id"],()=>{},true);
                        if(inp["img"] != "") db.sv("templates","img",inp["img"],"id",projin["id"],()=>{},true);
                        func.log(`good boy ${cook["uuid"]} saved template ${projin["name"]}`);
                        // func.log("proj in");
                        res.send({out:"good"});
                    })
                }
                else{
                    res.send({out:"bad",err:"proj"});
                }
            }
        })
    } catch (error) {
        func.log("backend templates saving err0r - "+error);
    }
}