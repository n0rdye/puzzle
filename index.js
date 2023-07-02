const express = require('express');
const db = require('./db');
const func = require('./func');
const user = require('./user');
const obj = require('./object');
const proj = require('./project');
const vars = require('./vars');
const cookieParser = require('cookie-parser');

// const {
//     response,
//     request
// } = require('express');
// const { escapeSelector } = require('jquery');
// const { name } = require('ejs');
// const { stringify } = require('uuid');
// const createApplication = require('express/lib/express');
// const { render } = require('express/lib/response');
const app = express();

// const {
//     pathToFileURL
// } = require("url");
// const { strict } = require('assert');
// const { log } = require('console');
// const { mainModule } = require('process');
// const { name } = require('ejs');

const maxRequestBodySize = '50mb';
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false,
    limit: maxRequestBodySize
}));
app.use(express.static('public'));
app.use(cookieParser());


app.post('/back_login', (req, res) => {
    let inp = req.body;
    let cook = req.cookies;
    user.login(inp,cook,res);
});

app.post('/reg_user', (req, res) => {
    let inp = req.body;
    let cook = req.cookies;
    user.reg(inp,cook,res)
})

app.post("/sid_log",(req,res) =>{
    let inp = req.body;
    let cook = req.cookies;
    user.sid_log(inp,cook,res,req);
})

app.post("/get_sid" , (req,res) =>{
    let inp = req.body;
    let sid = func.get_uuid();
    res.cookie("sid",sid,{maxAge:(vars.week),path:"/;SameSite=Strict"});
    res.send({out:"good"});
});


app.post("/clear_sid" , (req,res) =>{
    let inp = req.body;
    let cook = req.cookies;
    user.clear_sid(inp,cook,res);
});

app.post("/get_cr_uuid", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        user.get_cr(inp,cook,res);
    })
})

app.post("/save_proj", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    // func.log(inp["img"]);
    func.sid(cook,res,()=>{
        proj.save(inp,cook,res);
    })
})

app.post("/load_proj", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        proj.load(inp,cook,res);
    })
})

app.post("/get_projs", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        proj.loads(inp,cook,res);
    })
})

app.post("/new_obj", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        obj.new(inp,cook,res);
    })
})

app.post("/get_objs", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    // func.log(inp["name"]);
    func.sid(cook,res,()=>{
        obj.loads(inp,cook,res);
    })
})

app.post("/get_obj", (req,res) => {
    let inp = req.body;
    let cook = req.cookies;
    // func.log(inp["name"]);
    func.sid(cook,res,()=>{
        obj.load(inp,cook,res);
    })
})


// pages
app.get("/reg" , (req,res) =>{
    res.render('reg');
})

app.get("/proj/:name" , (req,res) =>{
    res.render('project',{proj_name:req.params["name"]});
})

app.get("/login" , (req,res) =>{
    res.render('login');
})

app.get("/main", (req,res) =>{
    res.render('main');
});

app.get("/admin", (req,res) =>{
    res.render('admin');
});

// app.get("/test", (req,res) =>{
//     let inp = req.body;
//     let cook = req.cookies;
//     func.sid(cook,res,()=>{
//         console.log("asd");
//     })

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

app.listen(process.env.PORT || 8080, () => func.log("server for puzzle started UwU"));