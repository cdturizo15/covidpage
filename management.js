const mysql = require('mysql');
require('dotenv').config();

const connection = require('./database/db')

getTables();

function getdata(){
    connection.query(`SELECT * FROM ${process.env.DATABASE}`, function(error, data, fields){
        if(error){
            console.log("Error trying to get data: ", error);
        }else{
            console.log("DATA");
            console.log(data);
            console.log("FIELDS");
            console.log(fields);
        }
    });
}

function getTables(){
    connection.query(`SHOW TABLES FROM ${process.env.DATABASE}`, function(error, data, fields){
        if(error){
            console.log("Error trying to get data: ", error);
        }else{
            console.log("DATA");
            console.log(data);
            console.log("FIELDS");
            console.log(fields);
        }
    });
}