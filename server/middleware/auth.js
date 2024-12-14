const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const asyncErrorHandler = require("./asyncErrorHandler");
const User = require('../models/userModel');


exports.isAuthenticated = asyncErrorHandler(async (req,res,next) => {
    const {refreshToken } = req.cookies;
    if (!refreshToken) {
        return next(new ErrorHandler("Please Login to Access", 401));
    }

    let token;
    if(req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
});


exports.authorizeRoles = (...roles) =>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`));
        }
        next();
    }
}

