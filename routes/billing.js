const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn } = require('../middleware');
const billingController = require('../controllers/billing');

// Route to display bills for the current user
router.get('/billing', isLoggedIn, wrapAsync(billingController.showBills));

// Route to view a specific bill
router.get('/billing/:id', isLoggedIn, wrapAsync(billingController.showBill));

// Route to generate a PDF for a specific bill
router.get('/billing/:id/generate-pdf', isLoggedIn, wrapAsync(billingController.generatePdfBill));

module.exports = router;