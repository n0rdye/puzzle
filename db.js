const mysql = require('mysql');
const vars = require('./vars');
const db_host = "localhost";

const admin = mysql.createConnection({
    host: db_host,
    user: 'admin',
    password: 'secretpassword',
    database: 'puzzle'
});

const user = mysql.createConnection({
    host: db_host,
    user: 'user',
    password: 'user',
    database: 'puzzle'
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

module.exports.dl_con = (table,condision,callback,prevs = false) => {
    // console.log('SELECT * FROM `'+table+'` WHERE `'+key+'` = '+value);
    db(prevs).query(`DELETE FROM ${table} WHERE ${condision}`, (err, rows, fields) => {
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
    // console.log(`SELECT * FROM ${table} WHERE ${key} = ${value}`);
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
    // console.log(`SELECT * FROM ${table} WHERE 1 ${limit}`);
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
        // console.log(`SELECT ${ekey} FROM ${table} WHERE ${key} = ${value}`);
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

// set value where
module.exports.sv = (table,key,value,ekey,evalue,callback,prevs = false,no_srt = false) => {
    value = (no_srt)? value:`'${value}'`;
    // console.log(`UPDATE ${table} SET ${key} = ${value} WHERE ${ekey} = '${evalue}'`);
    db(prevs).query(`UPDATE ${table} SET ${key} = ${value} WHERE ${ekey} = '${evalue}'`, (err , rows) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

module.exports.fv = (table,key,value,callback,prevs = false) => {
    // console.log(`UPDATE ${table} SET ${key} = ${value} WHERE ${ekey} = '${evalue}'`);
    db(prevs).query(`SELECT * FROM ${table} WHERE ${key} LIKE '%${value}%'`, (err , rows) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

module.exports.fva = (table,key,value,limit = "0",callback,prevs = false) => {
    // console.log(`UPDATE ${table} SET ${key} = ${value} WHERE ${ekey} = '${evalue}'`);
    limit = (limit != "0")? `LIMIT ${limit}`:""; 
    db(prevs).query(`SELECT * FROM ${table} WHERE ${key} LIKE '%${value}%' ${limit}`, (err , rows) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

module.exports.uv = (table,keys,values,ekey,evalue,callback,prevs = false,no_srt = false) => {
    values = values.split(".");
    keys = keys.split(".");
    let sets = '';
    for (let i = 0; i < keys.length; i++) {
        if(i != keys.length-1){
            sets+=`${keys[i]} = ${values[i]},`;
        }
        else{
            sets+=`${keys[i]} = ${values[i]}`;
        }
        
    }
    // console.log(`UPDATE ${table} SET ${sets} WHERE ${ekey} = '${evalue}'`);
    db(prevs).query(`UPDATE ${table} SET ${sets} WHERE ${ekey} = '${evalue}'`, (err , rows) => {
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback(rows);
        }
    })
}

// new record
module.exports.nr = (table,keys,values,prevs = false,callback) =>{
    // console.log('INSERT INTO `'+table+'`('+keys+') VALUES ('+values+')');
    db(prevs).query(`INSERT INTO ${table} (${keys}) VALUES (${values})`,(err,res) =>{
        if (err) {
            console.log("sql err");
            throw err;
        }else{
            if(callback)callback();
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