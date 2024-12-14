const  mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    otp:String,
    otpExpires:Date,
    isVerified:{
        type:Boolean,
        default:false
    },
    refreshToken:String
});





//Password hash
userSchema.pre('save',async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.generateOTP = async function(length){
        const digits = '0123456789';
        let otp ='';
        for(let i = 0; i < length; i++){
            otp += digits[crypto.randomInt(0,digits.length)];
            const salt = await bcrypt.genSalt(10);
            this.otp = await bcrypt.hash(otp,salt);
            this.otpExpires = Date.now() +  60 * 1000;
        }
    return otp;
};


userSchema.methods.compareOTP = function(otp){
  return bcrypt.compare(otp, this.otp);
};



//Password compare
userSchema.methods.comparePassword = async function(enterdPassword){
    return await bcrypt.compare(enterdPassword, this.password);
}


//Access Token Generate
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE  // 5 minute
    })
}


//Refresh Token Generate
userSchema.methods.getNewToken = function(){
    return  jwt.sign({id: this._id}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE // 7 days
    })
}




module.exports = mongoose.model("User",userSchema); 