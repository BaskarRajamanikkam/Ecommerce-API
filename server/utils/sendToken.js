const sendToken = (user, statusCode, res) =>{
    const token = user.getJwtToken();
    const refreshToken = user.getNewToken();

    const options ={
        httpOnly:true,
        maxAge:  process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    }

    res.status(statusCode)
    .cookie('refreshToken',refreshToken,options,  )
    .json({
        success:true,
        data : user,
        token
    })
    
    
}
module.exports = sendToken;

