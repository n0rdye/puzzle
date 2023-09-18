// import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
const uuid = require('uuid');
// const bcrypt = require('bcryptjs');
const cryptojs = require('crypto-js');
const e = require('express');
const fs = require('fs');
const db = require('./db');
const moment = require("moment");
const vars = require('./vars');
const replaceColor = require('replace-color');
const { escapeXML } = require('ejs');
const imageDataURI = require('image-data-uri');

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

module.exports.sid = (cook,res,callback,auto = true,admin_check = false)=>{
    try {
        let uuid = cook["uuid"];
        let sid = cook["sid"];
        if(cook["uuid"] != null && cook["sid"] != null){
            db.ggv("sids","`uid`","sid",`'${sid}'`,(sdata)=>{ sdata = sdata[0]
                // console.log(sdata);
                if(sdata != null){
                    db.ggv("users","`uuid`,`id`, `admin`","id",`'${sdata["uid"]}'`,(udata)=>{ udata = udata[0]
                        if (udata != null && udata["id"] == sdata["uid"] && uuid == udata["uuid"]){
                            if (!admin_check) callback(true);
                            else if (admin_check && udata["admin"] != false){
                                db.gv("admins","uid",`'${udata["id"]}'`,(adata)=>{ adata = adata[0]
                                    if(adata != null){
                                        callback(adata["rights"],true);                                    
                                    }
                                    else{
                                        db.sv("users","admin","0","id",udata["id"],()=>{},true);
                                        db.dl("admins","uid",udata["id"],()=>{},true);
                                        if(auto) res.redirect('/');
                                        else if(!auto) callback(false);                                    
                                    }
                                },true)
                            }
                            else{
                                db.sv("users","admin","0","id",udata["id"],()=>{},true);
                                db.dl("admins","uid",udata["id"],()=>{},true);
                                if(auto) res.redirect('/');
                                else if(!auto) callback(false);                           
                            }
                        }
                        else{
                            // if(auto) res.send({out:"bad",err:"wrong"}); 
                            if(auto) res.redirect("/");
                            else if(!auto) callback(false);
                        }
                    });
                }
                else{
                    // if(auto) res.send({out:"bad",err:"expired"});
                    if(auto) res.redirect("/");
                    else if(!auto) callback(false);
                }
            });
        }else{
            // if(auto) res.send({out:"bad",err:"nocr"});
            if(auto) res.redirect("/");
            else if(!auto) callback(false);
        }
    } catch (error) {
        this.log("backend sid checking err0r - "+error);
    }
}

module.exports.log = (message) =>{
    message = message.replaceAll("'","*")
    var date = moment().format('YYYY-MM-DD');
    var time = moment().format('hh:mm:ss');
    let clog = `${date}_${time}|${message}`;
    console.log(clog);
    // if(vars.log_to_file) fs.appendFile('./logs.txt', `${clog} \n`, function (err) {if (err) throw err;}); 
    if(vars.log_to_db) db.nr("logs","`date`,`time`,`log`",`'${date}','${time}','${message}'`,true);
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
        db.gav("logs","0",(db_logs)=>{
            db_logs.forEach(log => {
                let date = moment(log[`date_time`]).utc().format('YYYY-MM-DD');
                fs.appendFile(path, `${date}_${log["time"]}|${log["log"]} \n`, function (err) {
                    if (err) throw err;
                    if(log["id"] == db_logs.at(-1)["id"]){
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
        },true);   
    }
}


module.exports.get_uuid = (name = "/") =>{
    // if (name != "/") name = this.encrypt(name,"name");
    let unid = uuid.v4() + '%%'+name+'#e'+(621);
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


module.exports.img_recolor = (res,image,color) => {
    // console.log(color);
    image = `public/${image}`
    let name = image.split("/").at(-2);
    if (fs.existsSync(`public/img/object/${name}/colored/${color}.png`)) {
            res.send(`/img/object/${name}/colored/${color}.png`)
        }
    else{
        replaceColor({
            image: image,
            colors: {
              type: 'hex',
              targetColor: "#c8c8c8",
              replaceColor: `#${color}`
            },
            deltaE: 10
          })
            .then((jimpObject) => {
                if (!fs.existsSync(`public/img/object/${name}`)){fs.mkdirSync(`public/img/object/${name}`)}
                jimpObject.write(`public/img/object/${name}/colored/${color}.png`, (err) => {
                    if (err) return console.log(err)
                    else{
                        imageDataURI.encodeFromFile(`public/img/object/${name}/colored/${color}.png`)
                        .then(data => {
                            res.send(data)
                        })
                    }
                })
            })
            .catch((err) => {
              console.log(err)
            })
    }
}
