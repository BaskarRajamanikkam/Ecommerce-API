const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const Category = require('../models/categoryModel');
const ErrorHandler = require("../utils/errorHandler");

exports.createCategory = asyncErrorHandler(async(req,res,next)=>{
    const { name } = req.body;

   try {
    const category = await Category.create({name});
    res.status(201).json({
        success:true,
        category,
    })
   } catch (error) {
    return next(new ErrorHandler("category already inserted.",400));
   }
})