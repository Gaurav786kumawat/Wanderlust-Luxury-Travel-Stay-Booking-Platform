const express = require("express");
const router = express.Router();
const bookings = require("../controllers/bookings");
const { isLoggedIn } = require("../middleware");
// const { renderThankYou } = require("../controllers/bookings");
const bookingsController = require("../controllers/bookings");
const { isAdmin } = require("../middleware");
const { adminAllBookings } = require("../controllers/bookings");
// const {downloadInvoice} = require("../controllers/bookings");


// route for admin -> GET /admin/bookings
router.get("/admin/bookings", isLoggedIn, isAdmin, adminAllBookings);

// route for new booking -> GET /bookings/:id/new
router.get("/:id/new", isLoggedIn, bookings.renderBookingForm);

// route for my bookings -> GET /bookings
router.get("/my", isLoggedIn, bookingsController.myBookings);

// route for create booking -> POST /bookings/:id
router.post("/:id", isLoggedIn, bookings.createBooking);

// route for confirm booking -> GET /bookings/:bookingId/confirm 
router.get("/:bookingId/confirm", isLoggedIn, bookings.renderConfirmation);

// route for thank you -> GET /bookings/:bookingId/thankyou
router.get("/:bookingId/thankyou", isLoggedIn, bookings.renderThankYou);

// route for download invoice -> GET /bookings/:bookingId/invoice
router.get("/:bookingId/invoice", isLoggedIn, bookings.downloadInvoice);

// route New View Details Route
router.get("/:bookingId/details", isLoggedIn, bookings.renderDetailsPage);

module.exports = router;





