const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const Brand = require("../models/brandModel");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require('cloudinary');

exports.createBrand = asyncErrorHandler(async (req, res, next)=>{
    try {
        const myCloud  = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
        });
        const { name } = req.body;

        const brand = await Brand.create({
            name,
            logo: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
        });
        
        res.status(201).json({
            success:true,
            brand,
        });
        
    } catch (error) {
        return next(new ErrorHandler("No created brands",400));
    }
})