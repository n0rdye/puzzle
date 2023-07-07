const mysql = require('mysql');
const vars = require('./vars');
const db_host = "localhost";

const admin = mysql.createConnection({
    host: db_host,
    user: 'admin',
    password: '484',
    database: 'users'
});

const user = mysql.createConnection({
    host: db_host,
    user: 'user',
    password: 'user',
    database: 'users'
});

db = (prevs = false) => {
    if(prevs) return admin;
    else return user;
}

admin.connect();
user.connect();


module.exports.dl = (table,key,value,callback,prevs = false) => {
    // console.log('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value);
    db(prevs).query(`DELETE FROM ${table} WHERE ${key} = ${value}`, (err, rows, fields) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

// get values where 
module.exports.gv = (table,key,value,callback,prevs = false) => {
    // console.log('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value);
    db(prevs).query(`SELECT * FROM ${table} WHERE ${key} = ${value}`, (err, rows, fields) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

// get all from table 
module.exports.gav = (table,limit = "0",callback,prevs = false) => {
    // console.log('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value);
    limit = (limit != "0")? `LIMIT ${limit}`:""; 
    db(prevs).query(`SELECT * FROM ${table} WHERE 1 ${limit}`, (err, rows, fields) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

// get value where 
module.exports.ggv = (table,ekey,key,value,callback,prevs = false) => {
    // console.log('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value);
    db(prevs).query(`SELECT ${ekey} FROM ${table} WHERE ${key} = ${value}`, (err, rows, fields) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

// set value where
module.exports.sv = (table,key,value,ekey,evalue,callback,prevs = false) => {
    db(prevs).query(`UPDATE ${table} SET ${key} = '${value}' WHERE ${ekey} = '${evalue}'`, (err , rows) => {
        // console.log("UPDATE `"+table+"` SET `"+key+"` = '"+value+"' WHERE `"+ekey+"` = '"+evalue+"'");
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}
// new record
module.exports.nr = (table,keys,values,prevs = false) =>{
    // console.log('INSERT INTO `'+table+'`('+keys+') VALUES ('+values+')');
    db(prevs).query(`INSERT INTO ${table} (${keys}) VALUES (${values})`,(err,res) =>{
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            return true;
        }
    })
}
// get last value
module.exports.glv = (table,last_value,callback,prevs = false) =>{
    // console.log('INSERT INTO `'+table+'`('+keys+') VALUES ('+values+')');
    db(prevs).query(`SELECT * FROM ${table} ORDER BY ${last_value} DESC LIMIT 1;`,(err,rows) =>{
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

module.exports.crc = (table,callback,prevs = false) =>{
    // console.log('INSERT INTO `'+table+'`('+keys+') VALUES ('+values+')');
    db(prevs).query(`SELECT COUNT(*) FROM ${table}`,(err,rows) =>{
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows[0]["COUNT(*)"]);
        }
    })
}