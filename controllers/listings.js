// Import Sequelize models, including the new Booking model
const User = require('../models/user.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const Booking = require('../models/booking.js');
const Bill = require('../models/bill.js'); // Import the Bill model
const sequelize = require('sequelize');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

// Searching Functionality
// Import Sequelize operators
const { Op } = require('sequelize');

module.exports = {
    index: async (req, res) => {
        const { startDate, endDate, city, festivalName, nearestLocation } = req.query;
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

        if (nearestLocation) {
            whereClause[Op.or] = [
                { nearestLocation1: nearestLocation },
                { nearestLocation2: nearestLocation },
                { nearestLocation3: nearestLocation },
                { nearestLocation4: nearestLocation }
            ];
        }

        let orderClause = [];
        if (nearestLocation) {
            orderClause = [
                [sequelize.literal(`CASE
                    WHEN nearestLocation1 = '${nearestLocation}' THEN distance1
                    WHEN nearestLocation2 = '${nearestLocation}' THEN distance2
                    WHEN nearestLocation3 = '${nearestLocation}' THEN distance3
                    WHEN nearestLocation4 = '${nearestLocation}' THEN distance4
                    ELSE NULL
                END`), 'ASC']
            ];
        }

        allListings = await Listing.findAll({
            where: whereClause,
            order: orderClause
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
            
        const cities = [...new Set((await Listing.findAll({ attributes: ['location'], raw: true })).map(l => l.location.split(',')[0].trim()))];
        const festivals = [...new Set((await Listing.findAll({ attributes: ['festivalName'], raw: true })).map(l => l.festivalName))];
        
        const nearestLocations = [...new Set(
            (await Listing.findAll({ attributes: ['nearestLocation1', 'nearestLocation2', 'nearestLocation3', 'nearestLocation4'], raw: true }))
                .flatMap(l => [l.nearestLocation1, l.nearestLocation2, l.nearestLocation3, l.nearestLocation4])
                .filter(location => location && location.trim() !== '') // Filter out null, undefined, and empty strings
                .map(location => location.trim()) // Trim whitespace
        )];

        return res.render("listings/index.ejs", { allListings, query: req.query, cities, festivals, nearestLocations });
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
        const { searchOwner, searchCustomer, tab } = req.query;
        let allUsers = await User.findAll({
            include: [
                { model: Listing, as: 'Listings' }, // Include listings owned by the user
                { model: Booking, as: 'Bookings', include: [Listing, { model: User, as: 'guest' }] }, // Include bookings made by the user
                { model: Bill, as: 'Bills', include: [{ model: Booking, include: [Listing] }] }, // Include bills associated with the user
                { model: Review, as: 'Reviews' } // Include reviews written by the user
            ]
        });
        let allBookings = await Booking.findAll({
            include: [Listing, { model: User, as: 'guest' }]
        });
    
        let filteredOwners = allUsers.filter(user => user.role === 'owner');
        let filteredCustomers = allUsers.filter(user => user.role === 'customer');
    
        if (searchOwner && searchOwner.trim() !== '') {
            const searchTerm = searchOwner.toLowerCase();
            filteredOwners = filteredOwners.filter(owner =>
                owner.username.toLowerCase().includes(searchTerm) ||
                owner.email.toLowerCase().includes(searchTerm)
            );
        } else if (searchOwner === '') {
            filteredOwners = [];
        }
    
        if (searchCustomer && searchCustomer.trim() !== '') {
            const searchTerm = searchCustomer.toLowerCase();
            filteredCustomers = filteredCustomers.filter(customer =>
                customer.username.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm)
            );
        } else if (searchCustomer === '') {
            filteredCustomers = [];
        }
    
        const pendingListings = await Listing.findAll({ where: { status: 'pending' } });
        const approvedListings = await Listing.findAll({ where: { status: 'approved' } });
        const rejectedListings = await Listing.findAll({ where: { status: 'rejected' } });
    
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            if (tab === 'owners') {
                return res.json({ filteredOwners });
            } else if (tab === 'customers') {
                return res.json({ filteredCustomers });
            }
        }
    
        res.render("listings/admin-dashboard.ejs", {
            pendingListings,
            approvedListings,
            rejectedListings,
            filteredOwners,
            filteredCustomers,
            allBookings,
            query: req.query
        });
    }
};