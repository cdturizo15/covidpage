const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const session = require('express-session')
const moment = require('moment');
const app = express();
const port = 3000;


//Configuration
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname+'/public/views'));
app.use(session({
    secret: '12345',
    resave: true,
    saveUninitialized: true
}))
app.set('view engine','ejs');
dotenv.config({path:'./env/.env'});



app.get('/',(req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login:true,
            name:req.session.name.charAt(0).toUpperCase() + req.session.name.slice(1),
            rol: req.session.rolName
        })
    }
    else{
        res.render('index',{
            login:false,
            name:'Debe iniciar sesion'
        })
    }
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/register',(req,res)=>{
    if(req.session.loggedin && req.session.rol==0){
        res.render('register');
    }
    else{
        res.redirect('/')
    }
    
})

app.get('/registerCase',(req,res)=>{
    if(req.session.loggedin && req.session.rol==3){
        res.render('registerCase');
    }
    else{
        res.redirect('/')
    }
    
})

app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.get('/view',(req,res)=>{
    if(req.session.loggedin && req.session.rol==2){
        res.render('view',Datos={});
        
    }
    else{
        res.redirect('/')
    }
    
})

app.get('/getById', function(req, resp){
    const cc = req.query.patient_id;
    const id_caso = req.query.case_id;

    if(cc && id_caso){
        connection.query(`SELECT * FROM MOCK_DATA
        WHERE Patient_id = '${cc}' AND Case_id = '${id_caso}'`, function(error, data){
            if(error){
                console.log("Error trying to get by cc and id_caso: ", error);
                resp.send({'status': 0, 'message': 'Error trying to get by cc and id_caso...'});
            }else{
                resp.send({'status': 1, 'data': data});
            }
        });
        connection.query('SELECT E.FechaMod as Fecha, P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula, E.Estado as EstadoNum, ES.Estados as Estado FROM MOCK_DATA as P, EstadoPacientes as E, Estados as ES WHERE P.Case_id=? and E.Cedula=P.Patient_id and E.Estado=ES.idEstados ORDER BY E.FechaMod',[id_caso], (error,result) => {
            if(result){
                resp.send({'status': 1,  'data': data,'result': result});
            }
            if(error){
                console.log(error)
            }
    
        })
    }else{
        
        if(cc){
            connection.query(`SELECT * FROM MOCK_DATA
            WHERE Patient_id = '${cc}'`, function(error, data){
                if(error){
                    console.log("Error trying to get by cc: ", error);
                    resp.send({'status': 0, 'message': 'Error trying to get by cc...'});
                }else{
                    connection.query('SELECT E.FechaMod as Fecha, P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula, E.Estado as EstadoNum, ES.Estados as Estado FROM MOCK_DATA as P, EstadoPacientes as E, Estados as ES WHERE P.Case_id=(SELECT Case_id FROM MOCK_DATA WHERE Patient_id=?) and E.Cedula=P.Patient_id and E.Estado=ES.idEstados ORDER BY E.FechaMod',[cc], (error,result) => {
                        if(result){
                            console.log(result)
                            resp.send({'status': 1, 'data': data, 'result': result});
                        }
                        if(error){
                            console.log(error)
                        }
                
                    })
                }
            }); 
            
        }

        if(id_caso){
            connection.query(`SELECT * FROM MOCK_DATA
            WHERE MOCK_DATA.Case_id = '${id_caso}'`, function(error, data){
                if(error){
                    console.log("Error trying to get by id_caso: ", error);
                    resp.send({'status': 0, 'message': 'Error trying to get id_caso...'});
                }else{
                    connection.query('SELECT E.FechaMod as Fecha, P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula, E.Estado as EstadoNum, ES.Estados as Estado FROM MOCK_DATA as P, EstadoPacientes as E, Estados as ES WHERE P.Case_id=? and E.Cedula=P.Patient_id and E.Estado=ES.idEstados ORDER BY E.FechaMod',[id_caso], (error,result) => {
                        if(result){
                            resp.send({'status': 1, 'data': data, 'result': result});
                        }
                        if(error){
                            console.log(error)
                        }
                
                    })
                }
            });
        }
    }
});

