let isActive=function (req,res,next){
    if(!req.session.user){
        return res.redirect('/')
    }
    next();
}

let isAdmin=function (req,res,next){
    if(req.session.role==="admin"){
    next()
    }else{
    res.redirect('/home')
    }
}
module.exports={isAdmin,isActive}