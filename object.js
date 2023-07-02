const db = require('./db');
const func = require('./func');
const vars = require('./vars');

module.exports.loads = (inp,cook,res)=>{
    db.ggv("objects","`name`,`id`,`height`,`width`,`description`","gid",0,(odata)=>{
        // func.log(odata);
        res.send({out:"good",body:odata});
    })
}

module.exports.load = (inp,cook,res)=>{
    let keys = inp["key"];
    db.ggv("objects",keys,"name",`'${inp["name"]}'`,(odata)=>{
        // func.log(odata);
        res.send({out:"good",body:odata[0]});
    })
}

module.exports.new = (inp,cook,res)=>{
    db.cv("objects","name",inp["name"],(include)=>{
        if(include){
            res.send({out:"bad",err:"name"});
        }
        else if (!include){
            db.nr("objects","`name`,`img`,`height`,`width`,`description`",`'${inp["name"]}','${inp["img"]}','${inp["height"]}','${inp["width"]}','${inp["desc"]}'`);
            res.send({out:"good"});
        }
    })
}