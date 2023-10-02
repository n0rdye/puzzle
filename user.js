const db = require('./db');
const func = require('./func');
const vars = require('./vars');

module.exports.login = (inp,cook,res)=>{
    try{
        let ilogin = func.decrypt(inp["login"],inp["sid"]);
        let ipass = func.decrypt(inp["pass"],inp["sid"]);
    
        db.ggv("users","id","login",`'${ilogin}'`,(login) => {login = login[0];
            if(login == null){
                res.status(210).send({out:"bad", err:"user"});
            }
            else if (login != null){
                db.gv("users","login",`'${ilogin}'`,(udata)=>{udata = udata[0];
                    db.ggv("sids","`sid`","uid",udata["id"],(sdata)=>{sdata = sdata[0];
                        // console.log(sdata);
                        if(ipass == func.decrypt(udata["pass"],"umni_pass")){
                            if (sdata != null){
                                // res.send({out:"logged",sid:sdata["sid"]});
                                // console.log(sdata);
                                db.dl("sids","uid",`'${udata["id"]}'`,() =>{});
                            }
                            func.log("good boy "+udata["uuid"]+" logged in by login & pass");
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
    } catch(error){
        func.log("backend user logging in error - "+error);
    }
    // res.send("good");
}

module.exports.get_cr = (inp,cook,res)=>{
    try {
        db.ggv("users","`login`,`admin`,`id`","uuid",`"${inp["uuid"]}"`,(udata)=>{udata = udata[0];
            // delete re["sids"];
            if(udata != null){
                res.send({out:"good",body:udata});
            }else{
                res.send({out:"bad"});
            }
        });
    } catch (error) {
        func.log("backend user information pulling error - "+error);
    }
}

module.exports.clear_sid = (inp,cook,res)=>{
    try {
        if(inp["sid"] != null){
            // res.send({out:"good"});
            db.dl("sids","sid",`'${inp["sid"]}'`,() =>{
                // func.log("good boy "+inp["uuid"] + " logged out from "+inp["sid"]);
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
                    func.log("good boy "+inp["uuid"] + " logged out");
                });
            //     db.ggv("sids","id","uid",`'${udata["id"]}'`,(sids)=>{
            //         Object.entries(sids).forEach(([key,value])=>{
            //             db.dl("sids","id",`'${value["id"]}'`,() =>{});
            //         })
            //     })
            });
        }
        res.send({out:"good"});
    } catch (error) {
        func.log("backend user sid clearing error -"+error);
    }
}

module.exports.sid_log=(inp,cook,res,req)=>{
    try {
        func.sid(cook,res,(include) => {
            if (include){
                res.send({out:"good",url:"/main"});
                if(req.headers.referer.split("/").at(-1) == "login") func.log("good boy "+ cook["uuid"]+" logged in by sid");
            }
            else if (!include){
                res.send({out:"bad"});
                func.log("bad boy "+ cook["uuid"]+" tried to login by sid but sid expired");
            }
        },false)   
    } catch (error) {
        func.log("backend user sid logging error - "+error);
    }
}