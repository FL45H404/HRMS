require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Register = require('../model/register')
const session = require('express-session')
const db = require('../conn/db')
var moment=require('moment')
const nodemailer = require('nodemailer')
const ejs = require('ejs');

exports.addProfile=async(req,res)=>{
    try{
        let loginId=req.cookies.user[0].id
        let body=req.body;
        let data=[
            body.firstname,
            body.lastname,
            body.number,
            body.email,
            body.dob,
            body.gender,body.address1,body.address2,
            body.city,
            body.state,
            body.pincode,
            loginId
        ]
        console.log(data)
        var sql='insert into profile (firstname,lastname,number,email,dob,gender,address1,address2,city,state,pincode,loginId) values (?,?,?,?,?,?,?,?,?,?,?,?)'
        db.query(sql,data,(err,result)=>{
            if(err) return res.send(err)
            console.log(result)
            res.status(201)
            return res.render('editProfile', { message: "profile updated" })
        })

    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
}


exports.viewProfile=async(req,res)=>{
    try{
        let sql='select * from profile where loginId=? order by loginId desc limit 1'
        let data=[
            req.cookies.user[0].id
        ]
        db.query(sql,data,(err,result)=>{
            if(err) return res.send(err)
            if(result.length>0){
                return res.status(200).render('viewProfile',{result:result[0]})
            }else{
                return res.status(400).redirect('/edit-profile')
            }
            
        })
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
}

exports.viewProfileById=async(req,res)=>{
    try{
        let sql='select * from profile where id=?'
        let data=[
            req.params.id
        ]
        db.query(sql,data,(err,result)=>{
            if(err) return res.send(err)
            console.log(result)
            return res.status(200).render('updateProfile',{result:result[0],moment:moment})
        })

    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
}

exports.updateProfile=async(req,res)=>{
    try{
        
        let data=[
            req.body.firstname,
            req.body.lastname,req.body.number,req.body.email,req.body.dob,req.body.gender,req.body.address1,req.body.address2,req.body.city,req.body.state,req.body.pincode,req.params.id
        ]
        let sql="update profile set firstname=?,lastname=?,number=?,email=?,dob=?,gender=?,address1=?,address2=?,city=?,state=?,pincode=? where id=?";
        db.query(sql,data,(err,result)=>{
            if(err) return res.send(err)
            console.log(result)
            return res.redirect('/view-profile')
        })
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }

}
exports.viewAttendance=async(req,res)=>{
    try{
var sql='SELECT * FROM attendance  where userId=? order by id desc limit 10'
let userId=[
    req.cookies.user[0].id
]
db.query(sql,userId,(err,result)=>{
    if(err) return res.send(err)
    console.log(result)
            return res.status(200).render('activity',{result:result,moment:moment})
})
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
}

exports.birthdays=async(req,res)=>{
    try{
        var sql='SELECT * FROM  profile WHERE  DATE_ADD(dob, INTERVAL YEAR(CURDATE())-YEAR(dob)+ IF(DAYOFYEAR(CURDATE()) > DAYOFYEAR(dob),1,0)YEAR)  BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 300 DAY);'
        db.query(sql,(err,result)=>{
            if(err) return res.send(err)
            // console.log(result)
            res.render('birthdaysPage',{moment:moment,result:result})
        })
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
}
exports.birthdayWish=async(req,res)=>{
    try{
        var transporter = await nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
              user: process.env.MAIL_ID,//user-email
              pass: process.env.MAIL_password,//user-password
            }
          });
var sql="select * from profile where id=?"
var data=[req.params.id]
var sender=req.session.user[0].email
db.query(sql,data,(err,result)=>{
    // console.log(result)
    
    if(err) return res.send(err)
    console.log(result[0].firstname)
    ejs.renderFile("views/bdayTemplate.ejs", { name: result[0].firstname, to: result[0].email,from:sender} , function (err, data) {
        if (err) {
          console.log(err)
        }
        else {
          var mailOptions = {
            from: process.env.MAIL_ID,
            to: result[0].email,//reciver email
            subject: 'Wishes',
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
    return res.redirect('/birthdays')
})
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
}