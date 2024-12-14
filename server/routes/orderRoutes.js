const express = require('express');
const { newOrder, getSingleOrderDetails, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// create new order 
router.route('/order/new').post(isAuthenticated, newOrder);

// get single order
router.route('/order/:id').get(isAuthenticated, getSingleOrderDetails);

// get my orders
router.route('/orders/me').get(isAuthenticated, myOrders);

// admin only access
router.route('/admin/orders').get(isAuthenticated, authorizeRoles("admin"), getAllOrders);

//update orders
router.route('/admin/order/update/:id').put(isAuthenticated, authorizeRoles("admin"), updateOrder);

//delete orders
router.route('/admin/order/delete/:id').delete(isAuthenticated, authorizeRoles("admin"),deleteOrder);

module.exports = router;