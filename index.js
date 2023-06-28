const express = require('express');
const db = require('./db');
const func = require('./func');
const cookieParser = require('cookie-parser');

const {
    response,
    request
} = require('express');
const { escapeSelector } = require('jquery');
const { name } = require('ejs');
const { stringify } = require('uuid');
const app = express();

// const {
//     pathToFileURL
// } = require("url");
// const { strict } = require('assert');
// const { log } = require('console');
// const { mainModule } = require('process');
// const { name } = require('ejs');

app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false
}));
app.use(express.static('public'));
app.use(cookieParser());
var week = 7 * 24 * 3600 * 1000;


app.post('/back_login', (req, res) => {
    let inp = req.body;
    let cook = req.cookies;
    let ilogin = func.decrypt(inp["login"],inp["sid"]);
    let ipass = func.decrypt(inp["pass"],inp["sid"]);

    db.cv("users","login",ilogin,(login) => {
        if(login == null){
            res.status(210).send({out:"bad", err:"user"});
        }
        else if (login != null){
            db.gv("users","login",`'${ilogin}'`,(udata)=>{udata = udata[0];
                if(ipass == udata["pass"]){
                    console.log(udata["uuid"]+" logged in by login & pass from "+cook["sid"]);
                    res.cookie("uuid",udata["uuid"],{maxAge:week,path:"/;SameSite=None"});

                    // db.sv("users","sids",sids += inp["sid"]+";","uuid",udata["uuid"],()=>{}); 
                    db.nr("sids",'`sid`,`uid`',`'${cook["sid"]}','${udata["id"]}'`);
                    res.send({out:"goto",url:"/main"});
                    
                    // db.gv("users","uuid",udata["uuid"],(rdata)=>{
                    //     // console.log(rdata["sids"]);
                    //     let sids = rdata["sids"];
                    //     // console.log(sids.split(";"));
                    //     if(sids != null){
                    //         if(sids.split(";").includes(inp["sid"])){
                    //             console.log("good boy");
                    //         }
                    //         else{
                    //             db.sv("users","sids",sids += inp["sid"]+";","uuid",udata["uuid"],()=>{}); 
                    //             db.nr("sids",'`sid`,`uid`',`'${cook["sid"]}','${udata["id"]}'`);
                    //             // db.sv("sids","uid",sids += inp["sid"]+";","uuid",udata["uuid"],     ()=>{}); 
                    //         }
                    //     }
                    //     else{
                    //         db.sv("users","sids",inp["sid"]+";","uuid",udata["uuid"],()=>{}); 
                    //         db.nr("sids",'`sid`,`uid`',`'${cook["sid"]}','${udata["id"]}'`);
                    //     }
                    // });
                    // // db.sv("users","id",udata["id"],"uuid",udata["uuid"]+"|"+uuid);

                    // if(udata["admin"] == 1){
                    //     res.send({out:"goto",url:"/main"});

                    // }
                    // else{
                    //     res.send({out:"goto",url:"/main"});
                    //     // res.redirect("main");
                    // }

                }
                else{
                    res.status(210).send({out:"bad", err:"pass"});
                }
            });
        }
    })
    // res.send("good");
});

app.post('/reg_user', (req, res) => {
    let inp = req.body;
    let cook = req.cookies;
    let uuid = func.get_uuid(inp["login"]);
    let admin = Boolean(inp["admin"]);
    let pass = inp["pass"];
    let login = inp["login"];
    check_db();
    function check_db() {
        db.cv("users","login",inp["login"], (ldata)=>{
            db.cv("users","login",inp["uuid"],(udata) =>{
                console.log("/reg_user same login recs = "+ldata);
                console.log("/reg_user same uuid recs = "+udata);
                if(udata==null){
                    if(ldata==null){
                        good_reg(udata);
                        console.log("/reg_user good reg");
                        console.log("/reg_user reged "+login+" uuid = "+uuid);
                    }
                    else{
                        console.log("bad user");
                    }
                }
                else if(udata!=null){
                    uuid = func.get_uuid(inp["login"]);
                    check_db();
                }
            })
        })
    }
    function good_reg(udata){
        db.nr("users",'`login`,`pass`,`uuid`,`admin`',`'${login}','${pass}','${uuid}',${admin}`);
        if (admin){
            db.gv("users","uuid",`'${uuid}'`,(res)=>{ res = res[0]
                db.nr("admins",'`login`,`uid`',`'${login}',${res["id"]}`);
            })
        }
        res.redirect("/reg");
    }
})

app.post("/sid_log",(req,res) =>{
    let inp = req.body;
    let cook = req.cookies;

    if(cook["uuid"] != null && cook["sid"] != null){
        func.check_sid(cook,(include,id) => {
            if (include){
                if(req.headers.referer.split("http://n0rsrv2:3002/")[1] == "login") console.log("good boy "+ id["uuid"]+" logged in by sid logs from " + id["sid"]);
                res.send({out:"goto",url:"/main"});
            }
            else if (!include){
                if(req.headers.referer.split("http://n0rsrv2:3002/")[1] == "login") console.log("bad boy "+ id["uuid"]+" tried to login by sid but sid expired from " + id["sid"]);
                res.send({out:"bad"});
            }
        })    
    }
})

