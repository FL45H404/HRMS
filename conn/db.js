// require('dotenv').config()
// const mongoose=require('mongoose')
// mongoose.connect('mongodb+srv://vipul:Vipul%401997@cluster0.zpemt.mongodb.net/HRMS?retryWrites=true&w=majority',{
//     useNewUrlParser:true,
// }).then(()=>console.log('connection succesull'))
// .catch((err)=>console.log(err))
const mysql=require('mysql');

var db = mysql.createPool({
  connectionLimit : 50, // The maximum number of connections to create at once. (Default: 10)
  queueLimit: 100, // The maximum number of connection requests the pool will queue before returning an error from getConnection. (Default: 0)
    user: 'root',
    host: 'localhost',
    database: 'hrms',
    password: 'Vipul@1997',
    connectTimeout : 10000, // The milliseconds before a timeout occurs during the initial connection to the MySQL server. (Default: 10000)
    waitForConnections: true, // Determines the pool's action when no connections are available and the limit has been reached. (Default: true)
    acquireTimeout: 10000, // The milliseconds before a timeout occurs during the connection acquisition. (Default: 10000)
  
    debug:false,
  
  ssl: {
      rejectUnauthorized: false
    }
  });


db.getConnection((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('connected to database.....')
    }

})

module.exports = db;