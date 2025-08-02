const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");

module.exports.index = async (req, res, next) => {
  try {
    const { search } = req.query;
    let listings;
    let recommendations = [];

    if (search) {
      listings = await Listing.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } }
        ]
      });

      if (listings.length === 0) {
        recommendations = await Listing.aggregate([{ $sample: { size: 4 } }]);
      }
    } else {
      listings = await Listing.find({});
    }

    res.render("listings/index", {
      listings,
      searchQuery: search || "",
      resultCount: listings.length,
      recommendations
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const suggestions = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } }
    ]
  }).limit(5).select("title");

  res.json(suggestions);
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new", { listing: { images: [] } });

}


module.exports.createListing = async (req, res) => {
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Upload images
    newListing.images = req.files?.map(f => ({
      url: f.path,
      filename: f.filename
    })) || [];

    // Set thumbnail (user-selected or fallback to first image)
    if (req.body.thumbnail) {
      newListing.thumbnail = req.body.thumbnail;
    } else if (newListing.images.length > 0) {
      newListing.thumbnail = newListing.images[0].filename;
    }

    await newListing.save();
    req.flash("success", "Listing created successfully.");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while creating listing.");
    res.redirect("/listings/new");
  }
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    // 🔄 Update base listing fields
    Object.assign(listing, req.body.listing);

    // 🔼 Handle new image uploads
    const newImages = req.files?.map((f) => ({
      url: f.path,
      filename: f.filename,
    })) || [];

    listing.images.push(...newImages);

    // 🧽 Delete selected images
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        // Optional: delete from cloudinary if you use it
        // await cloudinary.uploader.destroy(filename);

        listing.images = listing.images.filter((img) => img.filename !== filename);
      }
    }

    // 🌟 Set thumbnail if manually selected
    if (req.body.thumbnail) {
      listing.thumbnail = req.body.thumbnail;
    } else if (listing.images.length > 0) {
      listing.thumbnail = listing.images[0].filename;
    } else {
      listing.thumbnail = null; // fallback if no images
    }

    await listing.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong during update.");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};


module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing.images.length > 0) {
    for (let img of listing.images) {
      await cloudinary.uploader.destroy(img.filename);
    }
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted.");
  res.redirect("/listings");
};
