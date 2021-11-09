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
    res.render('index');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.listen(port,(req,res)=>{
    console.log('Server on port', port);
})

const connection = require('./database/db')