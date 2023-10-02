const db = require('./db');
const func = require('./func');
const moment = require("moment");
const vars = require('./vars');

module.exports.load = (inp,cook,res)=>{
    try {
        db.gv("projects","id",inp["id"],(pdata)=>{pdata = pdata[0];
            if (pdata != null){
                func.log(`good boy ${cook["uuid"]} loaded project ${pdata["name"]}`);
                res.send({out:"good",body:pdata["body"]});
            }
            else{
                res.send({out:"bad proj"});
            }
        })
    } catch (error) {
        func.log("backend project loading error - ");
    }
}

module.exports.loads = (inp,cook,res)=>{
    try {
        db.gav("projects","0",(pdata)=>{
            res.send({out:"good",body:pdata});
        })
    } catch (error) {
        func.log("backend projects loading err0r - " - error);
    }
}

module.exports.rename = (inp,cook,res)=>{
    try {
        db.gv("projects","`id`",`'${inp["id"]}'`,(proj_name)=>{ proj_name = proj_name[0];
            // console.log(proj_name);
            if(proj_name == null){
                db.sv("projects","name",`${inp["name"]}`,"id",`${inp["id"]}`, (db)=>{
                    res.send({out:"good"});
                })
            }
        })
    } catch (error) {
        func.log("backend projects loading err0r - " - error);
    }
}

module.exports.del = (inp,cook,res)=>{
    try {
        db.gv("projects","id",`'${inp["id"]}'`,(pdata)=>{pdata=pdata[0]
            // res.send({out:"good",body:pdata});
            if(pdata != null){
                db.dl("projects","id",pdata["id"],()=>{
                    res.send({out:"good"});
                    func.log(`good boy ${cook["uuid"]} deleted project ${inp["name"]}`);
                })
            }
            else{
                res.send({out:"bad"});
            }
        })
    } catch (error) {
        func.log("backend projects delete err0r - " - error);
    }
}

module.exports.save = (inp,cook,res)=>{
    try {
        db.gv("projects","id",`'${inp["id"]}'`,(pdata)=>{pdata = pdata[0]
            var date = moment().format('YYYY-MM-DD');
            var time = moment().format('hh:mm:ss');
            if(pdata == null){
                // func.log("proj not in");
                // func.log(pname,udata["id"],proj);
                func.log(`good boy ${cook["uuid"]} created project ${inp["name"]}`);
                db.nr("projects","`name`,`body`,`img`,creation_date",`'${inp["name"]}','${inp["proj"]}','${inp["img"]}','${date+"T"+time}'`,true);
                res.send({out:"good"});
            } else if (pdata != null){
                if(inp["proj"] != JSON.stringify({height:"2",width:"4"})){
                    db.gv("projects","id",pdata["id"],(projin)=>{projin = projin[0]
                        db.sv("projects","body",inp["proj"],"id",projin["id"],()=>{},true);
                        db.sv("projects","last_change_date",`${date+"T"+time}`,"id",projin["id"],()=>{},true);
                        if(inp["img"] != "") db.sv("projects","img",inp["img"],"id",projin["id"],()=>{});
                        func.log(`good boy ${cook["uuid"]} saved project ${projin["name"]}`);
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
        func.log("backend project saving err0r - "+error);
    }
}