const express = require("express");
// express Router will handle routes
const router = express.Router();
// grab methods from controller auth file
const {
  signup,
  accountActivation,
  signin,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

// import validators
const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators");
// express get() takes 2 arguments -  route and a callback function
// callback function accepts a request and response
router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/account-activation", accountActivation);

router.post("/signin", userSigninValidator, runValidation, signin);

// forgot reset route
router.put(
  "/forgot-password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);

router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

module.exports = router;
