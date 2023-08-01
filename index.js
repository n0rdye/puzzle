const express = require('express');
const db = require('./db');
const func = require('./func');
const user = require('./user');
const admin = require('./admin');
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

const maxRequestBodySize = '20mb';
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false,
    limit: maxRequestBodySize
}));
app.use(express.static('public'));
app.use(cookieParser());



/// user
app.get('/', (req, res) => {
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,(include)=>{
        if(include){
            res.redirect('main');
        }
        else{
            res.redirect('login');
        }
    },false)
});
app.get("/login" , (req,res) =>{
    res.render('login');
})
app.get("/main", (req,res) =>{
    res.render('main');
});
app.post('/back_login', (req, res) => {
    try {
        let inp = req.body;
        let cook = req.cookies;
        user.login(inp,cook,res);
    } catch (error) {
        func.log("router login error - "+error);
    }
});
app.post("/sid_log",(req,res) =>{
    try{
        let inp = req.body;
        let cook = req.cookies;
        user.sid_log(inp,cook,res,req);
    } catch (error) {
        func.log("router sid logging in error - "+error);
    }
})
app.post("/get_sid" , (req,res) =>{
    try{
        let inp = req.body;
        let sid = func.get_uuid();
        res.cookie("sid",sid,{maxAge:(vars.week),path:"/;SameSite=Strict"});
        res.send({out:"good"});
    } catch (error) {
        func.log("router sid getting error - "+error);
    }
});
app.post("/clear_sid" , (req,res) =>{
    try{
        let inp = req.body;
        let cook = req.cookies;
        user.clear_sid(inp,cook,res);
    } catch (error) {
        func.log("router sid clearing error - "+error);
    }
});
app.post("/get_cr_uuid", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            user.get_cr(inp,cook,res);
        })
    } catch (error) {
        func.log("router getting user information by uuid error - "+error);
    }
})
/// project
app.get("/proj/:name" , (req,res) =>{
    res.render('project',{proj_name:req.params["name"]});
})
app.post("/save_proj", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.save(inp,cook,res);
        })
    } catch (error) {
        func.log("router project saving error - "+error);
    }
})
app.post("/load_proj", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.load(inp,cook,res);
        })
    } catch (error) {
        func.log("router project loading error - "+error);
    }
})
app.post("/proj/delete", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.del(inp,cook,res);
        })
    } catch (error) {
        func.log("router project loading error - "+error);
    }
})
app.post("/get_projs", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.loads(inp,cook,res);
        })
    } catch (error) {
        func.log("router user projects getting error - "+error);
    }
})
app.post("/get_objs", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.loads(inp,cook,res);
        })
    } catch (error) {
        func.log("router objects getting error - "+error);
    }
})
app.post("/get_obj", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.load(inp,cook,res);
        })
    } catch (error) {
        func.log("router single object getting error - "+error);
    }
})
app.post("/get_groups", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.load_groups(inp,cook,res);
        })
    } catch (error) {
        func.log("router single object getting error - "+error);
    }
})
/// admin
app.get("/admin", (req,res) =>{
    try {
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            res.render('admin');
        },true,true)
    } catch (error) {
        func.log("router admin page error - "+error);
    }
});
app.get("/home", (req,res) =>{
    res.render('home');
});
// app.get("/admin/edit/:edit" , (req,res) =>{
//     try {
//         let inp = req.body;
//         let cook = req.cookies;
//         func.sid(cook,res,()=>{
//             switch (req.params["edit"]) {
//                 case "users":
//                     res.render('admin/user_edit');break;
//                 case "projects":
//                     res.render('admin/project_edit');break;        
//                 case "objects":
//                     res.render('admin/object_edit');break;
//             }
//         },true,true)
//     } catch (error) {
//         func.log("router admin edit page error - "+error);
//     }
// })
app.get("/get_logs", (req,res) => {
    try{let cook = req.cookies;func.sid(cook,res,()=>{func.logs_file(res);})} 
    catch (error) {func.log("router logs download error - "+error);}
})
app.post("/admin/objects/new", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.new(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/objects/edit", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.save(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/objects/delete", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.del(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/objects/find", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.find(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/groups/new", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.new_group(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/groups/delete", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.del_group(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/users/get", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.get_users(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post('/admin/users/new', (req, res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.new_user(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router registration error - "+error);
    }
})
app.post("/admin/users/edit", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.edit_user(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/users/delete", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.del_user(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})
app.post("/admin/users/find", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.find_user(inp,cook,res);
        },true,true)
    } catch (error) {
        func.log("router object creating error - "+error);
    }
})



app.all('*', (req, res) => {
    res.status(404).send('<h1>404! Page not</h1> <br> <a href="/">go to main page</a>');
});
app.listen(process.env.PORT || 8080, () => func.log("server for puzzle started UwU"));