const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn } = require('../middleware');
const Bill = require('../models/bill');
const Booking = require('../models/booking');
const Listing = require('../models/listing');

// Route to display bills for the current user
router.get('/billing', isLoggedIn, wrapAsync(async (req, res) => {
  console.log("Fetching bills for userId:", req.user.id);
  const bills = await Bill.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Booking,
      attributes: ['id', 'startDate', 'endDate'],
      include: [{
        model: Listing,
        attributes: ['title'] // Include only the title of the listing
      }]
    }],
    order: [['issueDate', 'DESC']],
  });
  res.render('bills/index', { bills });
}));

// Route to view a specific bill
router.get('/billing/:id', isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const bill = await Bill.findByPk(id, {
    include: [{
      model: Booking,
      attributes: ['id', 'startDate', 'endDate'],
      include: [{
        model: Listing,
        attributes: ['title'] // Include only the title of the listing
      }]
    }],
  });

  if (!bill) {
    req.flash('error', 'Bill not found!');
    return res.redirect('/billing');
  }

  // Ensure the user owns the bill (or is an admin)
  if (bill.userId !== req.user.id) { // Assuming a userId is added to the Bill model later
    req.flash('error', 'You are not authorized to view this bill.');
    return res.redirect('/billing');
  }

  res.render('bills/show', { bill });
}));

module.exports = router;