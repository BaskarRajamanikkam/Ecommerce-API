const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const cloudinary = require('cloudinary');
const ErrorHandler = require("../utils/errorHandler");
const Product = require('../models/productModel');
const SearchFeatures = require("../utils/searchFeatures");

//get all products
exports.getAllProducts = asyncErrorHandler(async(req,res,next)=>{
  const product = await Product.find();
  const productsCount = await Product.countDocuments();
  res.status(200).json({
    success:true,
    productsCount,
    product,

  })
});

//get single product
exports.getSingleProduct = asyncErrorHandler(async(req,res,next)=>{
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  res.status(200).json({
    success:true,
    product
  });
});

// get search sort filter pagination limits products
exports.getSearchProduct = asyncErrorHandler(async(req,res,next)=>{
  try {
    const resultPerPage = 2;
    const productsCount = await Product.countDocuments();
    
    const searchFeatures = new SearchFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .pagination(resultPerPage);
  
    let product = await searchFeatures.query.populate('category', 'name');
    let filterProduct = product.length;
   
    res.status(200).json({
      success:true,
      productsCount,
      filterProduct,
      product,
      resultPerPage,
    })
  } catch (error) {
    console.log(error);
  }
 
})




//Admin only access to this controller
//  create Product --- ADMIN
exports.newProduct= asyncErrorHandler(async(req,res,next)=>{
 
    let images = [];
  if(typeof req.body.images === "string"){
    images.push(req.body.images);
  }else{
    images = req.body.images;
  }
  for(let i = 0; i > images.length; i++){
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });
    images.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
    console.log(images[i]);
  }
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(200).json({
    success:true,
    product
  })
 

});

//get all products --- ADMIN
exports.getAdminProducts = asyncErrorHandler(async(req,res,next)=>{
  const products = await Product.find();
  res.status(200).json({
    success:true,
    products
  })
})

//update product --- ADMIN
exports.updateProduct = asyncErrorHandler(async(req,res,next)=>{
  let product = await Product.findById(req.params.id);
  if(!product){
    return next(new ErrorHandler("Product not found", 404));
  }

  if(req.body.images !== undefined){
    let images = [];
    if(typeof req.body.images === "string"){
      images.push(req.body.images)
    }else{
      images = req.body.images;
    }
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
    for(let i = 0; i < images.length; i++){
      const result = await cloudinary.v2.uploader.upload(images[i],{
        folder: "products",
      });
      images.push({
        public_id:result.public_id,
        url:result.secure_url,
      });
    }
  }
  req.body.user = req.user.id;
  
  product = await Product.findByIdAndUpdate(req.params.id, req.body,
    { new: true }
  );
  res.status(200).json({
    success:true,
    product
  })
})

// Delete Product --- ADMIN
exports.deleteProduct = asyncErrorHandler(async(req,res,next)=>{
  let product = await Product.findById(req.params.id);
  if(!product){
    return next(new ErrorHandler("Product Not Found", 404));
  }
  for(let i = 0; i > product.images.length; i++){
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  await product.deleteOne();
  res.status(201).json({
    success:true,
    message: "product deleted successfully..."
  })
})


// create or update Reviews
exports.createProductReview = asyncErrorHandler(async(req,res,next)=>{
  const { rating, comment, productId } = req.body;

  const review ={
    user: req.user._id,
    name:req.user.name,
    rating:Number(rating),
    comment,
  }

  const product = await Product.findById(productId);
  if(!product){
    return next(new ErrorHandler("Product Not Found", 404));
  }

  const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

  if(isReviewed){
    product.reviews.forEach((rev)=>{
      if(rev.user.toString() === req.user._id.toString())
        (rev.rating = rating, rev.comment = comment);
    });
  }else{
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev)=>{
    avg += rev.rating;
  })
  product.ratings = avg / product.reviews.length;

  await product.save({validateBeforeSave: false });

  res.status(200).json({
    success: true,
  })
})


//get all reviews of product
exports.getProductReviews = asyncErrorHandler(async(req,res,next)=>{
  const product = await Product.findById(req.query.id);
  if(!product){
    return next(new ErrorHandler("Product Not Found", 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews
  })
})

//delete reviews
exports.deleteReview =asyncErrorHandler(async(req,res,next)=>{

  const product = await Product.findById(req.query.productId);

  if(!product){
    return next(new ErrorHandler("Product Not Found", 404));
  }

  const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());
 
  let avg = 0;
  reviews.forEach((rev)=>{
    avg += rev.rating;
  });
   let ratings = 0;
   if(reviews.length === 0){
    ratings = 0;
   }else{
    ratings = avg / reviews.length;
   }
   const numOfReviews = reviews.length;
   const result  = await Product.findByIdAndUpdate(req.query.productId,{
    reviews,
    ratings: Number(ratings),
    numOfReviews,
   },{ new: true });
  res.status(200).json({
    success: true,
    result
  })
})