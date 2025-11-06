const Bill = require('../models/bill');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const User = require('../models/user'); // Import the User model
const PDFDocument = require('pdfkit');

module.exports.showBills = async (req, res) => {
    console.log("Fetching bills for userId:", req.user.id);
    const bills = await Bill.findAll({
        where: { userId: req.user.id },
        include: [{
            model: Booking,
            attributes: ['id', 'startDate', 'endDate'],
            include: [{
                model: Listing,
                attributes: ['title']
            }]
        }],
        order: [['issueDate', 'DESC']],
    });
    res.render('bills/index', { bills });
};

module.exports.showBill = async (req, res) => {
    const { id } = req.params;
    const bill = await Bill.findByPk(id, {
        include: [{
            model: Booking,
            attributes: ['id', 'startDate', 'endDate'],
            include: [{
                model: Listing,
                attributes: ['title']
            }]
        }],
    });

    if (!bill) {
        req.flash('error', 'Bill not found!');
        return res.redirect('/billing');
    }

    if (bill.userId !== req.user.id) {
        req.flash('error', 'You are not authorized to view this bill.');
        return res.redirect('/billing');
    }

    res.render('bills/show', { bill });
};

module.exports.generatePdfBill = async (req, res) => {
    const { id } = req.params;
    const bill = await Bill.findByPk(id, {
        include: [{
            model: Booking,
            attributes: ['id', 'startDate', 'endDate', 'totalPrice'],
            include: [{
                model: Listing,
                attributes: ['title', 'location']
            }]
        }, {
            model: User, // Include the User model
            attributes: ['username', 'email'] // Specify the attributes you want
        }],
    });

    if (!bill) {
        req.flash('error', 'Bill not found!');
        return res.redirect('/billing');
    }

    if (bill.userId !== req.user.id) {
        req.flash('error', 'You are not authorized to generate this bill.');
        return res.redirect('/billing');
    }

    const doc = new PDFDocument();
    const filename = 'bill-' + bill.id + '.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');

    doc.pipe(res);

    doc.fontSize(25).text('SuiteSpot Bill', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text(`Bill ID: ${bill.id}`);
    doc.text(`Issue Date: ${bill.issueDate.toLocaleDateString()}`);
    doc.text(`Due Date: ${bill.dueDate.toLocaleDateString()}`);
    doc.moveDown();

    // Add User Information
    doc.fontSize(18).text('Billed To:');
    doc.fontSize(14).text(`Username: ${bill.User.username}`);
    doc.text(`Email: ${bill.User.email}`);
    doc.moveDown();

    doc.fontSize(18).text('Booking Details:');
    doc.fontSize(14).text(`Listing: ${bill.Booking.Listing.title} (${bill.Booking.Listing.location})`);
    doc.text(`Booking ID: ${bill.Booking.id}`);
    doc.text(`Check-in: ${bill.Booking.startDate.toLocaleDateString()}`);
    doc.text(`Check-out: ${bill.Booking.endDate.toLocaleDateString()}`);
    doc.text(`Total Price: ${bill.Booking.totalPrice.toLocaleString("en-IN")} Rs`);
    doc.moveDown();

    doc.fontSize(18).text('Payment Summary:');
    doc.fontSize(14).text(`Amount: ${bill.amount.toLocaleString("en-IN")} Rs`);
    // doc.text(`Status: ${bill.status}`);
    doc.moveDown();

    doc.end();
};