const { Op } = require('sequelize');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const Booking = require('../models/booking.js');
const Bill = require('../models/bill'); // Add this line
const User = require('../models/user.js');

module.exports = {
    // Renders the page showing all of the current user's bookings
    showMyBookings: async (req, res) => {
        const myBookings = await Booking.findAll({
            where: { guestId: req.user.id },
            include: { model: Listing } 
        });
        res.render("bookings/index.ejs", { myBookings });
    },

    // Handles the creation of a new booking with a date range
    createBooking: async (req, res) => {
        const { id: listingId } = req.params;
        const guestId = req.user.id;
        const { startDate, endDate } = req.body.booking;

        // Basic Validation: Ensure end date is after start date
        if (!startDate || !endDate || new Date(endDate) <= new Date(startDate)) {
            req.flash("error", "Invalid dates. Please ensure the end date is after the start date.");
            return res.redirect(`/listings/${listingId}`);
        }

        // Fetch the listing to get its price
        const listing = await Listing.findByPk(listingId);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect(`/listings`);
        }

        // Calculate the number of days and total price
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalPrice = diffDays * listing.price;

        // Check if user already has a booking that overlaps with the new booking dates
        const existingUserBooking = await Booking.findOne({
            where: {
                guestId: guestId,
                [Op.or]: [
                    { startDate: { [Op.between]: [startDate, endDate] } },
                    { endDate: { [Op.between]: [startDate, endDate] } },
                    { [Op.and]: [
                        { startDate: { [Op.lte]: startDate } },
                        { endDate: { [Op.gte]: endDate } }
                    ]}
                ]
            }
        });

        if (existingUserBooking) {
            req.flash("error", "You already have a booking during these dates.");
            return res.redirect(`/listings/${listingId}`);
        }

        // Advanced Validation: Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            where: {
                listingId: listingId,
                [Op.or]: [
                    { startDate: { [Op.between]: [startDate, endDate] } },
                    { endDate: { [Op.between]: [startDate, endDate] } },
                    { [Op.and]: [
                        { startDate: { [Op.lte]: startDate } },
                        { endDate: { [Op.gte]: endDate } }
                    ]}
                ]
            }
        });

        if (overlappingBooking) {
            req.flash("error", "Sorry, this property is already booked for the selected dates.");
            return res.redirect(`/listings/${listingId}`);
        }

        // If validation passes, create the new booking
        const newBooking = await Booking.create({
            listingId,
            guestId,
            startDate,
            endDate,
            totalPrice,
            status: 'pending' // Set status to pending upon creation
        });

        // Create a bill for the new booking
        console.log("Creating bill for guestId:", guestId); // Add this line
        await Bill.create({
            amount: totalPrice,
            bookingId: newBooking.id,
            userId: guestId, // Assuming userId is added to Bill model
            dueDate: endDate // Due date is the same as booking end date
        });

        req.flash("success", "Listing successfully booked and bill generated!");
        res.redirect(`/listings/${listingId}`);
    },

    showAllBookings: async (req, res) => {
        const allBookings = await Booking.findAll({
            include: [
                { model: Listing },
                { model: User, as: 'guest' }
            ]
        });
        res.render("bookings/all-bookings-owner.ejs", { allBookings });
    },

    showAllBookingsForOwner: async (req, res) => {
        const ownerId = req.user.id;

        // Find all listings owned by the current user
        const ownerListings = await Listing.findAll({
            where: { ownerId: ownerId },
            attributes: ['id']
        });

        const listingIds = ownerListings.map(listing => listing.id);

        // Find all bookings for those listings, including associated bills
        const allBookings = await Booking.findAll({
            where: {
                listingId: {
                    [Op.in]: listingIds
                }
            },
            include: [
                { model: Listing },
                { model: User, as: 'guest' },
                { model: Bill }
            ]
        });

        res.render("bookings/all-bookings.ejs", { allBookings });
    }
};

