const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Create a new review
module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByPk(id);
    const { rating, comment } = req.body.review;
    
    const newReview = await Review.create({
        comment,
        rating,
        listingId: listing.id,
        authorId: req.user.id
    });

    req.flash("success", "Created new review!");
    res.redirect(`/listings/${listing.id}`);
};

// Delete a review
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Review.destroy({
        where: { id: reviewId }
    });
    
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
