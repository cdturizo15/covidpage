const express = require('express');
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
    console.log(cc);
    console.log(id_caso);

    if(cc && id_caso){
        connection.query(`SELECT * FROM MOCK_DATA
        WHERE Patient_id = '${cc}' AND Case_id = '${id_caso}'`, function(error, data){
            if(error){
                console.log("Error trying to get by cc and id_caso: ", error);
                resp.send({'status': 0, 'message': 'Error trying to get by cc and id_caso...'});
            }else{
                console.log(data);
                resp.send({'status': 1, 'data': data});
            }
        });
        connection.query('SELECT E.FechaMod as Fecha, P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula, E.Estado as EstadoNum, ES.Estados as Estado FROM MOCK_DATA as P, EstadoPacientes as E, Estados as ES WHERE P.Case_id=? and E.Cedula=P.Patient_id and E.Estado=ES.idEstados ORDER BY E.FechaMod',[id_caso], (error,result) => {
            if(result){
                resp.send({'status': 1, 'result': result});
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
    connection.query(`SELECT * FROM MOCK_DATA
    JOIN states ON MOCK_DATA.Case_id = states.Case_id`, function(error, data){
        if(error){
            console.log(error);
            resp.send({'status': 0, 'message': "Error trying to get general data..."});
        }else{
            //Todo esto es para obtener el último estado de cada paciente.
            console.log(resp)
            var finalArray = new Array();
            for(var row of data){
                var found = false;
                for(var i=0; i<finalArray.length; i++){
                    var item = finalArray[i];
                    if(item.Case_id == row.Case_id){
                        if(moment(row.Date).diff(item.Date) > 0){
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
            console.log("RESPUESTA FINAL");
            console.log(finalArray);
            resp.send({'status': 1, 'data': finalArray});
        }
    });
});

app.get('/getChartData', function(req, resp){
    connection.query(`SELECT * FROM states`, function(error, data){
        if(error){
            console.log("Error geting all states data: ", error);
            resp.send({'status': 0, 'message': "Error geting all states data..."});
        }else{
            if(data.length > 0){
                var finalArray = new Array();
                for(var item of data){
                    var date = moment(item.Date).format('YYYY-MM-DD');
                    finalArray.push([item.State, date]);
                }
                resp.send({'status': 1, 'data': finalArray});
            }else{
                resp.send({'status': 0, 'message': "No data found..."});
            }
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
    connection.query('INSERT INTO MOCK_DATA SET ?',{
        first_name:name,
        Last_name:lastName,
        Patient_id:cedula,
        Gender:gender,
        Birth_date:birthday,
        Address:addressHome,
        Job_Address:addressWork,
        exam_date:examDate,
        exam_state:examState
    }, async(error,results)=>{
        if(error){
            console.log(error);
        }else{
            res.render("registerCase",{
                alert:true,
                alertTitle: "Registro",
                alertMessage: "Registrado con éxito",
                alertIcon: "success",
                showConfirmButton:false,
                timer:1500,
                ruta: ''
            })
        }
    })
    
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


    connection.query('SELECT E.FechaMod as Fecha, P.Case_id as IDCaso, P.first_name as Nombre, P.Last_name as Apellido, P.Patient_id as Cedula, E.Estado as EstadoNum, ES.Estados as Estado FROM MOCK_DATA as P, EstadoPacientes as E, Estados as ES WHERE P.Case_id=? and E.Cedula=P.Patient_id and E.Estado=ES.idEstados ORDER BY E.FechaMod',[IDCaso], (error,result) => {
        if(result){
            for (var i =0; i< result.length; i++) {
                if(result[i].EstadoNum == 5){able=0; console.log('desabled'); break;}else{able=1}
            }
            console.log(result)
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
    console.log(estado)
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
                    alertMessage:'Usuario o contraseña incorrectas',
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
            alertMessage:'Ingrese usuario o contraseña',
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