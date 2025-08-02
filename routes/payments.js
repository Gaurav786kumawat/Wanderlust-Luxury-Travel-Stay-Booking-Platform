// routes/payments.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");


// Load environment keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


router.post("/create-order", isLoggedIn, async (req, res) => {
  const { amount, bookingId } = req.body;

  // console.log("🧾 Booking Amount from frontend (₹):", amount / 100);
  // console.log("💸 Razorpay Order Created with amount (paise):", amount);

  const options = {
    amount: amount, // 💥 This should already be in paise
    currency: "INR",
    receipt: `receipt_order_${bookingId}`,
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    await Booking.findByIdAndUpdate(bookingId, { razorpayOrderId: order.id });
    res.json(order);
  } catch (err) {
    console.log("❌ Razorpay order creation error:", err);
    res.status(500).json({ success: false, message: "Razorpay error" });
  }
});


router.post("/verify", isLoggedIn, async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, bookingId } = req.body;

  try {
    // Verify payment (optional: use crypto if signature provided)
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "paid",
      paymentDate: new Date(),
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Verification failed:", err);
    res.status(500).json({ success: false, message: "Verification error" });
  }
});


module.exports = router;
{{{{{{{}}}}}}}