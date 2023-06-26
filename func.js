// import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
const uuid = require('uuid');
// const bcrypt = require('bcryptjs');
const cryptojs = require('crypto-js');
const e = require('express');
const fs = require('fs');
const db = require('./db');

module.exports.sendfile = (fileName, response) => {
    const filePath = "./files/"+fileName; 
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

module.exports.check_sid = (Cookies, callback) =>{
    let uuid = Cookies["uuid"];
    let sid = Cookies["sid"];
    // console.log(uuid,sid);
    db.gv("users","uuid",uuid,(rdata)=>{
        let sids = rdata["sids"];
        if(sids != null){
            if(sids.split(";").includes(sid)){
                // console.log("good boy ");
                callback(true,Cookies);
            }
            else{
                // console.log("bad boy ");
                callback(false,Cookies);
            }
        }
        else{
            // console.log("bad boy ");
            callback(false,Cookies);
        }
    });
}

module.exports.get_by_sid = (Cookies) =>{
    
}


module.exports.get_uuid = (name) =>{
    let unid = uuid.v4() + '%'+name+'%%' + uuid.v4() +'#'+(621);
    return unid;
}

module.exports.encrypt = (password,uuid) => {
    // return bcrypt.hashSync(password,bcrypt.genSaltSync());
    return cryptojs.AES.encrypt(password,uuid).toString();
}

module.exports.decrypt = (password,uuid) =>{
    const en = cryptojs.AES.decrypt(password,uuid);
    const de = en.toString(cryptojs.enc.Utf8);
    // console.log(de + "-dec");
    return de;
}

