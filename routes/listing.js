const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing, isAdmin } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const pagesController = require("../controllers/pages.js");

const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.get("/admin-contacts", isLoggedIn, isAdmin, pagesController.viewContacts);

router.get("/search-suggestions",listingController.getSuggestions);


// ! INDEX & CREATE
router.route("/")
    .get(wrapAsync(listingController.index)) // GET /listings
    .post(isLoggedIn, validateListing, upload.array('listing[images]', 5), wrapAsync(listingController.createListing)); // POST /listings


// ! NEW
router.get("/new", isLoggedIn, listingController.renderNewForm); // GET /listings/new

// ! SHOW, UPDATE, DELETE
router.route("/:id")
    .get(wrapAsync(listingController.showListing)) // GET /listings/:id
.put(isLoggedIn, isOwner, upload.array('listing[images]', 5), validateListing, wrapAsync(listingController.updateListing)) // PUT /listings/:id
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); // DELETE /listings/:id

// ! EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm)); // GET /listings/:id/edit

module.exports = router;
