const Listing = require("../models/listing");
const Booking = require("../models/booking");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports.downloadInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/listings");
    }

    // Format Dates
    const checkin = new Date(booking.checkin).toDateString();
    const checkout = new Date(booking.checkout).toDateString();

    // PDF Setup
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for browser download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${booking._id}.pdf`);

    // Pipe to browser
    doc.pipe(res);

    // ----------- HEADER ------------
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#222")
      .text("Wanderlust Booking Invoice", { align: "center" });

    doc.moveDown(1);

    // ----------- BOOKING DETAILS ------------
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#333")
      .text("Booking Details", { underline: true });

    doc.moveDown(0.5);
    doc
      .fontSize(13)
      .font("Helvetica")
      .fillColor("black")
      .text(`Booking ID: ${booking._id}`)
      .text(`User: ${booking.user.username}`)
      .text(`Email: ${booking.user.email}`)
      .text(`Listing: ${booking.listing.title}`)
      .text(`Location: ${booking.listing.location}`)
      .text(`Check-in: ${checkin}`)
      .text(`Check-out: ${checkout}`)
      .text(`Guests: ${booking.guests}`)
      .text(`Total Payment: Rs ${booking.totalPrice}`)
      .text(`Payment Status: ${booking.paymentStatus}`);

    doc.moveDown(1);

    // ----------- FOOTER THANK YOU ------------
    doc
      .moveDown(2)
      .fontSize(12)
      .fillColor("gray")
      .font("Helvetica-Oblique")
      .text("Thank you for booking with Wanderlust", {
        align: "center",
      });

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("Invoice generation failed:", err);
    req.flash("error", "Something went wrong while generating the invoice.");
    res.redirect("/listings");
  }
};




// Render the booking form
module.exports.renderBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("bookings/booking", { listing });
};

// Create booking and redirect to confirmation
module.exports.createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkin, checkout, guests } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    // ✅ Convert dates
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const today = new Date();

    // ✅ BASIC DATE VALIDATIONS
    if (checkinDate < today.setHours(0, 0, 0, 0)) {
      req.flash("error", "Check-in date cannot be in the past.");
      return res.redirect(`/bookings/${listing._id}/new`);
    }

    if (checkoutDate <= checkinDate) {
      req.flash("error", "Checkout date must be after check-in date.");
      return res.redirect(`/bookings/${listing._id}/new`);
    }

    // ✅ Guest validation
    if (!guests || isNaN(guests) || guests <= 0 || guests > 20) {
      req.flash("error", "Guests must be between 1 and 20.");
      return res.redirect(`/bookings/${listing._id}/new`);
    }

    // ✅ Conflict check
    const existingBooking = await Booking.findOne({
      listing: listing._id,
      $or: [
        {
          checkin: { $lte: checkoutDate },
          checkout: { $gte: checkinDate }
        }
      ]
    });

    if (existingBooking) {
      req.flash("error", "This listing is already booked for the selected dates.");
      return res.redirect(`/bookings/${listing._id}/new`);
    }

    // ✅ Create booking
    const booking = new Booking({
      listing: listing._id,
      user: req.user._id,
      checkin: checkinDate,
      checkout: checkoutDate,
      guests,
      totalPrice: listing.price
    });

    await booking.save();
    res.redirect(`/bookings/${booking._id}/confirm`);

  } catch (err) {
    console.error("Booking error:", err);
    req.flash("error", "Booking failed. Please try again.");
    res.redirect(`/listings/${req.params.id}`);
  }
};




// Render booking confirmation page
module.exports.renderConfirmation = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("listing")
    .populate("user");

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/listings");
  }
  // console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);


  res.render("bookings/confirm", { booking, razorpayKey: process.env.RAZORPAY_KEY_ID });
};





// Render thank you page
module.exports.renderThankYou = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/listings");
    }

    res.render("bookings/thankyou", { booking });
  } catch (err) {
    console.error("Thank You Page Error:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings");
  }
};


// Render my bookings
module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/myBookings", { bookings });
};

module.exports.adminAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .sort({ createdAt: -1, _id: -1 }) // 🔥 Fallback + correct order
      .populate("listing")
      .populate("user");

    // Debugging
    // console.log("Sorted bookings ↓↓↓");
    // bookings.forEach((b, i) => {
    //   console.log(`${i + 1}: ${b.listing.title} — ${b.createdAt}`);
    // });

    res.render("listings/admin-bookings", { bookings });
  } catch (err) {
    console.error("❌ Admin bookings error:", err);
    req.flash("error", "Could not load bookings");
    res.redirect("/listings");
  }
};



module.exports.renderDetailsPage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/bookings/my");
    }

    // Prevent unauthorized access
    if (!booking.user._id.equals(req.user._id) && req.user.email !== "gaurav822kumawat@gmail.com") {
      req.flash("error", "Unauthorized access");
      return res.redirect("/bookings/my");
    }

    res.render("bookings/details", { booking });
  } catch (err) {
    console.error("Error rendering booking details:", err);
    req.flash("error", "Failed to load booking details");
    res.redirect("/bookings/my");
  }
};

// Pagination of my bookings page

module.exports.myBookings = async (req, res) => {
  try {
    const perPage = 3;
    const page = parseInt(req.query.page) || 1;

    const totalBookings = await Booking.countDocuments({ user: req.user._id });
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalPages = Math.ceil(totalBookings / perPage);

    res.render("bookings/myBookings", {
      bookings,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error("❌ Error loading bookings:", err);
    req.flash("error", "Unable to load bookings.");
    res.redirect("/listings");
  }
};
