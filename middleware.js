const Listing = require("./models/listing.js");
const ExpressError = require('./utils/ExpressError.js');
const Review = require("./models/reviews.js");

const { reviewSchema, listingSchema } = require('./schema.js'); // Import the validation schema



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    // ! handling from hoppscotch or postman
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id);

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    // ! handling from hoppscotch or postmam
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    // Validate the request body against the schema
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(', '); // Join all error messages into a single string

        throw new ExpressError(errMsg, 400); // If validation fails, throw an error
    } else {
        console.log("Validation successful:", req.body);// If validation is successful, proceed to the next middleware
        next();
    }
}


// ! ValidateReview function to validate the review request body against the schema
module.exports.validateReview = (req, res, next) => {
    // Validate the request body against the review schema
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let { error } = reviewSchema.validate(req.body);
        let errMsg = error.details.map(el => el.message).join(', '); // Join all error messages into a single string
        throw new ExpressError(errMsg, 400); // If validation fails, throw an error
    } else {
        console.log("Review validation successful:", req.body); // If validation is successful, proceed to the next middleware
        next();
    }
}

module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.email === "gaurav822kumawat@gmail.com") {
        return next();
    }
    req.flash("error", "Admin access only.");
    res.redirect("/listings");
};






/*
req.session.returnTo = req.originalUrl;
is the mandatory ? -> Yes, it is.
why ? -> To store the URL of the page that the user was trying to access before being redirected to the login page.
Why we need to store ? -> To redirect the user back to the page that they were trying to access before being redirected to the login page.
*/ 