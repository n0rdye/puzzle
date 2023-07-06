// import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
const uuid = require('uuid');
// const bcrypt = require('bcryptjs');
const cryptojs = require('crypto-js');
const e = require('express');
const fs = require('fs');
const db = require('./db');
const moment = require("moment");
const vars = require('./vars');

module.exports.sendfile = (fileName, response) => {
    const filePath = "./"+fileName; 
    fs.exists(filePath, function (exists) {
        if (exists) {
            response.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment; filename=" + fileName
            });
            fs.createReadStream(filePath).pipe(response);
            return;
        }
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("ERROR File does not exist");
    });
}

// module.exports.check_sid = (Cookies, callback) =>{
//     let uuid = Cookies["uuid"];
//     let sid = Cookies["sid"];
//     // console.log(uuid,sid);
//     db.gv("users","uuid",`'${uuid}'`,(udata)=>{ udata = udata[0];
//         // console.log(udata);
//         db.gv("sids","uid",udata["id"],(rdata)=>{
//             let valid = "";
//             rdata.forEach(rec => {
//                 if (rec["sid"] == sid){
//                     valid = rec["sid"];
//                     return;
//                 }
//             });
//             if(valid != ""){
//                 callback(true,udata);
//             }
//             else{
//                 callback(false,udata);
//             }
//         });
//     })
// }

module.exports.sid = (cook,res,callback,auto = true)=>{
    try {
        let uuid = cook["uuid"];
        let sid = cook["sid"];
        if(cook["uuid"] != null && cook["sid"] != null){
            db.ggv("sids","`uid`","sid",`'${sid}'`,(sdata)=>{ sdata = sdata[0]
                // console.log(sdata);
                if(sdata != null){
                    db.ggv("users","`uuid`,`id`","id",`'${sdata["uid"]}'`,(udata)=>{ udata = udata[0]
                        if (udata != null && udata["id"] == sdata["uid"] && uuid == udata["uuid"]){
                            callback(true);
                        }
                        else{
                            if(auto) res.send({out:"bad",err:"wrong"});
                            if(!auto) callback(false);
                        }
                    });
                }
                else{
                    if(auto) res.send({out:"bad",err:"expired"});
                    if(!auto) callback(false);
                }
            });
        }else{
            if(auto) res.send({out:"bad",err:"nocr"});
            if(!auto) callback(false);
        }
    } catch (error) {
        this.log("backend sid checking err0r - "+error);
    }
}

module.exports.log = (message) =>{
    var date = moment().format('YYYY-MM-DD');
    var time = moment().format('hh:mm:ss');
    let clog = `${date}_${time}|${message}`;
    console.log(clog);
    // if(vars.log_to_file) fs.appendFile('./logs.txt', `${clog} \n`, function (err) {if (err) throw err;}); 
    if(vars.log_to_db) db.nr("logs","`date`,`time`,`log`",`'${date}','${time}','${message}'`);
}

module.exports.logs_file = (res)=>{
    let path = './logs.txt';
    fs.exists(path, function(exists) {
        if(exists) {
            fs.unlink(path,function(err){
                if(err) throw err;
                write_logs(res);
            });
        } else {
            write_logs(res);
        }
      });

    function write_logs(res){
        db.gav("logs",(db_logs)=>{
            db.glv(`logs`,`id`,(last)=>{last = last[0];
                db_logs.forEach(log => {
                    let date = moment(log[`date_time`]).utc().format('YYYY-MM-DD');
                    fs.appendFile(path, `${date}_${log["time"]}|${log["log"]} \n`, function (err) {
                        if (err) throw err;
                        if(log["id"] == last["id"]-1){
                            res.download(path, (err) => {
                                if (err) { throw err; }
                                console.log("logs downloaded");
                                fs.unlink(path, (err) => {
                                  if (err) { throw err; }
                                });
                            });                        
                        }
                    }); 
                });
            })
        });   
    }
}


module.exports.get_uuid = () =>{
    let unid = uuid.v4() + '%%' + uuid.v4() +'#'+(621);
    return unid;
}

module.exports.encrypt = (text,cipher) => {
    // return bcrypt.hashSync(password,bcrypt.genSaltSync());
    return cryptojs.AES.encrypt(text,cipher).toString();
}

module.exports.decrypt = (text,cipher) =>{
    const en = cryptojs.AES.decrypt(text,cipher);
    const de = en.toString(cryptojs.enc.Utf8);
    // console.log(de + "-dec");
    return de;
}

