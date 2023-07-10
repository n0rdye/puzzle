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

module.exports.save = (inp,cook,res)=>{
    try {
        // let changed = [];
        let changes = JSON.parse(inp["changes"]);
        let taken_name = false;
        Object.entries(changes).forEach(([key,value]) => {
            // console.log(key,value);
            // console.log( Object.keys(changes).pop());
            if(key == "name"){
                db.ggv("objects","id","name",`'${value}'`,(gname)=>{gname = gname[0]
                    if(gname == null){
                        db.sv("objects",key,value,"id",inp["id"],()=>{
                            chack_if_last(key)
                        },true);
                    }
                    else{
                        taken_name = true;
                        // console.log(taken_name);
                        chack_if_last(key)
                    }
                })
            }
            else if (key != "name"){
                // console.log("not name");
                db.sv("objects",key,value,"id",inp["id"],()=>{
                    chack_if_last(key)
                },true);
                // changed.push(key);
            }
        });
        function chack_if_last(key){
            if(key ==  Object.keys(changes).at(-1)){
                res.send({out:"good",name_err:taken_name});
            }
        }
    } catch (error) {
        func.log("backend object creating error - "+error);
    }
}
module.exports.del = (inp,cook,res)=>{
    try {
        let name = inp["name"].split("/")[0];
        let group =  inp["name"].split("/").at(-1);
        db.dl("objects",`id`,`'${inp["id"]}' AND gid = '${inp["gid"]}'`,()=>{
            func.log(`admin group deleted ${name} from ${group}`);
            res.send({out:"good"});
        },true);
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
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