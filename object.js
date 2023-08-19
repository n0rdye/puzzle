const db = require('./db');
const func = require('./func');
const vars = require('./vars');

module.exports.loads = (inp,cook,res)=>{
    try {
        let gin
        if (typeof inp["gid"] == 'undefined' || inp["gid"] == null) gin = "1 OR 1=1"
        else gin = inp["gid"]
        db.ggv("objects","`name`,`id`,`height`,`width`,`description`,`cost`,`gid`,`colors`","gid",`${gin}`,(odata)=>{
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
        
        db.gv("object_groups","id",`'${inp["gid"]}'`,(gname)=>{gname = gname[0]
            db.gv("object_partition","id",`'${gname["pid"]}'`,(pname)=>{pname = pname[0]
                db.ggv("objects","name","gid",`'${inp["gid"]}' AND name = '${inp["name"]}/g/${gname["name"]}'`,(db_name)=>{
                    if(db_name[0] != null){
                        res.send({out:"bad",err:"name"});
                    }
                    else if (db_name[0] == null){
                        db.nr("objects","`cost`,`name`,`img`,`height`,`width`,`description`,`gid`",`'${inp["cost"]}','${inp["name"]}/g/${gname["name"]}/p/${pname["name"]}','${inp["img"]}','${inp["height"]}','${inp["width"]}','${inp["desc"]}','${inp["gid"]}'`,true);
                            db.sv("object_groups","count",`(count + 1)`,"id",inp["gid"],()=>{},true,true)
                            func.log(`admin object created name:${inp["name"]} group:${gname["name"]}`);
                            res.send({out:"good"});
                    }
                    // console.log(db_name);
                    // db.ggv("objects","gid","name",`'${inp["name"]}'`,(db_name)=>{
                        // })
                },true)
            })
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
        db.gv("objects","id",`'${inp["id"]}'`,(obj_db)=>{obj_db = obj_db[0];
            let gid = obj_db["gid"]; 
            let name = obj_db["name"]; 
            db.dl("objects",`id`,`'${inp["id"]}'`,()=>{
                db.sv("object_groups","count",`(count - 1)`,"id",`${gid}`,()=>{},true,true)
                func.log(`admin object deleted name:${name} group:${gid}`);
                res.send({out:"good"});
            },true);
        })
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
module.exports.load_group = (inp,cook,res)=>{
    try {
        db.gv("object_groups","id",`${inp["gid"]}`,(gdata)=>{
            // func.log(odata);
            res.send({out:"good",body:gdata[0]});
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
                db.nr("object_groups","`name`,`count`,`pid`",`'${inp["name"]}','0',${inp["pid"]}`,true,()=>{
                    db.glv("object_groups","id",(new_group)=>{ new_group = new_group[0];
                        db.gv("object_partition","id",`${inp["pid"]}`,(part_db)=>{part_db = part_db[0];
                            // console.log(part_db);
                            if (part_db["count"] == 0){
                                db.sv("object_partition","`groups`",`${new_group["id"]}`,"id",`${inp["pid"]}`,()=>{},true)
                            }
                            else{
                                db.sv("object_partition","`groups`",`${part_db["groups"]},${new_group["id"]}`,"id",`${inp["pid"]}`,()=>{},true)
                            }
                            res.send({out:"good"});
                            db.sv("object_partition","count",`(count + 1)`,"id",`${inp["pid"]}`,()=>{},true,true)
                            func.log(`admin group created ${new_group["name"]}`);
                        })
                    })
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
            db.ggv("object_partition","`groups`","`id`",`${inp["pid"]}`,(groups)=>{
                groups = groups[0]["groups"].split(",");
                let new_groups=[];
                if(groups.includes(`${inp["gid"]}`)){
                    if (groups.length < 2){
                        groups.splice(groups.indexOf(`${inp["gid"]}`),1);
                        new_groups = groups;
                    }
                    else{
                        groups.splice(groups.indexOf(`${inp["gid"]}`),1);
                        new_groups = groups.join(",");
                    }
                }
                else{
                    new_groups = groups.join(",")
                }
                // console.log(groups.length,"len");
                // console.log(groups,"group");
                // console.log(new_groups,"new");
                db.sv("object_partition","`groups`",`${new_groups}`,"`id`",`${inp["pid"]}`,()=>{
                    db.dl("object_groups",`id`,`'${inp["gid"]}'`,()=>{
                        func.log(`admin group deleted ${gname}`);
                        db.sv("object_partition","count",`(count - 1)`,"id",`${inp["pid"]}`,()=>{},true,true)
                        res.send({out:"good"});
                    },true);
                },true)
            })
        })
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}

module.exports.find = (inp,cook,res)=>{
    try {
        db.fv("objects",`SUBSTRING_INDEX(name,'/',1)`,inp["name"],(db_res)=>{
            res.send({out:"good",body:db_res});
        },true);
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}

module.exports.load_parts = (inp,cook,res)=>{
    try {
        db.gav("object_partition","0",(gdata)=>{
            // console.log(gdata);
            // func.log(odata);
            res.send({out:"good",body:gdata});
        })
    } catch (error) {
        func.log("backend object part loading err0r - "+error);
    }
}

module.exports.new_part = (inp,cook,res)=>{
    try {
        db.ggv("object_partition","id","name",`'${inp["name"]}'`,(gdata)=>{gdata = gdata[0]
            // func.log(odata);
            if(gdata != null){
                res.send({out:"bad"});
            }
            else if (gdata == null){
                db.nr("object_partition","`name`,`count`,`groups`",`'${inp["name"]}','0',''`,true,()=>{
                    res.send({out:"good"});
                })
            }
        })
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}
module.exports.del_part = (inp,cook,res)=>{
    try {
        db.ggv("object_partition",`name`,`id`,`'${inp["gid"]}'`,(gname)=>{gname = gname[0]["name"]
            db.dl("object_partition",`id`,`'${inp["gid"]}'`,()=>{
                func.log(`admin part deleted ${gname}`);
                res.send({out:"good"});
            },true);
        })
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}