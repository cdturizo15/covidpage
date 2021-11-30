const connection = require("./database/db");

const controller = {};


//Funcion para la raíz,  /Gestionar, carga todos los posibles casos
controller.list = (rep,res) => {
    connection.query('SELECT first_name, Last_name, Patient_id, Case_id FROM MOCK_DATA ORDER BY Case_id',(error, result)=>{
        if(result){
            res.render('Gestion',{
                Datos: {},
                Buscar_Datos: result}); 
                able = 1; 
            }
            if(error){
            console.log(error);
        }
    });
};


//Funcion para hacer la busqueda de los datos y seleccionar
controller.search = (req,res) => {
    if (req.body.nombre == '' && req.body.id_Paciente=='' && req.body.cedula == ''){
        connection.query('SELECT P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula FROM MOCK_DATA as P',[req.body.nombre,req.body.id_Paciente,req.body.cedula],(error, result)=>{
            if(result){   
                res.render('Gestion',{
                    Datos: {},
                    Buscar_Datos: result});
                    able = 1;
                }
            if(error){
                console.log(error);
            }
        
        });
    }
    else{
        connection.query('SELECT P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula FROM MOCK_DATA as P WHERE ( P.Nombre=? or P.IDCaso=? or P.Cedula=?)',[req.body.nombre,req.body.id_Paciente,req.body.cedula],(error, result)=>{
            if(result){   
                console.log(result)
                res.render('Gestion',{
                    Datos: {},
                    Buscar_Datos: result});
                    able = 1;
                }
            if(error){
                console.log(error);
            }
        
        });
    }
}


//Funcion para la seleccion, escoger uno en particular
controller.select = (req,res) => {
    const IDCaso = req.params.id;

    connection.query('SELECT first_name, Last_name, Patient_id, Case_id FROM MOCK_DATA WHERE Case_id = ? ORDER BY Case_id',[Case_id],(error, result)=>{
        if(result){
            Buscar_Datos = result;
            able = 1;
        }  
        if(error){
            console.log(error);
        }
    });
    
    
    connection.query('SELECT FechaMod as Fecha, P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula, E.Estado as EstadoNum, ES.Estados as Estado FROM MOCK_DATA as P, EstadoPacientes as E, Estados as ES WHERE P.Case_id=? and E.Cedula=P.Patient_id and E.Estado=ES.idEstados ORDER BY E.FechaMod',[IDCaso], (error,result) => {
        if(result){
            for (var i =0; i< result.length; i++) {
                if(result[i].EstadoNum == 5){able=0; console.log('desabled'); break;}else{able=1}
            }
            res.render('Gestion',{
                Datos: result
            });
        }
        if(error){
            console.log(error)
        }
        
    })

}

//Funcion para actualizar el estado de los estados :v 
controller.update = (req,res) => {
    const {estado} = req.body;
    console.log(estado)
    const IDCaso = req.params.id;
    connection.query('INSERT INTO `EstadoPacientes` (`Cedula`,`Estado`) VALUES ((SELECT Cedula FROM MOCK_DATA WHERE IDCaso=?),?)',[IDCaso,estado],(error, result) => {
        if(result){
            res.redirect('/selected/'+IDCaso)
        }
        if(error){
            console.log(error);
        }
    })
}

module.exports = controller;