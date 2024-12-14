const  mongoose  = require("mongoose");


const brandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    logo:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }
})

module.exports = mongoose.model('Brand', brandSchema);