app.get('/getGeneral', function(req, resp){
    var lastCases = []
    connection.query(`SELECT Case_id FROM MOCK_DATA`, function(error, idcases){
        if(error){
            console.log(error);
            resp.send({'status': 0, 'message': "Error trying to get general data..."});
        }
        else{      
            for (let j = 0; j < idcases.length; j++) {
                var element = idcases[j].Case_id;
                connection.query(`SELECT * FROM EstadoPacientes as E, MOCK_DATA as M WHERE E.Cedula=M.Patient_id 
                    and Case_id=? ORDER BY FechaMod DESC LIMIT 1`,[element], function(error, data){
                    if(error){
                        console.log(error);
                        resp.send({'status': 0, 'message': "Error trying to get general data..."});
                    }
                    else{
                        //Todo esto es para obtener el ??ltimo estado de cada paciente.
                        var finalArray = new Array();
                        for(var row of data){
                            var found = false;
                            for(var i=0; i<finalArray.length; i++){
                                var item = finalArray[i];
                                if(item.Patient_id == row.Cedula){
                                    if(moment(row.FechaMod).diff(item.FechaMod) > 0){
                                        finalArray[i] = row;
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            if(found == false){
                                finalArray.push(row);
                            }

                        }
                        if(finalArray != ''){
                            lastCases.push(finalArray)  
                        }
                        
                        if(j==idcases.length-1){
                            resp.send({'status': 1, 'data': lastCases});  
                        }                        
                    }
                });   
            }    
        }
    });
    
});

app.get('/getChartData', function(req, resp){
    connection.query(`SELECT idEstadoPacientes as id, Cedula as Case_id, Estado as State, FechaMod as Date FROM EstadoPacientes`, function(error, data){
        if(error){
            console.log("Error geting all states data: ", error);
            resp.send({'status': 0, 'message': "Error geting all states data..."});
        }else{
            connection.query(`SELECT Tr.Tratamiento, De.Muertos, Cu.Curados FROM (SELECT COUNT(Estado) as Tratamiento FROM EstadoPacientes WHERE (Estado="1" or Estado="2" or Estado="3")) as Tr, (SELECT COUNT(Estado) as Muertos FROM EstadoPacientes WHERE (Estado="5")) as De, (SELECT COUNT(Estado) as Curados FROM EstadoPacientes WHERE (Estado="4")) as Cu`, function(error, result1){
            if (result1){
                connection.query(`SELECT Tr.Infectados FROM (SELECT COUNT(Estado) as Infectados FROM EstadoPacientes WHERE (Estado="1" or Estado="2" or Estado="3" or Estado="5") GROUP BY Estado) as Tr`, function(error, result2){
                    if (result2){
                        connection.query(`SELECT Tr.Resultado FROM (SELECT COUNT(exam_state) as Resultado FROM MOCK_DATA GROUP BY exam_state) as Tr`, function(error, result3){
                            if (result3){        
                        if(data.length > 0){
                            var finalArray = new Array();
                            for(var item of data){
                                var date = moment(item.Date).format('YYYY-MM-DD');
                                finalArray.push([item.State, date]);
                            }
                            resp.send({'status': 1, 'data': finalArray, QueryData1: result1, QueryData2: result2, QueryData3: result3});
                        }else{
                            resp.send({'status': 0, 'message': "No data found..."});
                        }
                    }})
                }}
                )
            }
            })
        }
    });
});

app.post('/registerCase', async (req,res)=>{
    const name = req.body.name;
    const lastName = req.body.lastName;
    const cedula = req.body.cedula;
    const gender = req.body.gender;
    const birthday = req.body.birthday;
    const addressHome = req.body.addressHome;
    const addressWork = req.body.addressWork;
    const examDate = req.body.examDate;
    const examState = req.body.examState;
    axios.all([
        axios.get('https://nominatim.openstreetmap.org/search?format=json&country=Colombia&city=Barranquilla&q='+addressHome),
        axios.get('https://nominatim.openstreetmap.org/search?format=json&country=Colombia&city=Barranquilla&q='+addressWork)
    ])
    .then(axios.spread((...obj)=> {
        console.log(obj[0].data);
        console.log(obj[1].data);
        const addHome = obj[0].data;
        const addWork = obj[1].data;
        Address_coords = addHome[0].lat.concat(',',addHome[0].lon);
        Job_coords = addWork[0].lat.concat(',',addWork[0].lon);
        connection.query('INSERT INTO MOCK_DATA SET ?',{
            first_name:name,
            Last_name:lastName,
            Patient_id:cedula,
            Gender:gender,
            Birth_date:birthday,
            Address:addressHome,
            Job_Address:addressWork,
            exam_date:examDate,
            exam_state:examState,
            Address_coords:Address_coords,
            Job_coords: Job_coords
        }, async(error,results)=>{
            if(error){
                console.log(error);
            }else{
                res.render("registerCase",{
                    alert:true,
                    alertTitle: "Registro",
                    alertMessage: "Registrado con ??xito",
                    alertIcon: "success",
                    showConfirmButton:false,
                    timer:1500,
                    ruta: ''
                })
            }
        })

    }))    


    
    
})

app.get('/Gestionar',(rep,res) => {
    connection.query('SELECT first_name as Nombre, Last_name as Apellido, Patient_id as Cedula, Case_id as IDCaso FROM MOCK_DATA ORDER BY Case_id',(error, result)=>{
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
});

app.post('/search',(req,res) => {
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
        connection.query('SELECT P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula FROM MOCK_DATA as P WHERE ( P.first_name=? or P.Case_id=? or P.Patient_id=?)',[req.body.nombre,req.body.id_Paciente,req.body.cedula],(error, result)=>{
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
});

app.get('/selected/:id', (req,res) => {
    const IDCaso = req.params.id;

    connection.query('SELECT first_name as Nombre, Last_name as Apellido, Patient_id as Cedula, Case_id as IDCaso FROM MOCK_DATA WHERE Case_id = ? ORDER BY Case_id',[IDCaso],(error, result)=>{
        if(result){
            Buscar_Datos = result;
            able = 1;
        }  
        if(error){
            console.log(error);
        }
    });


    connection.query(`SELECT CONVERT_TZ( FechaMod,'UTC','America/Bogota' ) as Fecha, P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula, E.Estado as EstadoNum, ES.Estados as Estado FROM MOCK_DATA as P, EstadoPacientes as E, Estados as ES WHERE P.Case_id=? and E.Cedula=P.Patient_id and E.Estado=ES.idEstados ORDER BY E.FechaMod`,[IDCaso], (error,result) => {
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

});

app.post('/updated/:id', (req,res) => {
    const {estado} = req.body;
    const IDCaso = req.params.id;
    connection.query('INSERT INTO `EstadoPacientes` (`Cedula`,`Estado`) VALUES ((SELECT Patient_id FROM MOCK_DATA WHERE Case_id=?),?)',[IDCaso,estado],(error, result) => {
        if(result){
            res.redirect('/selected/'+IDCaso)
        }
        if(error){
            console.log(error);
        }
    })
})

app.get('/modifyCase',(req,res)=>{
    if(req.session.loggedin && req.session.rol==3){
        res.redirect('/Gestionar');
    }
    else{
        res.redirect('/')
    }
})

app.post('/register', async (req,res)=>{
    const user = req.body.user;
    const pass = req.body.password;
    const name = req.body.name;
    const lastName = req.body.lastName;
    const cedula = req.body.cedula;
    const rol = req.body.rol;
    let passHash = await bcryptjs.hash(pass,8);
    if(user && pass){
        connection.query("SELECT * FROM users WHERE user = ?",
        [user], async (error,results)=>{
            if(results.length == 0){
                connection.query('INSERT INTO users SET ?',{
                    user:user,
                    pass:passHash,
                    name:name,
                    rol:rol,
                    lastname:lastName,
                    cedula:cedula,
            
                }, async(error,results)=>{
                    if(error){
                        console.log(error);
                    }
                    else{
                        res.render('register',{
                            alert:true,
                            alertTitle: 'Registro',
                            alertMessage:'Registro exitoso',
                            alertIcon:'success',
                            showConfirmButton:false,
                            timer:1500,
                            ruta:''
                        })
                    }
                })
            }
            else{
                res.render('register',{
                    alert:true,
                    alertTitle: 'Error',
                    alertMessage:'Este usuario ya existe',
                    alertIcon:'error',
                    showConfirmButton:false,
                    timer:1500,
                    ruta:'register'
                })
            }
        })
    }
})

app.post('/auth', async(req,res)=>{
    const user = req.body.user;
    const pass = req.body.password;
    let passHash = await bcryptjs.hash(pass,8);

    if(user && pass){
        connection.query("SELECT * FROM users WHERE user = ?",
        [user], async (error,results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert:true,
                    alertTitle: 'Error',
                    alertMessage:'Usuario o contrase??a incorrectas',
                    alertIcon:'error',
                    showConfirmButton:true,
                    timer:1500,
                    ruta:'login'
                })
            }
            else{
                req.session.loggedin = true;
                req.session.name = results[0].name
                req.session.rol = results[0].rol
                if(req.session.rol==0){
                    req.session.rolName = 'Admin'
                }
                if(req.session.rol==2){
                    req.session.rolName = 'Medico'
                }
                if(req.session.rol==3){
                    req.session.rolName = 'Ayudante'
                }
                res.render('login',{
                    alert:true,
                    alertTitle: 'Excelente',
                    alertMessage:'Inicio de sesion exitoso',
                    alertIcon:'success',
                    showConfirmButton:false,
                    timer:1500,
                    ruta:''
                })
            }
        })
    }
    else{
        res.render('login',{
            alert:true,
            alertTitle: 'Advertencia',
            alertMessage:'Ingrese usuario o contrase??a',
            alertIcon:'warning',
            showConfirmButton:false,
            timer:false,
            ruta:'login'
        })
    }
})



app.listen(port,(req,res)=>{
    console.log('Server on port', port);
})

const connection = require('./database/db')