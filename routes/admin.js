const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Contact = require("../models/contact"); // Assuming you have this model
const { isLoggedIn } = require("../middleware"); // Optional auth check

// ✅ Admin view: All Bookings
router.get("/bookings", async (req, res) => {
  const bookings = await Booking.find({})
    .populate("user")
    .populate("listing");
  res.render("listings/admin-bookings", { bookings });
});

// ✅ Admin view: All Contact Messages
router.get("/contacts", async (req, res) => {
  const contacts = await Contact.find({});
  res.render("listings/admin-contacts", { contacts });
});

module.exports = router;
    