app.post("/get_sid" , (req,res) =>{
    let inp = req.body;
    let sid = func.get_uuid(inp["name"]);
    res.cookie("sid",sid,{maxAge:(week),path:"/;SameSite=None"});
    res.send({out:"good"});
});


app.post("/clear_sid" , (req,res) =>{
    let inp = req.body;
    let cook = req.cookies;

    // console.log(cook["uuid"],cook["sid"]);
    if(cook["sid"] != null){
        // res.send({out:"good"});
        console.log(cook["uuid"] + " logged out from "+cook["sid"]);
        db.dl("sids","sid",`'${cook["sid"]}'`,() =>{});
    }
    res.send({out:"good"});
});

app.post("/get_cr_uuid", (req,res) => {
    let inp = req.body;
    if(inp["uuid"] != null && inp["sid"] != null){
        db.gv("users","uuid",`"${inp["uuid"]}"`,(udata)=>{udata = udata[0];
            let re = udata;
            delete re["pass"];
            delete re["uuid"];
            // delete re["sids"];
            func.check_sid(inp,(include,id) => {
                if(include){
                    res.send({out:"good",body:re});
                }
                else if (!include){
                    res.send({out:"bad",body:"expired"});
                }
                else{
                    res.send({out:"bad"});
                }
            })
        });
    }
})

app.post("/save_proj", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    let proj = inp["proj"];
    let pname = inp["name"];
    db.gv("users","uuid",`'${cook["uuid"]}'`, (udata)=>{ udata = udata[0]
        db.gv("projects","uid",udata["id"],(pdata)=>{
            let projin = null;
            // console.log(pdata);
            pdata.forEach(projt => {
                if(projt["name"] == pname && projt["uid"] == udata["id"]){
                    projin = projt;
                    return;
                }
            })
            if(projin == null){
                // console.log("proj not in");
                // console.log(pname,udata["id"],proj);
                console.log(`${udata["uuid"]} created project ${pname} from ${cook["sid"]}`);
                db.nr("projects","`uid`,`name`,`body`",`'${udata["id"]}','${pname}','${proj}'`);
            } else if (projin != null){
                db.sv("projects","body",proj,"id",projin["id"],()=>{});
                console.log(`${udata["uuid"]} saved project ${projin["name"]} from ${cook["sid"]}`);
                // console.log("proj in");
            }
        })

    })
})

app.post("/load_proj", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    if(cook['sid'] != null && cook['uuid'] != null){
        db.gv("users","uuid",`'${cook["uuid"]}'`,(udata)=>{ udata = udata[0];
            db.gv("projects","uid",udata["id"],(pdata)=>{
                let projt = null;
                // console.log(inp["name"]);
                pdata.forEach(proj => {
                    if(proj["name"] == inp["name"]){
                        projt = proj;
                    }
                })
                if (projt != null){
                    console.log(`${udata["uuid"]} loaded project ${projt["name"]} from ${cook["sid"]}`);
                    res.send({out:"good",body:projt["body"]});
                }
            })
        })
    }
    else{
        res.send({out:"bad"});
    }
})

app.post("/get_projs", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    if(cook['sid'] != null && cook['uuid'] != null){
        db.gv("users","uuid",`'${cook["uuid"]}'`,(udata)=>{ udata = udata[0];
            db.gv("projects","uid",udata["id"],(pdata)=>{
                res.send({out:"good",body:pdata});
            })
        })
    }
    else{
        res.send({out:"bad"});
    }
})

// app.post("/set_cr_uuid", (req,res) => {
//     let inp = req.body;
//     if(inp["uuid"] != null && inp["sid"] != null){
//         db.sv("users");
//     }
// })

// app.post("/get_uuid" , (req,res) =>{
//     let inp = req.body;
//     db.gv("users","login",inp["login"],(udata)=>{
//         let uuid = udata["uuid"];
//         res.send({out:'good',body:uuid});
//     });
// });


// web pages
// app.get("/jq.js", (req,res) =>{
//     func.sendfile("./jquery.js",res);
// })

// app.post("/user" , (req,res) =>{
//     // let inp = req.body;
//     // let cook = req.cookies;
//     // let sid = cook["sid"];
//     // let uuid = cook["uuid"];
//     // // console.log(req.cookieParser.JSONCookie("sid"));
//     // // console.log('Cookies: ', req.cookies);
//     // console.log(uuid," - ",sid);
//     res.render("main");
//     // db.gv("users","uuid",uuid,(db) => {

//     // });
// })


app.get("/reg" , (req,res) =>{
    res.render('reg');
})

app.get("/proj/:name" , (req,res) =>{
    // res.cookie  
    res.render('project',{proj_name:req.params["name"]});
})

app.get("/login" , (req,res) =>{
    res.render('login');
})

app.get("/main", (req,res) =>{
    res.render('main');
});

// app.get("/main/:id", (req,res) =>{
//     res.render('main');
// });

app.get('/', (req, res) => {
    if(req.cookies["uuid"] != null){
        res.redirect('main');
    }
    else{
        res.redirect('login');
    }
});

app.all('*', (req, res) => {
    res.status(404).send('<h1>404! Page not</h1> <br> <a href="/">go to main page</a>');
});

app.listen(process.env.PORT || 3002, () => console.log("started"));