const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        capacity: Joi.number().required().min(1),
        festivalName: Joi.string().allow('', null),
        nearestLocation1: Joi.string().required(),
        distance1: Joi.number().required().min(0),
        nearestLocation2: Joi.string().required(),
        distance2: Joi.number().required().min(0),
        nearestLocation3: Joi.string().allow('', null),
        distance3: Joi.number().allow(null).min(0),
        nearestLocation4: Joi.string().allow('', null),
        distance4: Joi.number().allow(null).min(0),
        image : Joi.string().allow("", null)
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
})