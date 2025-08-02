const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controllers/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");

// SIGNUP ROUTES
router
  .route("/signup")
  .get(userController.renderSignupForm) // GET /signup
  .post(wrapAsync(userController.createUser)); // POST /signup

// LOGIN ROUTES
router
  .route("/login")
  .get(userController.renderLoginForm) // GET /login
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.loginUser // POST /login
  );

// LOGOUT ROUTE
router.get("/logout", userController.logoutUser); // GET /logout

module.exports = router;
