const db = require('./db');
const func = require('./func');
const vars = require('./vars');

module.exports.loads = (inp,cook,res)=>{
    try {
        db.ggv("objects","`name`,`id`,`height`,`width`,`description`","gid",0,(odata)=>{
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
        db.ggv("objects","id","name",`'${inp["name"]}'`,(db_name)=>{db_name= db_name[0]
            if(db_name != null){
                res.send({out:"bad",err:"name"});
            }
            else if (db_name == null){
                db.nr("objects","`name`,`img`,`height`,`width`,`description`",`'${inp["name"]}','${inp["img"]}','${inp["height"]}','${inp["width"]}','${inp["desc"]}'`,true);
                res.send({out:"good"});
            }
        },true)
    } catch (error) {
        func.log("backend object creating error - "+error);
    }
}