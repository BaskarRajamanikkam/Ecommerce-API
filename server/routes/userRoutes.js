const express = require('express');
const { signup, login, getUserDetails, handleRefreshToken, verifySignup, resendOtp, getLocation } = require('../controllers/userControllers');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

//signup
router.route('/signup').post(signup);
//verify otp
router.route('/verify-otp').post(verifySignup);
//resend otp
router.route('/resend-otp').post(resendOtp);
//login
router.route('/login').post(login);

router.route('/profile').get(isAuthenticated, getUserDetails);
router.route('/refresh').get(handleRefreshToken);




module.exports = router;

