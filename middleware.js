const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in to create listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'owner') {
        req.flash("error", "You must be an owner to perform this action.");
        return res.redirect("/listings");
    }

    let { id } = req.params;
    if (id) {
        let listing = await Listing.findByPk(id);
        if (listing && req.user && listing.ownerId !== req.user.id) {
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
    }
    
    next();
}

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findByPk(reviewId);
    if(review && req.user && review.authorId !== req.user.id) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        req.flash("error", "You are not authorized to perform this action.");
        return res.redirect("/listings");
    }
    next();
}


module.exports.isCustomerRole = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'customer') {
        req.flash("error", "You must be a customer to perform this action.");
        return res.redirect("/listings");
    }
    next();
}
