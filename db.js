const mysql = require('mysql');

const logcon = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'user',
    database: 'test'
});

logcon.connect();

// check_for
module.exports.cvs = (table,key,value,callback) => {
    logcon.query('SELECT * FROM `'+table+'`', (err, rows, fields) => {
        let log = '';
        if (err) {
            console.log("sql err");
            throw err;
        } 
        rows.forEach(rec => {
            if (rec[key]==value){
                log = rec[key];
                return;
            }
        });
        if (log != ''){
            callback(log);
        }
        else{
            callback(null);
        }
    })
}

module.exports.cv = (table,key,ekey,evalue,callback) => {
    logcon.query('SELECT `'+key+'` FROM `'+table+'` WHERE `'+ekey+'` = "'+evalue+'"', (err, response) => {
        console.log('SELECT `'+key+'` FROM `'+table+'` WHERE `'+ekey+'` = '+evalue);
        if (err) {
            console.log("sql err");
            throw err;
        } 
        console.log(response); 
        if(response[0] != null){
            callback(true)
        }
        else{
            callback(false)
        }
    })
}

module.exports.dl = (table,key,value,callback) => {
    // console.log('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value);
    logcon.query('DELETE FROM `'+table+'` WHERE `'+key+'` = '+value, (err, rows, fields) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            callback(rows);
        }
    })
}

// get_from
module.exports.gv = (table,key,value,callback) => {
    // console.log('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value);
    logcon.query('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value, (err, rows, fields) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            callback(rows);
        }
    })
}

// set_in
module.exports.sv = (table,key,value,ekey,evalue,callback) => {
    logcon.query("UPDATE `"+table+"` SET `"+key+"` = '"+value+"' WHERE `"+ekey+"` = '"+evalue+"'", (err , res) => {
        // console.log("UPDATE `"+table+"` SET `"+key+"` = '"+value+"' WHERE `"+ekey+"` = '"+evalue+"'");
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            callback(res);
        }
    })
}

module.exports.nr = (table,keys,values) =>{
    // console.log('INSERT INTO `'+table+'`('+keys+') VALUES ('+values+')');
    logcon.query('INSERT INTO `'+table+'`('+keys+') VALUES ('+values+')',(err,res) =>{
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            return true;
        }
    })
}