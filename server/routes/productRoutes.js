const express = require('express');
const {  newProduct, getAllProducts, getSingleProduct, getSearchProduct, updateProduct, getAdminProducts, deleteProduct, createProductReview, getProductReviews, deleteReview } = require('../controllers/productController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// get all products
router.route('/products/all').get(getAllProducts);

//get single product
router.route('/product/:id').get(getSingleProduct);

//get search products
router.route('/products').get(getSearchProduct);

// user add reviews
router.route('/review').put(isAuthenticated, createProductReview);



//admin only access

//create product
router.route('/admin/product/new').post(isAuthenticated, authorizeRoles("admin"),newProduct);

// get all products 
router.route('/admin/products').get(isAuthenticated,authorizeRoles("admin"),getAdminProducts);

//update product
router.route('/admin/product/update/:id').put(isAuthenticated,authorizeRoles("admin"), updateProduct);

// delete product
router.route('/admin/product/delete/:id').delete(isAuthenticated, authorizeRoles("admin"), deleteProduct);

// get all reviews
router.route('/admin/reviews').get(getProductReviews);

// delete review
router.route('/admin/reviews').delete(isAuthenticated, deleteReview);




module.exports = router; 