const ErrorHandler = require('../utils/errorHandler');

module.exports = (err,req,res,next) =>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    if(process.env.NODE_ENV === 'development'){


        res.status(err.statusCode)
        .json({
            success: false,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }



    if(process.env.NODE_ENV === 'production'){
       
        let message = err.message;
        let error = new ErrorHandler(message);


        //mongodb id error
        if(err.name === "CastError"){
            let message = `Resource Not Found. Invalid: ${err.path}`;
            error = new ErrorHandler(message);
        }

        //mongoose duplicate key error
        if(err.code === 11000){
            let message = `Duplicate ${Object.keys(err.code)} entered`;
            error = new ErrorHandler(message);
        console.log(err.code === 11000);
        }

        

        if (err.name === 'TokenExpiredError'){
            let message = "Token Expired";
            error = new ErrorHandler(message);
        }
       
        if(err.name === 'JsonWebTokenError'){
            let message = "Invalid Token";
            error = new ErrorHandler(message);
        }
        
        if(err.name === "SyntaxError"){
            let message = "object  is not valid json";
            error = new ErrorHandler(message)
        }

        
        res.status(err.statusCode).json({
            success: false,
            message: error.message
        })
    }





}