const express=require('express')
const app=express();
const path=require('path')
require('./conn/db')
const PORT=8000
const cookieParser=require('cookie-parser')
const cors=require('cors')
const ejs=require('ejs')
var session = require('express-session');
var moment=require('moment')
const db=require('./conn/db')
var localstorage=require('node-localstorage')

app.use(cors())
app.use(cookieParser());
app.use(session({
    key:'uid',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {expires: 43200000 }
  }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use((req,res,next)=>{
    res.locals.islogin=req.session.jwt;
    res.locals.user=req.session.user;
    res.locals.role=req.session.role;
   
    // console.log(req.session)
    next();
   
})
// const Register=require('./model/register')
const registerRoute=require('./routes/register')
const userRoute=require('./routes/user');
// const { birthdays } = require('./controler/userProfile');


function isLogin(req,res,next){
    if(!req.session.user){
        res.render('login',{message:''})
    }else{
        res.redirect('/home')
    }
}
function isActive(req,res,next){
    if(!req.session.user){
        return res.redirect('/')
    }
    next();
}
function isAdmin(req,res,next){
    if(req.session.role==="admin"){
    next()
    }else{
    res.redirect('/home')
    }
}
app.use('/',registerRoute)
app.use('/',userRoute)

// function isLogin(req,res,next){
// if(!req.cookies.user){
// res.redirect('/')
// }
// next();
// }
app.get('/',isLogin,(req,res)=>{
    res.render('login',{message:''})
})
app.get('/login',isLogin,(req,res)=>{
    res.render('login',{message:''})
})
// app.get('*',isLogin,(req,res,next)=>{
// return next();
// })
app.get('/home',isActive,(req,res)=>{
    res.render('index')   
})
app.get('/birthdays',isActive,(req,res)=>{
    
    res.render('birthdaysPage')
})
app.get('/edit-profile',isActive,(req,res)=>{
    res.render('editProfile')
})
app.get('/view-profile',isActive,(req,res)=>{
    res.render('editProfile')
})
app.get('/activity',isActive,(req,res)=>{
    res.render('activity')
})


app.get('/add-user',isActive,isAdmin,(req,res)=>{
    res.render('addUser',{message:''})
})
app.get('/view-users',isActive,isAdmin,(req,res)=>{
    res.render('viewUser')
})
app.get('/manage-user',isActive,isAdmin,(req,res)=>{
    res.render('manageUser')
})
app.get('/change-password',isActive,(req,res)=>{
    res.render('changePassword',{message:''})
})
app.get('/logout',(req,res)=>{
res.render('logout')
})
app.listen(PORT,()=>{
console.log(`server started at http://localhost:${PORT}/`)
})