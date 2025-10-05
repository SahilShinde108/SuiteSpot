// Import Sequelize models, including the new Booking model
const User = require('../models/user.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const Booking = require('../models/booking.js');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

// Searching Functionality
// Import Sequelize operators
const { Op } = require('sequelize');

module.exports = {
    index: async (req, res) => {
        const { startDate, endDate, city, festivalName } = req.query;
        let allListings;
        
        const whereClause = {
            status: 'approved'
        };

        if (city) {
            whereClause.location = { [Op.like]: `%${city}%` };
        }

        if (festivalName) {
            whereClause.festivalName = { [Op.like]: `%${festivalName}%` };
        }

        allListings = await Listing.findAll({
            where: whereClause
        });

        if (startDate && endDate) {
            const availableListings = [];
            for (const listing of allListings) {
                const overlappingBooking = await Booking.findOne({
                    where: {
                        listingId: listing.id,
                        status: 'confirmed',
                        [Op.or]: [
                            {
                                startDate: {
                                    [Op.between]: [startDate, endDate]
                                }
                            },
                            {
                                endDate: {
                                    [Op.between]: [startDate, endDate]
                                }
                            },
                            {
                                [Op.and]: [
                                    { startDate: { [Op.lte]: startDate } },
                                    { endDate: { [Op.gte]: endDate } }
                                ]
                            }
                        ]
                    }
                });

                if (!overlappingBooking) {
                    availableListings.push(listing);
                }
            }
            allListings = availableListings;
        }
            
        return res.render("listings/index.ejs", { allListings, query: req.query });
    },

    renderNewForm: (req, res) => {
        res.render("listings/new.ejs");
    },

    showListing: async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findByPk(id, {
            include: [
                { model: Review, include: { model: User, as: 'author' } },
                { model: User, as: 'owner' }
            ]
        });

        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }

        // If the user is not an admin and the listing is not approved, redirect them
        if (req.user && req.user.role !== 'admin' && listing.status !== 'approved') {
            req.flash("error", "You can only view approved listings.");
            return res.redirect("/listings");
        }

        // NEW: When finding the booking, also "include" the User model associated with it as the "guest"
        const currentBooking = await Booking.findOne({ 
            where: { 
                listingId: id,
                status: 'confirmed', // Only consider confirmed bookings
                endDate: { [Op.gte]: new Date() } // Only consider bookings that have not ended yet
            },
            include: { model: User, as: 'guest' } // This fetches the guest's details!
        });
        
        res.render("listings/show.ejs", { listing, currentBooking });
    },

// User Booking Restriction
    createListing: async (req, res, next) => {
        const geocodeResponse = await geoCodingClient.forwardGeocode({ query: req.body.listing.location, limit: 1 }).send();
        const newListingData = req.body.listing;
        newListingData.ownerId = req.user.id;
        newListingData.image = req.file.path;
        newListingData.geometry = geocodeResponse.body.features[0].geometry;
        const newListing = await Listing.create(newListingData);
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing.id}`);
    },

    renderEditForm: async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findByPk(id);
        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    },

    updateListing: async (req, res) => {
        let { id } = req.params;
        const updatedData = req.body.listing;
        const geocodeResponse = await geoCodingClient.forwardGeocode({ query: updatedData.location, limit: 1 }).send();
        updatedData.geometry = geocodeResponse.body.features[0].geometry;
        if (req.file) {
            updatedData.image = req.file.path;
        }
        await Listing.update(updatedData, { where: { id: id } });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    },

    destroyListing: async (req, res) => {
        let { id } = req.params;
        await Listing.destroy({ where: { id: id } });
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    },

    showMyListings: async (req, res) => {
        // Find all listings where the ownerId matches the logged-in user's ID
        const myListings = await Listing.findAll({
            where: { ownerId: req.user.id }
        });
        res.render("listings/my-listings.ejs", { myListings });
    },

    updateListingStatus: async (req, res) => {
        let { id } = req.params;
        let { status } = req.body;
        await Listing.update({ status: status }, { where: { id: id } });
        req.flash("success", "Listing Status Updated!");
        res.redirect(`/listings/${id}`);
    },

    adminDashboard: async (req, res) => {
        const pendingListings = await Listing.findAll({ where: { status: 'pending' } });
        const approvedListings = await Listing.findAll({ where: { status: 'approved' } });
        const rejectedListings = await Listing.findAll({ where: { status: 'rejected' } });
        res.render('listings/admin-dashboard.ejs', { pendingListings, approvedListings, rejectedListings });
    }
};