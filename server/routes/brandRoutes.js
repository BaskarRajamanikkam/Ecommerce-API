const express = require('express');
const { create, createBrand } = require('../controllers/brandController');
const router = express.Router();


router.route('/create-brand').post(createBrand);

module.exports = router;