const db = require('./db');
const func = require('./func');
const vars = require('./vars');
const fs = require('fs');
const imageDataURI = require('image-data-uri');


module.exports.loads = (inp,cook,res)=>{
    try {
        let gin
        if (typeof inp["gid"] == 'undefined' || inp["gid"] == null) gin = "1 OR 1=1"
        else gin = inp["gid"]
        db.ggv("objects","`name`,`id`,`height`,`width`,`cost`,`gid`,`colors`,`pid`,`img`","gid",`${gin}`,(odata)=>{
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
        if (typeof inp["colors"] != 'undefined'){inp["colors"] = (inp["colors"] == "false")? 0:1;}
        db.gv("object_groups","id",`'${inp["gid"]}'`,(gname)=>{gname = gname[0]
            db.gv("object_partition","id",`'${gname["pid"]}'`,(pname)=>{pname = pname[0]
                save_img(inp["img"],`${inp["name"]}~g~${gname["name"]}~p~${pname["name"]}`,(img_path)=>{
                    db.ggv("objects","name","gid",`'${inp["gid"]}' AND name = '${inp["name"]}~g~${gname["name"]}'`,(db_name)=>{
                        if(db_name[0] != null){
                            res.send({out:"bad",err:"name"});
                        }
                        else if (db_name[0] == null){
                            db.nr("objects","`cost`,`name`,`img`,`height`,`width`,`gid`,`colors`,`pid`",`'${inp["cost"]}','${inp["name"]}~g~${gname["name"]}~p~${pname["name"]}','${img_path}','${inp["height"]}','${inp["width"]}','${inp["gid"]}','${inp["colors"]}','${gname["pid"]}'`,true);
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
        })
        function save_img(data,name,callback) {
            if(data.split("/img/").at(-1) != "placeholder.png"){
                let img = imageDataURI.decode(data);
                if (!fs.existsSync(`public/img/object/${name}`)){fs.mkdirSync(`public/img/object/${name}`);}
                fs.writeFile(`public/img/object/${name}/main.${img.imageType.split("/").at(-1)}`, img.dataBuffer,()=>{
                    if(callback)callback(`/img/object/${name}/main.${img.imageType.split("/").at(-1)}`);
                });
            }
        }
    } catch (error) {
        func.log("backend object creating error - "+error);
    }
}

module.exports.new_color = (inp,cook,res)=>{
    try {
        db.fv("color_palette","color",inp["color"],(in_db)=>{in_db = in_db[0];
            if(typeof in_db == 'undefined'){
                db.nr("color_palette","color",`'${inp["color"]}'`,true,(db)=>{
                    res.send({out:"good"});
                    func.log(`admin added new color:${inp["color"]}`)
                })
            }else{
                res.send({out:"bad"});
            }
        })
    } catch (error) {
        func.log("backend object creating error - "+error);
    }
}
module.exports.del_color = (inp,cook,res)=>{
    try {
        db.dl("color_palette","id",inp["id"],(in_db)=>{
            res.send({out:"good"});
            func.log(`admin deleted color:${inp["color"]}`)
        },true);
    } catch (error) {
        func.log("backend object creating error - "+error);
    }
}
module.exports.load_colors = (inp,cook,res)=>{
    try {
        db.gav("color_palette","0",(in_db)=>{
            res.send({out:"good",body:in_db})
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
        if (typeof changes["colors"] != 'undefined'){changes["colors"] = (changes["colors"] == "false")? 0:1;}
        // console.log(changes);
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
            else if (key == "img"){
                db.gv("objects","id",`'${inp["id"]}'`,(db_data)=>{db_data = db_data[0]
                    // console.log(db_data);
                    fs.rm(`public/img/object/${db_data["name"]}`, { recursive: true }, () => {
                        // fs.unlink(db_data["img"],()=>{});
                        save_img(value,db_data["name"],(path)=>{
                            // console.log(db_data["name"]);
                            db.sv("objects",key,path,"id",inp["id"],()=>{
                                chack_if_last(key)
                            },true);
                        })
    
                        function save_img(data,name,callback) {
                            if(data.split("/img/").at(-1) != "placeholder.png"){
                                let img = imageDataURI.decode(data);
                                if (!fs.existsSync(`public/img/object/${name}`)){fs.mkdirSync(`public/img/object/${name}`);}
                                fs.writeFile(`public/img/object/${name}/main.${img.imageType.split("/").at(-1)}`, img.dataBuffer,()=>{
                                    if(callback)callback(`/img/object/${name}/main.${img.imageType.split("/").at(-1)}`);
                                });
                            }
                        }

                    })
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
                fs.rm(`public/img/object/${obj_db["name"]}`, { recursive: true }, () => {})
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
        db.ggv("object_partition",`name`,`id`,`'${inp["pid"]}'`,(gname)=>{gname = gname[0]["name"];
            db.dl("object_partition",`id`,`'${inp["pid"]}'`,()=>{
                func.log(`admin part deleted ${gname}`);
                res.send({out:"good"});
            },true);
        })
    } catch (error) {
        func.log("backend single object loading err0r - "+error);
    }
}