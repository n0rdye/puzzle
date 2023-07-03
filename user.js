const db = require('./db');
const func = require('./func');
const vars = require('./vars');

module.exports.login = (inp,cook,res)=>{
    let ilogin = func.decrypt(inp["login"],inp["sid"]);
    let ipass = func.decrypt(inp["pass"],inp["sid"]);

    db.cv("users","login",ilogin,(login) => {
        if(login == null){
            res.status(210).send({out:"bad", err:"user"});
        }
        else if (login != null){
            db.gv("users","login",`'${ilogin}'`,(udata)=>{udata = udata[0];
                db.ggv("sids","`sid`","uid",udata["id"],(sdata)=>{sdata = sdata[0];
                    // console.log(sdata);
                    if(ipass == udata["pass"]){
                        if (sdata != null){
                            // res.send({out:"logged",sid:sdata["sid"]});
                            // console.log(sdata);
                            db.dl("sids","uid",`'${udata["id"]}'`,() =>{});

                        }
                        func.log("good boy "+udata["uuid"]+" logged in by login & pass from "+cook["sid"]);
                        res.cookie("uuid",udata["uuid"],{maxAge:vars.week,path:"/;SameSite=Strict"});
    
                        // db.sv("users","sids",sids += inp["sid"]+";","uuid",udata["uuid"],()=>{}); 
                        db.nr("sids",'`sid`,`uid`',`'${cook["sid"]}','${udata["id"]}'`);
                        res.send({out:"goto",url:"/main"});
                    }
                    else{
                        res.status(210).send({out:"bad", err:"pass"});
                    }

                })
            });
        }
    })
    // res.send("good");
}

module.exports.reg = (inp,cook,res)=>{
    let uuid = func.get_uuid(inp["login"]);
    let admin = inp["admin"];
    let pass = inp["pass"];
    let login = inp["login"];
    check_db();
    function check_db() {
        db.cv("users","login",inp["login"], (ldata)=>{
            db.cv("users","login",inp["uuid"],(udata) =>{
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
            })
        })
    }
    function good_reg(){
        db.nr("users",'`login`,`pass`,`uuid`,`admin`',`'${login}','${pass}','${uuid}',${admin}`);
        if (admin){
            db.ggv("users","`id`","uuid",`'${uuid}'`,(udata)=>{ udata = udata[0]
                db.nr("admins",'`login`,`uid`',`'${login}',${udata["id"]}`);
            })
        }
        res.send({out:"good", body:{uuid:uuid,login:login,admin:admin}});
    }
}

module.exports.get_cr = (inp,cook,res)=>{
    db.ggv("users","`login`,`admin`,`id`","uuid",`"${inp["uuid"]}"`,(udata)=>{udata = udata[0];
        // delete re["sids"];
        if(udata != null){
            res.send({out:"good",body:udata});
        }else{
            res.send({out:"bad"});
        }
    });
}

module.exports.clear_sid = (inp,cook,res)=>{
    if(inp["sid"] != null){
        // res.send({out:"good"});
        db.dl("sids","sid",`'${inp["sid"]}'`,() =>{
            func.log("good boy "+inp["uuid"] + " logged out from "+inp["sid"]);
        });
        // db.ggv("sids","id","sid",`'${cook["sid"]}'`,(sids)=>{
        //     Object.entries(sids).forEach(([key,value])=>{
        //         db.dl("sids","id",`'${value["id"]}'`,() =>{});
        //     })
        // })
    }
    else if(inp["uuid"] != null){
        // res.send({out:"good"});
        db.ggv("users","id","uuid",`'${inp["uuid"]}'`,(udata)=>{udata = udata[0]
            db.dl("sids","uid",`'${udata["id"]}'`,() =>{
                func.log("good boy "+inp["uuid"] + " logged out from "+inp["sid"]);
            });
        //     db.ggv("sids","id","uid",`'${udata["id"]}'`,(sids)=>{
        //         Object.entries(sids).forEach(([key,value])=>{
        //             db.dl("sids","id",`'${value["id"]}'`,() =>{});
        //         })
        //     })
        });
    }
    res.send({out:"good"});
}

module.exports.sid_log=(inp,cook,res,req)=>{
    func.sid(cook,res,(include) => {
        if (include){
            res.send({out:"good",url:"/main"});
            if(req.headers.referer.split("http://n0rsrv2:3002/")[1] == "login") func.log("good boy "+ id["uuid"]+" logged in by sid logs from " + id["sid"]);
        }
        else if (!include){
            res.send({out:"bad"});
            if(req.headers.referer.split("http://n0rsrv2:3002/")[1] == "login") func.log("bad boy "+ id["uuid"]+" tried to login by sid but sid expired from " + id["sid"]);
        }
    },false)   
}