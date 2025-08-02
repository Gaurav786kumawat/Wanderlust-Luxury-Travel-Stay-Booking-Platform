const Razorpay = require("razorpay");
const Booking = require("../models/booking");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.createOrder = async (req, res) => {
  const { amount } = req.body;
    console.log("🚀 Final Amount received:", amount);  // <- This should be in ₹

  const options = {
    amount: amount,
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
    payment_capture: 1, // auto capture the payment ? -> 1 = yes , How ? -> Razorpay will automatically capture the payment when the order is created
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err.message);
    res.status(500).send("Error creating Razorpay order");
  }
};


// controllers/payments.js

module.exports.verifyAndMarkPaid = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update booking with payment details
    booking.paymentStatus = "paid";
    booking.paymentDate = new Date();
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;

    await booking.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Payment verification error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
