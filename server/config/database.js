const  mongoose = require("mongoose");


const connectDB = () =>{
    const MONGO_URI = process.env.MONGO_URI;
    
    mongoose.connect( "mongodb://localhost:27017/online-shopping", {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(()=>{
        console.log("Mongodb Connected");
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = connectDB;

