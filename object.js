const { name } = require('ejs');
const db = require('./db');
const func = require('./func');
const vars = require('./vars');

module.exports.loads = (inp,cook,res)=>{
    try {
        db.ggv("objects","`name`,`id`,`height`,`width`,`description`,`gid`","gid",`${inp["gid"]}`,(odata)=>{
            // func.log(odata);
            res.send({out:"good",body:odata});
        })
    } catch (error) {
        func.log("backend objects loading error - "+error);
    }
}

module.exports.load = (inp,cook,res)=>{
    try {
        let keys = inp["key"];
        db.ggv("objects",keys,"name",`'${inp["name"]}'`,(odata)=>{
            // func.log(odata);
            res.send({out:"good",body:odata[0]});
        })
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}

module.exports.new = (inp,cook,res)=>{
    try {
        db.ggv("object_groups","name","id",`'${inp["gid"]}'`,(gname)=>{gname = gname[0]
            db.ggv("objects","name","gid",`'${inp["gid"]}' AND name = '${inp["name"]}/g/${gname["name"]}'`,(db_name)=>{
            if(db_name[0] != null){
                res.send({out:"bad",err:"name"});
            }
            else if (db_name[0] == null){
                db.nr("objects","`name`,`img`,`height`,`width`,`description`,`gid`",`'${inp["name"]}/g/${gname["name"]}','${inp["img"]}','${inp["height"]}','${inp["width"]}','${inp["desc"]}','${inp["gid"]}'`,true);
                    db.sv("object_groups","count",`(count + 1)`,"id",inp["gid"],()=>{},true,true)
                    func.log(`admin object created name:${inp["name"]} group:${gname["name"]}`);
                    res.send({out:"good"});
                }
                // console.log(db_name);
                // db.ggv("objects","gid","name",`'${inp["name"]}'`,(db_name)=>{
                    // })
            },true)
        })
    } catch (error) {
        func.log("backend object creating error - "+error);
    }
}

module.exports.load_groups = (inp,cook,res)=>{
    try {
        db.gav("object_groups","0",(gdata)=>{
            // func.log(odata);
            res.send({out:"good",body:gdata});
        })
    } catch (error) {
        func.log("backend object groups loading err0r - "+error);
    }
}
module.exports.new_group = (inp,cook,res)=>{
    try {
        db.ggv("object_groups","id","name",`'${inp["name"]}'`,(gdata)=>{gdata = gdata[0]
            // func.log(odata);
            if(gdata != null){
                res.send({out:"bad"});
            }
            else if (gdata == null){
                db.nr("object_groups","`name`,`count`",`'${inp["name"]}','0'`,true,()=>{
                    res.send({out:"good"});
                })
            }
        })
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}
module.exports.del_group = (inp,cook,res)=>{
    try {
        db.ggv("object_groups",`name`,`id`,`'${inp["gid"]}'`,(gname)=>{gname = gname[0]["name"]
            db.dl("object_groups",`id`,`'${inp["gid"]}'`,()=>{
                func.log(`admin group deleted ${gname}`);
                res.send({out:"good"});
            },true);
        })
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}