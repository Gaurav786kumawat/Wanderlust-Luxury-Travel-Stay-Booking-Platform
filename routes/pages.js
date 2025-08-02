const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pages.js");

// Static Page Routes
router.get("/privacy", pageController.renderPrivacy);
router.get("/terms", pageController.renderTerms);

// Contact Us
router.get("/contact", pageController.renderContact);
router.post("/contact", pageController.handleContactForm);

module.exports = router;
