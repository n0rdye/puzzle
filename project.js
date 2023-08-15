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
                    func.log(`good boy ${udata["uuid"]} loaded project ${projt["name"]} from ${cook["sid"]}`);
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

module.exports.del = (inp,cook,res)=>{
    try {
        db.gv("projects","name",`'${inp["name"]}'`,(pdata)=>{pdata=pdata[0]
            // res.send({out:"good",body:pdata});
            db.dl("projects","id",pdata["id"],()=>{
                res.send({out:"good"});
                func.log(`good boy ${cook["uuid"]} deleted project ${inp["name"]} from ${cook["sid"]}`);
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
            db.gv("projects","uid",udata["id"],(pdata)=>{
                let projin = null;
                // func.log(pdata);
                pdata.forEach(projt => {
                    if(projt["name"] == inp["name"] && projt["uid"] == udata["id"]){
                        projin = projt;
                        return;
                    }
                })
                if(projin == null){
                    // func.log("proj not in");
                    // func.log(pname,udata["id"],proj);
                    var date = moment().format('YYYY-MM-DD');
                    var time = moment().format('hh:mm:ss');
                    func.log(`good boy ${udata["uuid"]} created project ${inp["name"]} from ${cook["sid"]}`);
                    db.nr("projects","`uid`,`name`,`body`,`img`,creation_date",`'${udata["id"]}','${inp["name"]}','${inp["proj"]}','${inp["img"]}','${date+"T"+time}'`);
                    res.send({out:"good"});
                } else if (projin != null){
                    db.sv("projects","body",inp["proj"],"id",projin["id"],()=>{});
                    if(inp["img"] != "") db.sv("projects","img",inp["img"],"id",projin["id"],()=>{},"user");
                    func.log(`good boy ${udata["uuid"]} saved project ${projin["name"]} from ${cook["sid"]}`);
                    // func.log("proj in");
                    res.send({out:"good"});
                }
            })
        })
    } catch (error) {
        func.log("backend project saving err0r - "+error);
    }
}