var mongoose=require('mongoose')
const RegisterSchema=new mongoose.Schema({
username:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true
},token:{
    type:String,
    required:true    
},
role:{
    type:String,
    default:'user'
},attendance:[{
    EntryDate:{
        type:Date,
        default:Date.now()
    },
    entry:{
        type:String
    },
    exit:{
        type:String
    }
}]

},{timestamps:true})
const Register=new mongoose.model('Register',RegisterSchema);
module.exports=Register;