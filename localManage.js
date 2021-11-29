const mysql = require('mysql');
require('dotenv').config();

const connection = require('./database/db')

//insertData();
joinData();

function insertInitData(){
    connection.query(`INSERT INTO states (Case_id, State, Date) value ('70-489-0045', 1, '2021-10-20')`);
    connection.query(`INSERT INTO states (Case_id, State, Date) value ('57-403-5912', 2, '2021-11-19')`);
    connection.query(`INSERT INTO states (Case_id, State, Date) value ('32-063-5029', 1, '2021-10-19')`);
    connection.query(`INSERT INTO states (Case_id, State, Date) value ('43-114-2975', 2, '2021-11-17')`);
    connection.query(`INSERT INTO states (Case_id, State, Date) value ('70-503-8987', 1, '2021-10-16')`, function(error){
        if(error){
            console.log('Error trying to insert data: ', error);
        }else{
            console.log('Dat inserted successfully.');
        }
    });
}

function insertData(){
    connection.query(`INSERT INTO states (Case_id, State, Date) value ('70-503-8987', 2, '2021-11-16')`, function(error){
        if(error){
            console.log('Error trying to insert data: ', error);
        }else{
            console.log('Data inserted successfully.');
        }
    });
}

function joinData(){
    connection.query(`SELECT * FROM MOCK_DATA JOIN states ON MOCK_DATA.Case_id = states.Case_id
    WHERE Patient_id = '39-137-1758'`, function(error, data){
        if(error){
            console.log("Error trying to get all data with join: ", error);
        }else{
            console.log(data);
        }
    });
}

/*
1: negative;
2: treatment;
3: UCI;
4: Cured;
5: Dead;
*/