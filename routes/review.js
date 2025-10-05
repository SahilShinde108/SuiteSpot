const express = require('express');
// The "mergeParams: true" option is crucial for nested routes like this
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// POST Review Route
router.post(
    "/", 
    isLoggedIn, 
    validateReview, 
    wrapAsync(reviewController.createReview)
);

// DELETE Review Route
router.delete(
    "/:reviewId", 
    isLoggedIn, 
    isReviewAuthor, 
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;
