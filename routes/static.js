const express = require("express");
const router = express.Router();
const pages = require("../controllers/pages");
const { isLoggedIn, isAdmin } = require("../middleware");

// Static Pages
router.get("/privacy", pages.renderPrivacy);
router.get("/terms", pages.renderTerms);

// Contact Us
router.get("/contact", isLoggedIn, pages.renderContact);
router.post("/contact", isLoggedIn, pages.handleContactForm);



// Admin - View all contact messages
router.get("/admin/contacts", isLoggedIn, isAdmin, pages.viewContacts);


module.exports = router;
