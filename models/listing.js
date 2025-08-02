const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./reviews.js'); // Import the Review model

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }], // Reference to the Review model by ObjectId from the reviews collection
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    thumbnail: {
        type: String, // store filename OR URL depending on your use
        default: ""
    },

    // category : {
    //     type : String,
    //     enum : ["mountains" , "rooms" , "farms" , "arctic" , "trending" , "desert"]
    // } // ! isko build krna hi hai yha se category ko filter krne ke liye 
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } }); // Delete all reviews associated with the listing being deleted
        // This ensures that when a listing is deleted, all its associated reviews are also removed from
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
