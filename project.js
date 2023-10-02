const db = require('./db');
const func = require('./func');
const moment = require("moment");
const vars = require('./vars');

module.exports.load = (inp,cook,res)=>{
    try {
        db.gv("users","uuid",`'${cook["uuid"]}'`,(udata)=>{ udata = udata[0];
            db.gv("projects","uid",udata["id"],(pdata)=>{
                let projt = null;
                // func.log(inp["name"]);
                pdata.forEach(proj => {
                    if(proj["name"] == inp["name"]){
                        projt = proj;
                    }
                })
                if (projt != null){
                    func.log(`good boy ${udata["uuid"]} loaded project ${projt["name"]}`);
                    res.send({out:"good",body:projt["body"]});
                }
                else{
                    res.send({out:"bad proj"});
                }
            })
        })
    } catch (error) {
        func.log("backend project loading error - ");
    }
}

module.exports.loads = (inp,cook,res)=>{
    try {
        db.ggv("users","`id`","uuid",`'${cook["uuid"]}'`,(udata)=>{ udata = udata[0];
            db.gv("projects","uid",udata["id"],(pdata)=>{
                res.send({out:"good",body:pdata});
            })
        })
    } catch (error) {
        func.log("backend projects loading err0r - " - error);
    }
}

module.exports.download = (inp,cook,res)=>{
    try {
        db.ggv("projects","`body`","id",`'${inp["id"]}'`,(proj)=>{ proj = proj[0];
            res.send(JSON.stringify(proj));
        })
    } catch (error) {
        func.log("backend projects loading err0r - " - error);
    }
}

module.exports.rename = (inp,cook,res)=>{
    try {
        db.gv("projects","`name`",`'${inp["name"]}'`,(proj_name)=>{ proj_name = proj_name[0];
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
        db.gv("projects","name",`'${inp["name"]}'`,(pdata)=>{pdata=pdata[0]
            // res.send({out:"good",body:pdata});
            db.dl("projects","id",pdata["id"],()=>{
                res.send({out:"good"});
                func.log(`good boy ${cook["uuid"]} deleted project ${inp["name"]}`);
            })
        })
        // db.ggv("users","`name`,`id`","uuid",`'${cook["uuid"]}'`,(udata)=>{ udata = udata[0];
        //     console.log(udata);
        // })
    } catch (error) {
        func.log("backend projects delete err0r - " - error);
    }
}

module.exports.save = (inp,cook,res)=>{
    try {
        db.gv("users","uuid",`'${cook["uuid"]}'`, (udata)=>{ udata = udata[0]
            db.ggv("projects","`id`,`uid`","name",`'${inp["name"]}'`,(pdata)=>{pdata = pdata[0]
                var date = moment().format('YYYY-MM-DD');
                var time = moment().format('hh:mm:ss');
                if(pdata == null){
                    // func.log("proj not in");
                    // func.log(pname,udata["id"],proj);
                    func.log(`good boy ${udata["uuid"]} created project ${inp["name"]}`);
                    db.nr("projects","`uid`,`name`,`body`,`img`,creation_date",`'${udata["id"]}','${inp["name"]}','${inp["proj"]}','${inp["img"]}','${date+"T"+time}'`);
                    res.send({out:"good"});
                } else if (pdata != null && pdata["uid"] == udata["id"]){
                    if(inp["proj"] != JSON.stringify({height:"2",width:"4"})){
                        db.gv("projects","id",pdata["id"],(projin)=>{projin = projin[0]
                            db.sv("projects","body",inp["proj"],"id",projin["id"],()=>{});
                            db.sv("projects","last_change_date",`${date+"T"+time}`,"id",projin["id"],()=>{});
                            if(inp["img"] != "") db.sv("projects","img",inp["img"],"id",projin["id"],()=>{});
                            func.log(`good boy ${udata["uuid"]} saved project ${projin["name"]}`);
                            // func.log("proj in");
                            res.send({out:"good"});
                        })
                    }
                    else{
                        res.send({out:"bad",err:"proj"});
                    }
                }
            })
        })
    } catch (error) {
        func.log("backend project saving err0r - "+error);
    }
}

