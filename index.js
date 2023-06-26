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
            db.gv("users","login",ilogin,(udata)=>{
                if(ipass == udata["pass"]){
                    console.log(udata["uuid"]+" logged in by login & pass from "+cook["sid"]);
                    res.cookie("uuid",udata["uuid"],{maxAge:1000000});

                    db.gv("users","uuid",udata["uuid"],(rdata)=>{
                        // console.log(rdata["sids"]);
                        let sids = rdata["sids"];
                        // console.log(sids.split(";"));
                        if(sids != null){
                            if(sids.split(";").includes(inp["sid"])){
                                console.log("good boy");
                            }
                            else{
                                db.sv("users","sids",sids += inp["sid"]+";","uuid",udata["uuid"],()=>{}); 
                            }
                        }
                        else{
                            db.sv("users","sids",inp["sid"]+";","uuid",udata["uuid"],()=>{}); 
                        }
                    });
                    // db.sv("users","id",udata["id"],"uuid",udata["uuid"]+"|"+uuid);

                    if(udata["admin"] == 1){
                        res.send({out:"goto",url:"/main"});

                    }
                    else{
                        res.send({out:"goto",url:"/main"});
                        // res.redirect("main");
                    }

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
                        good_reg();
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
    function good_reg(){
        db.nr("users",'`login`,`pass`,`uuid`,`admin`',`'${login}','${pass}','${uuid}',${admin}`);
        res.redirect("/reg");
    }
})

app.post("/sid_log",(req,res) =>{
    // console.log(req.cookies["sid"]);
    // console.log(req.cookies["uuid"]);
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
    // if(req.cookies["uuid"]!= null){
    //     let sid = req.cookies["sid"];
    //     let uuid = func.decrypt(req.cookies["uuid"],"key");
    //     db.gv("users","uuid",uuid,(rdata)=>{
    //         let sids = rdata["sids"];
    //         if(sids != null){
    //             // console.log(sids.split(";"));
    //             if(sids.split(";").includes(sid)){
    //                 console.log("good boy "+rdata["login"]+" logged in by sid");
    //                 res.send({out:"goto",url:"/user",args:{pass:rdata["pass"],uuid:uuid,login:rdata["login"]}});
    //             }
    //             else{
    //                 res.redirect("/login");
    //             }
    //         }
    //     });
    // }

})

app.post("/get_sid" , (req,res) =>{
    let inp = req.body;
    let sid = func.get_uuid(inp["name"]);
    var week = 7 * 24 * 3600 * 1000;
    res.cookie("sid",sid,{maxAge:(week)});
    res.send({out:"good"});

});

app.post("/get_cr_uuid", (req,res) => {
    
})

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

app.get("/login" , (req,res) =>{
    res.render('login');
})

app.get("/main", (req,res) =>{
    res.render('main');
});

app.get('/', (req, res) => {
    res.redirect('login');
});

app.all('*', (req, res) => {
    res.status(404).send('<h1>404! Page not</h1>');
});

app.listen(process.env.PORT || 3002, () => console.log("started"));