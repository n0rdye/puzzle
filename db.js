const mysql = require('mysql');

const logcon = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'user',
    database: 'users'
});

logcon.connect();

// check_for
module.exports.cv = (table,key,value,callback) => {
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

// get_from
module.exports.gv = (table,key,value,callback) => {
    logcon.query('SELECT * FROM `'+table+'` WHERE `'+key+'` = "'+value+'"', (err, rows, fields) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            callback(rows[0]);
        }
    })
}

// set_in
module.exports.sv = (table,key,value,ekey,evalue,callback) => {
    logcon.query('UPDATE `'+table+'` SET `'+key+'` = "'+value+'" WHERE `'+ekey+'` = "'+evalue+'"', (err , res) => {
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