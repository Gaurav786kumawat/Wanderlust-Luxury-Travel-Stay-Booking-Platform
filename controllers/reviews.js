const Review = require("../models/reviews.js"); 
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let review = new Review(req.body.review);
    review.author = req.user._id; // author of the review 
    // console.log(review);
    listing.reviews.push(review); // Push the review into the listing's reviews array
    await review.save(); // Save the review to the database
    // Save the listing with the new review
    await listing.save();
    // Redirect to the listing's show page
    // console.log("Review added:", review);
    // res.send("Review added successfully.");
    // Alternatively, you can redirect to the listing's show page
    req.flash("success", "New Review added !");
    res.redirect(`/listings/${req.params.id}`);
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove the review ID from the listing's reviews array
    // Find the listing by ID
    await Review.findByIdAndDelete(reviewId); // Delete the review from the database
    console.log("Review deleted:", reviewId);

    req.flash("success", "Review deleted !");
    res.redirect(`/listings/${id}`); // Redirect to the listing's show page
}