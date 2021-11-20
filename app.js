const express = require('express');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const session = require('express-session')
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

app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
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