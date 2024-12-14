const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dns = require('dns');




const checkInternetConnection = () =>{
    return new Promise((resolve,rejects)=>{
        dns.lookup('google.com', (err)=>{
            if(err && err.code === 'ENOTFOUND'){
                rejects('No Internet Connection');
            }else{
                resolve('Connected to the internet');
            }
        });
    });
};

//Nodemailer config
const transporter = nodemailer.createTransport({
    service:'gmail',
    secure:false,
    tls:{
        rejectUnauthorized:false
    },
    auth:{
        user: "rbaskarkava@gmail.com",
        pass: "prga tpsb puqq cnce"
    },
});

exports.signup = asyncErrorHandler(async (req,res,next)=>{
    const { name, email, password } = req.body;
    try {
    
    await checkInternetConnection();

    let user = await User.findOne({email});
    
     if(user){
        return next(new ErrorHandler("Email Already Exists",400));
     }
   

     user = new User({name,email,password});
     const otp = await user.generateOTP(6);
     await user.save();

     const mailOptions = {
            from : '',
            to: user.email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        };
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                return next(new ErrorHandler('email not send or something went wrong',404));
            }
    })
    res.status(201).json({
     message: "otp send your mail, please verify",
     otpExpires : user.otpExpires,
    })
    
    } catch (error) {
        if(error === 'No Internet Connection'){
            return next(new ErrorHandler('Please check your internet connection and try again',400));
        }
    }
});

exports.verifySignup = asyncErrorHandler(async(req,res,next)=>{
    const {email, otp} = req.body;
    try{
        const user = await User.findOne({email, otpExpires:{ $gt: Date.now() } });
        if(!user){
            return next(new ErrorHandler("expired OTP", 400));
        }
        const isMatch = await user.compareOTP(otp);
        if(!isMatch){
            return next(new ErrorHandler("Invalid OTP", 400))
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
                   
        res.status(200).json("Email verified successfully");
        
    }catch(err){
        console.log(err);
    } 
}); 

exports.resendOtp = asyncErrorHandler(async(req,res,next)=>{
    const { email } = req.body;
    try {
        let user = await User.findOne({email});
        const otp = await user.generateOTP(6);
        await user.save();

        const mailOptions = {
            from : '',
            to: user.email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        };
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                return next(new ErrorHandler('email not send or something went wrong',404));
            }
           res.status(201).json({
            message: "otp resend your mail, please verify",
           })
        })

    } catch (error) {
        console.log(error);
    }
})


exports.login = asyncErrorHandler(async(req,res,next)=>{
        const { email, password } = req.body;
        if(!email || !password) {
            return next(new ErrorHandler("Please Enter Email And Password",400));
        }
        
        let user = await User.findOne({email}).select('+password');
        if(!user){
            return next(new ErrorHandler("Invalid Email", 401));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch){
            return next(new ErrorHandler("Wrong Password", 401));
        }

        

        const refreshToken = await user.getNewToken();
        user = await User.findByIdAndUpdate(user.id,{
            refreshToken : refreshToken
        },{ new : true }
        );
        sendToken(user, 201, res)
       
        
});

exports.handleRefreshToken = asyncErrorHandler(async (req,res,next) =>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken){
        return next(new ErrorHandler("No Refresh Token in Cookies",404));
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        return next(new ErrorHandler("No Refresh Token  present in db or not matched",404));
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET,(err,decoded)=>{
        if(err || user.id !== decoded.id){
            return next(new ErrorHandler("There is something wrong with refresh token",400));
        }
        const accessToken = user.getJwtToken(decoded);
        res.status(200).json({
            success:true,
            accessToken,
        })
    })

});



exports.getUserDetails = asyncErrorHandler(async(req,res,next)=>{

    const user = await User.findById(req.user.id);
   res.status(200).json({
    success:true,
    user
   });
})






