const express = require('express');
const db = require('./db');
const func = require('./func');
const user = require('./user');
const admin = require('./admin');
const obj = require('./object');
const proj = require('./project');
const vars = require('./vars');
const templates = require('./templates.js');
const cookieParser = require('cookie-parser');
const CssFilterConverter = require('css-filter-converter');

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
let cache_options = {
    maxAge: "4d",
    etag: false
}
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false,
    limit: maxRequestBodySize
}));
app.use(express.static('public',cache_options));
app.use(cookieParser());



/// user
app.get("/login" , (req,res) =>{
    res.render('login');
})

app.post('/back_login', (req, res) => {try {
        let inp = req.body;
        let cook = req.cookies;
        user.login(inp,cook,res);
    } catch (error) {route_err({req:req,error:error});}
});
app.post("/sid_log",(req,res) =>{try{
        let inp = req.body;
        let cook = req.cookies;
        user.sid_log(inp,cook,res,req);
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/get_sid" , (req,res) =>{try{
        let inp = req.body;
        let sid = func.get_uuid();
        res.cookie("sid",sid,{maxAge:(vars.week),path:"/;SameSite=Strict"});
        res.send({out:"good"});
    } catch (error) {route_err({req:req,error:error});}
});
app.post("/clear_sid" , (req,res) =>{try{
        let inp = req.body;
        let cook = req.cookies;
        user.clear_sid(inp,cook,res);
    } catch (error) {route_err({req:req,error:error});}
});
app.post("/get_cr_uuid", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            user.get_cr(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})

/// project
app.get("/proj/load/:name" , (req,res) =>{
    res.render('project',{proj_name:req.params["name"]});
})
app.post("/save_proj", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.save(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/load_proj", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.load(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/proj/delete", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.del(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/proj/download", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.download(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/proj/rename", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        proj.rename(inp,cook,res);
    })
} catch (error) {route_err({req:req,error:error});}
})
app.post("/get_projs", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            proj.loads(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/get_objs", (req,res) => {
    try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.loads(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/get_obj", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.load(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/get_groups", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.load_groups(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/object/parts/get", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.load_parts(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/object/group/get", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        // func.log(inp["name"]);
        func.sid(cook,res,()=>{
            obj.load_group(inp,cook,res);
        })
    } catch (error) {route_err({req:req,error:error});}
})

// colors
app.post("/object/colors/get", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    // func.log(inp["name"]);
    func.sid(cook,res,()=>{
        obj.load_colors(inp,cook,res);
    })
} catch (error) {route_err({req:req,error:error});}
})

/// admin
app.get("/admin", (req,res) =>{try {
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,(rights)=>{
            res.render('admin');
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
});
app.get("/admin/:type", (req,res) =>{try {
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,(rights)=>{
        if ((req.params["type"] == "objects") && (rights == 1 || rights == 3)){
            res.render('admin/objects');
        }
        else if ((req.params["type"] == "users") && (rights == 2 || rights == 3)){
            res.render('admin/users');
        }
        else{res.redirect('/admin');}
    },true,true)
} catch (error) {route_err({req:req,error:error});}
});
app.get("/get_logs", (req,res) => {
    try{let cook = req.cookies;func.sid(cook,res,()=>{func.logs_file(res);})} 
    catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/colors/new", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    // func.log(inp["name"]);
    func.sid(cook,res,()=>{
        obj.new_color(inp,cook,res);
    })
} catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/colors/delete", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    // func.log(inp["name"]);
    func.sid(cook,res,()=>{
        obj.del_color(inp,cook,res);
    })
} catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/objects/new", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.new(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/objects/edit", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.save(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/objects/delete", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.del(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/objects/find", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.find(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/groups/new", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.new_group(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/parts/new", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        obj.new_part(inp,cook,res);
    },true,true)
} catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/parts/delete", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        obj.del_part(inp,cook,res);
    },true,true)
} catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/groups/delete", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            obj.del_group(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/users/get", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.get_users(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post('/admin/users/new', (req, res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.new_user(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/users/edit", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.edit_user(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/users/delete", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.del_user(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/users/find", (req,res) => {try{
        let inp = req.body;
        let cook = req.cookies;
        func.sid(cook,res,()=>{
            admin.find_user(inp,cook,res);
        },true,true)
    } catch (error) {route_err({req:req,error:error});}
})


// templates
app.post('/admin/template/save', (req, res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        templates.save(inp,cook,res);
    },true,true)
} catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/template/rename", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        templates.rename(inp,cook,res);
    },true,true)
} catch (error) {route_err({req:req,error:error});}
})
app.post("/admin/template/delete", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        templates.del(inp,cook,res);
    },true,true)
} catch (error) {route_err({req:req,error:error});}
})
app.post("/template/load", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        templates.load(inp,cook,res);
    })
} catch (error) {route_err({req:req,error:error});}
})
app.post("/template/loads", (req,res) => {try{
    let inp = req.body;
    let cook = req.cookies;
    func.sid(cook,res,()=>{
        templates.loads(inp,cook,res);
    })
} catch (error) {route_err({req:req,error:error});}
})

// main routes
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
app.get("/main", (req,res) =>{try{
        let inp = req.body;let cook = req.cookies;
        func.sid(cook,res,()=>{
            res.render('main');
        })
    } catch (error) {route_err({req:req,error:error});}
});
app.get("/logs", (req,res) =>{try{
    let inp = req.body;let cook = req.cookies;
    func.sid(cook,res,()=>{
        func.get_logs(res);
    })
} catch (error) {route_err({req:req,error:error});}
});
app.get("/help", (req,res) =>{try{
    let inp = req.body;let cook = req.cookies;
    func.sid(cook,res,()=>{
        res.render('help');
    })
} catch (error) {route_err({req:req,error:error});}
});
app.get("/temp", (req,res) =>{try{
    let inp = req.body;let cook = req.cookies;
    func.sid(cook,res,()=>{
        res.render('templates');
    })
} catch (error) {route_err({req:req,error:error});}
});
app.get("/htc/:hex",(req,res) =>{
    res.send(CssFilterConverter.hexToFilter(`#${req.params["hex"]}`));
})
app.post("/color",(req,res) =>{
    let inp = req.body;
    func.img_recolor(res,inp["img"],inp["hex"]);
})
app.all('*', (req, res) => {
    res.status(404)
    res.render("static/404");
});
app.listen(process.env.PORT || 8080, () => func.log("server for puzzle started UwU"));


function route_err(params = {req:null,error:null}) {
    func.log(`router ${req.route.path} error - `+error)
}