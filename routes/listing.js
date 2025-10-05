const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing, isAdmin, isCustomerRole } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const bookingController = require("../controllers/bookings.js");
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });

// Routes for getting all listings and creating a new one
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        isOwner,
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.createListing)
    );
    
// Route to show the "new listing" form
router.get("/new", isLoggedIn, isOwner, listingController.renderNewForm);

// --- THIS IS THE NEW ROUTE ---
// NOTE: This route must come BEFORE the "/:id" route to work correctly
router.get("/my-listings", isLoggedIn, isOwner, wrapAsync(listingController.showMyListings));

// Route for booking a specific listing
router.post("/:id/book", isLoggedIn, isCustomerRole, wrapAsync(bookingController.createBooking));

// Routes for showing, updating, and deleting a specific listing
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// New route for admin to update listing status
router.patch("/:id/status", isLoggedIn, isAdmin, wrapAsync(listingController.updateListingStatus));

// New route for admin dashboard
router.get("/admin/dashboard", isLoggedIn, isAdmin, wrapAsync(listingController.adminDashboard));

// Route to show the "edit listing" form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;

