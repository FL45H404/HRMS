require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
// const Register = require('../model/register')
const session = require('express-session')
const db = require('../conn/db')
const nodemailer = require('nodemailer')
const ejs = require('ejs');
var localStorage=require('node-localstorage')

exports.login = async (req, res) => {
    try {
        const body = req.body;
        db.query("select id,email,password,role from register where email=?", body.email, (err, result) => {
            if (err) return res.send(err)
            console.log(result)
            if (result.length<0 || !result[0]) {
                res.status(400)
                return res.render('login',{message:"Invalid Credentials"})
            }
            bcrypt.compare(body.password, result[0].password, (err, hash) => {
                if (err) return res.status(400).send(err);
                if (!hash) {
                    res.status(400)
                    return res.render('login',{message:'Invalid Credentials'});
                }
                const token = jwt.sign(body.email, process.env.TOKEN_SECRET);
                // req.setHeader('token',token);
                // localStorage.setItem('token','Bearer'+token)
                res.header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.YWRtaW5AZ21haWwuY29t._wAyUuEYFY-3AyfkroUm81EAiiF13BCGYIXkkqsaBFU");
                res.cookie("jwt",token, {
                    expires: new Date(Date.now() + 43200000),
                    httpOnly: true
                })
                res.cookie("user", result, {
                    expires: new Date(Date.now() + 43200000),
                    httpOnly: true
                }
                )
                req.session.role=result[0].role
                req.session.user = result
                const data = [
                    new Date(),
                    new Date(),
                    result[0].id
                ]
                db.query('insert into attendance (EntryDate,EntryTime,userId) values (?,?,?)', data, (err, result) => {
                    if (err) return res.send(err)
                    console.log(req.session.user)
                    console.log("login succesfully")
                    res.status(200)
                    return res.redirect('/home')
                })
            })

        })
    } catch (err) {
        return res.status(500).send(err)
    }
}
exports.addregister = async (req, res) => {
    try {
        var transporter = await nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
              user: process.env.MAIL_ID,//user-email
              pass: process.env.MAIL_password,//user-password
            }
          });
        db.query("select email from register where email=?", [req.body.email], (err, result) => {
            if (result.length > 0 && result[0].email == req.body.email) {
                console.log(req.body.email)
                res.render('addUser', { name: req.body.username, message: 'Email Id is already exist' })
            } else {
                bcrypt.hash(req.body.password, 8, (err, password) => {
                    if (err) throw err;
                    const token = jwt.sign(req.body.email, process.env.TOKEN_SECRET);
                    const data = [
                        req.body.username,
                        req.body.email,
                        password,
                        token,
                        "user",
                        new Date()
                    ]
                    var sql = "INSERT INTO register (username,email,password,token,role,createdDate) values (?,?,?,?,?,?)";
                    db.query(sql, data, (err, result) => {
                        if (err) return res.status(400).send(err);
                        ejs.renderFile("views/mailTemplate.ejs", { name: req.body.username, email: req.body.email,password:req.body.password} , function (err, data) {
                            if (err) {
                              console.log(err)
                            }
                            else {
                              var mailOptions = {
                                from: process.env.MAIL_ID,
                                to: req.body.email,//reciver email
                                subject: 'Login Credential',
                                html: data
                              };
                    
                              transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  console.log('Email sent: ' + info.response);
                                }
                              });
                            }
                          });
                        res.status(201)
                        return res.render('addUser', { message: "user added" })
                    })
                })
            }
        })
    } catch (err) {
        res.status(500).send(err)
    }
}

exports.logout = async (req, res) => {
    try {
        console.log(req.session.user[0].id)
        let data = [
            req.session.user[0].id
        ]
        db.query('select * from attendance where userId=? order by id desc limit 1', data, (err, result) => {
            if (err) return res.send(err)
            if (result.length > 0) {
                let data = [
                    new Date(),
                    result[0].id
                ]
                db.query('update attendance set ExitTime=? where id=?', data, (err, result) => {
                    if (err) return res.send(err)
                    console.log('logout succesfully')
                    res.clearCookie('user',{path:'/'})
                    res.clearCookie('jwt',{path:'/'})
                    res.clearCookie('uid',{path:'/'})
                    req.session.destroy(function (err){
                        return res.redirect('/logout')
                    })
                   
                })
            }
        })

    } catch (err) {
        return res.status(500).send(err)
    }
}

exports.viewUsers=async(req,res)=>{
    try{
        let sql="select * from profile order by id desc"
        db.query(sql,(err,result)=>{
            if(err) return res.send(err)
            console.log(result)
            return res.render('viewUser',{result:result})
        })
    }catch(err){
        return res.status(500).send(err)   
    }
}
exports.manageUser=async(req,res)=>{
    try{
let sql='select * from register order by id desc'
db.query(sql,(err,result)=>{
    if(err) return res.send(err)
    res.status(200)
    return res.render('manageUser',{result:result})
})
    }catch(err){
        return res.status(500).send(err)  
    }
}

exports.manageUserById=async(req,res)=>{
    try{
        const data=[req.params.id]
let sql='select * from register where id=?'
db.query(sql,data,(err,result)=>{
    if(err) return res.send(err)
    res.status(200)
    return res.render('updateUser',{result:result[0]})
})
    }catch(err){
        return res.status(500).send(err)  
    }
}
exports.updateUserById=async(req,res)=>{
    try{
        let data=[
           req.body.role,req.params.id
        ]
        let sql="update register set role=? where id=?";
        db.query(sql,data,(err,result)=>{
            if(err) return res.send(err)
            console.log(result)
            return res.redirect('/manage-user')
        })
    }catch(err){
        return res.status(500).send(err)
    }
}

exports.deleteUserById=async(req,res)=>{
    try{
        let data=[
           req.params.id
        ]
        let sql="delete from register where id=?";
        db.query(sql,data,(err,result)=>{
            if(err) return res.send(err)
            console.log(result)
            return res.redirect('/manage-user')
        })
    }catch(err){
        return res.status(500).send(err)
    }
}

exports.changePassword=async(req,res)=>{
    try{
        const body = req.body;
// var sql="update register set password=? where id=?"
let sql="select * from register where id=?"
let data=[ req.session.user[0].id]
console.log(data)
db.query(sql,data,(err,result)=>{
    if(err) res.send(err)
    bcrypt.compare(body.oldpassword, result[0].password, (err, hash) => {
        if(err) res.send(err)
        if(!hash){
            res.status(400)
            return res.render('changePassword',{message:'Old password is wrong!!'});
        }let sql1="update register set password=? where id=?"
        
        
        bcrypt.hash(req.body.password, 8, (err, password) => {
            let data1=[
                password,
                result[0].id
            ]
            db.query(sql1,data1,(err,result)=>{
                if(err) return res.send(err)
                return res.render('changePassword',{message:"password updated succesfully!"})
            })
        })

    })
})

    }catch(err){
        return res.status(500).send(err)
    }
}