const Joi = require('joi');
const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(1).required(),
        location: Joi.string().required(),
        country: Joi.string().required()
    }),
    thumbnail: Joi.string(), // ✅ add this
    deleteImages: Joi.array().items(Joi.string()) // ✅ optional
});



module.exports.listingSchema = listingSchema;

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
});


