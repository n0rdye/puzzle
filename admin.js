const db = require('./db');
const func = require('./func');
const { login } = require('./user');
const vars = require('./vars');

module.exports.get_users = (inp,cook,res)=>{
    try{
        db.crc("users",(row_count)=>{
            // console.log(row_count);
            db.gav("users",`${inp["from"]},${inp["load_interval"]}`,(data)=>{
                if(data["length"] > 0){
                    res.send({body:data,count:row_count,out:"good"});
                }
                else{
                    res.send({out:"bad"});
                }
            },true)
        },true)
    } catch(error){
        func.log("backend user getting in error - "+error);
    }
    // res.send("good");
}

module.exports.edit_user = (inp,cook,res)=>{
    try {
        if(inp["key"] == "login"){
            db.ggv("users","id","login",`'${inp["value"]}'`,(login_in_use)=>{ login_in_use = login_in_use[0];
                if (login_in_use){
                    res.send({out:"bad"});
                    return;
                }
                else{
                    change();
                    db.ggv("admins","id","uid",`'${inp["id"]}'`,(admin)=>{ admin = admin[0]
                        if(admin) db.sv("admins","login",inp["value"],"id",admin["id"],()=>{},true);
                    },true);
                }
            })
        }else if (inp["key"] == "admin"){
            db.ggv("users","admin","id",`'${inp["id"]}'`,(admin)=>{ admin = admin[0]["admin"];
                if(!admin){
                    db.nr("admins",`login,uid`,`'${inp["login"]}','${inp["id"]}'`,true);
                    db.sv("users","admin","1","id",inp["id"],()=>{},true);
                }
                else if(admin){
                    db.dl("admins","uid",inp["id"],()=>{},true);
                    db.sv("users","admin","0","id",inp["id"],()=>{},true);
                }
                func.log(`admin ${cook["uuid"]} changed user ${inp["login"]} admin privileges to ${!admin}`);
                res.send({out:"good"});
                // if (inp["value"] != "0"){ db.nr("admins",`login,uid`,`'${inp["login"]}','${inp["id"]}'`,true);}
                // else {
                //     db.sv("users","admin","0","id",inp["id"],()=>{},true);
                //     db.dl("admins","uid",inp["id"],()=>{},true);
                // }
                // change();
            })
        }else {change();}

        function change(){
            db.sv("users",inp["key"],inp["value"],"id",inp["id"],(db_res)=>{
                func.log(`admin ${cook["uuid"]} changed user ${inp["login"]} ${inp["key"]} to ${inp["value"]}`);
                res.send({out:"good"});
            },true)
        }
    } catch (error) {
        func.log("backend user information changing error - "+error);
    }
}

module.exports.del_user = (inp,cook,res)=>{
    try {
        db.dl("users","id",`'${inp["id"]}'`,()=>{
            func.log(`admin ${cook["uuid"]} deleted user ${inp["login"]}`);
            res.send({out:"good"});
        },true);
    } catch (error) {
        func.log("backend user sid clearing error -"+error);
    }
}

module.exports.set_obj=(inp,cook,res)=>{
    try {

    } catch (error) {
        func.log("backend user sid logging error - "+error);
    }
}

module.exports.reg = (inp,cook,res)=>{
    try {
        let uuid = func.get_uuid(inp["login"]);
        let admin = inp["admin"];
        let pass = inp["pass"];
        let login = inp["login"];
        check_db();
        function check_db() {
            db.ggv("users","id","login",`'${inp["login"]}'`, (ldata)=>{ldata = ldata[0]
                db.ggv("users","id","uuid",`'${inp["uuid"]}'`,(udata) =>{udata = udata[0]
                    // func.log("/reg_user same login recs = "+ldata);
                    // func.log("/reg_user same uuid recs = "+udata);
                    if(udata==null && ldata==null){
                        good_reg();
                        // func.log("/reg_user good reg");
                        func.log(`good boy ${uuid} registered user ${login} with uuid = ${uuid} admin = ${admin}`);
    
                    }
                    else if(udata!=null){
                        uuid = func.get_uuid(inp["login"]);
                        check_db();
                        // res.send({out:"bad", body:"uuid"});
                    }
                    else if (ldata != null){
                        func.log(`bad boy ${uuid} tried to register user ${login} with uuid = ${uuid} admin = ${admin} but login in use`);
                        res.send({out:"bad", body:"login"});
                        return;
                    }
                },true)
            },true)
        }
        function good_reg(){
            db.nr("users",'`login`,`pass`,`uuid`,`admin`',`'${login}','${pass}','${uuid}',${admin}`,true);
            if (admin){
                db.ggv("users","`id`","uuid",`'${uuid}'`,(udata)=>{ udata = udata[0]
                    db.nr("admins",'`login`,`uid`',`'${login}',${udata["id"]}`,true);
                },true)
            }
            res.send({out:"good", body:{uuid:uuid,login:login,admin:admin}});
        }
    } catch (error) {
        func.log("backend user registration error - "+error);
    }
}