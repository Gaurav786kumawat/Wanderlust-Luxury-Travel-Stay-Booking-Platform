// ! Restructuring of the reviews directory

const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");
const Listing = require('../models/listing.js');
const {isLoggedIn} = require("../middleware.js");
const {validateReview} = require("../middleware.js");
const {isReviewAuthor} = require("../middleware.js");
const {isListingAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// ! REVIEW ROUTES (Nested under /listings/:id/reviews)
router
  .route("/")
  .post(isLoggedIn, validateReview, wrapAsync(reviewController.createReview)); // POST /listings/:id/reviews

router
  .route("/:reviewId")
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview)); // DELETE /listings/:id/reviews/:reviewId

module.exports = router;
