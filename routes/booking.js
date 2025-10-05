const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin, isOwner } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// Route to display the "My Bookings" page
router.get("/my-bookings", isLoggedIn, wrapAsync(bookingController.showMyBookings));

// New route for admin to view all bookings
router.get("/admin/all-bookings", isLoggedIn, isAdmin, wrapAsync(bookingController.showAllBookings));

// New route for owner to view all bookings for their listings
router.get("/all-bookings", isLoggedIn, isOwner, wrapAsync(bookingController.showAllBookingsForOwner));

module.exports = router;
