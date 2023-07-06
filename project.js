const db = require('./db');
const func = require('./func');
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
                    func.log(`good boy ${udata["uuid"]} created project ${inp["name"]} from ${cook["sid"]}`);
                    db.nr("projects","`uid`,`name`,`body`,`img`",`'${udata["id"]}','${inp["name"]}','${inp["proj"]}','${inp["img"]}'`);
                    res.send({out:"good"});
                } else if (projin != null){
                    db.sv("projects","body",inp["proj"],"id",projin["id"],()=>{});
                    if(inp["img"] != "") db.sv("projects","img",inp["img"],"id",projin["id"],()=>{});
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