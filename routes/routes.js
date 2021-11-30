const express = require('express')
const router = express.Router();
const bcryptjs = require('bcryptjs');
const connection = require('../database/db')
/* const PacientesController = require ('../Controller/Pacient_controller') */


router.get('/register',(req,res)=>{
    if(req.session.loggedin && req.session.rol==0){
        res.render('register');
    }
    else{
        res.redirect('/')
    }
    
})

router.get('/registerCase',(req,res)=>{
    if(req.session.loggedin && req.session.rol==3){
        res.render('registerCase');
    }
    else{
        res.redirect('/')
    }
})

router.get('/modifyCase',(req,res)=>{
    if(req.session.loggedin && req.session.rol==3){
        res.render('Gestion');
    }
    else{
        res.redirect('/')
    }
})

/* router.get('/Gestionar', PacientesController.list);

router.post('/search', PacientesController.search);

router.get('/selected/:id', PacientesController.select);

router.post('/updated/:id', PacientesController.update);*/

router.get('/login',(req,res)=>{
    res.render('login');
}) 

router.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

router.get('/view',(req,res)=>{
    if(req.session.loggedin && req.session.rol==2){
        res.render('view');
    }
    else{
        res.redirect('/')
    }
    
})

router.get('/getById', function(req, resp){
    const cc = req.query.patient_id;
    const id_caso = req.query.case_id;
    console.log(cc);
    console.log(id_caso);

    if(cc && id_caso){
        connection.query(`SELECT * FROM MOCK_DATA
        JOIN states ON MOCK_DATA.Case_id = states.Case_id
        WHERE Patient_id = '${cc}' AND Case_id = '${id_caso}'`, function(error, data){
            if(error){
                console.log("Error trying to get by cc and id_caso: ", error);
                resp.send({'status': 0, 'message': 'Error trying to get by cc and id_caso...'});
            }else{
                console.log(data);
                resp.send({'status': 1, 'data': data});
            }
        });
    }else{
        if(cc){
            connection.query(`SELECT * FROM MOCK_DATA
            JOIN states ON MOCK_DATA.Case_id = states.Case_id
            WHERE Patient_id = '${cc}'`, function(error, data){
                if(error){
                    console.log("Error trying to get by cc: ", error);
                    resp.send({'status': 0, 'message': 'Error trying to get by cc...'});
                }else{
                    console.log(data);
                    resp.send({'status': 1, 'data': data});
                }
            }); 
        }

        if(id_caso){
            connection.query(`SELECT * FROM MOCK_DATA
            JOIN states ON MOCK_DATA.Case_id = states.Case_id
            WHERE MOCK_DATA.Case_id = '${id_caso}'`, function(error, data){
                if(error){
                    console.log("Error trying to get by id_caso: ", error);
                    resp.send({'status': 0, 'message': 'Error trying to get id_caso...'});
                }else{
                    resp.send({'status': 1, 'data': data});
                }
            });
        }
    }
});

router.get('/getGeneral', function(req, resp){
    connection.query(`SELECT * FROM MOCK_DATA
    JOIN states ON MOCK_DATA.Case_id = states.Case_id`, function(error, data){
        if(error){
            console.log(error);
            resp.send({'status': 0, 'message': "Error trying to get general data..."});
        }else{
            //Todo esto es para obtener el último estado de cada paciente.
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

router.get('/getChartData', function(req, resp){
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

router.post('/register', async (req,res)=>{
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

router.post('/auth', async(req,res)=>{
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


module.exports = router;
