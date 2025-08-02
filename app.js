if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// ! File: app.js
// This is the main entry point of the application.
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session'); // Import the express-session package
const flash = require('connect-flash'); // Import the connect-flash package

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require('./routes/listing.js'); // Import the listings routes
const reviewRouter = require('./routes/review.js'); // Import the reviews routes
const userRouter = require('./routes/user.js'); // Import the users routes

const staticRoutes = require('./routes/static.js');
const pageRoutes = require("./routes/pages.js");
const bookingRoutes = require("./routes/bookings"); // Import the bookings routes
const paymentRoutes = require("./routes/payments"); // Import the payments routes

const adminRoutes = require("./routes/admin"); // import route
const userRoutes = require("./routes/user");









/*
// ! MongoDB connection URL
// ? This URL is used to connect to the MongoDB database
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected to DB.");
}).catch((err) => {
    console.log("Error in connecting DB.", err);
});

// ! Connect to MongoDB
// ? This function connects to the MongoDB database using mongoose
async function main() {
    await mongoose.connect(MONGO_URL);
}
    // yeh code open krna niche wala htakr normal ke liye ok ?
*/

// ! MongoDB connection URL
// ? This URL is used to connect to the MongoDB database
// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
        console.log("❌ Error in connecting DB:", err);
    });


// ! Middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // for PUT and 
// Set up EJS as the template engine'
app.engine('ejs', ejsMate);

// ! Session setup
// ? This object contains the options for the express-session middleware
const sessionOptions = {
    secret: "thisshouldbeabettersecret", // dangerous secret
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
        // Why use httpOnly
        // ANswer -> This is to prevent the cookie from being accessed by JavaScript on the client-side.
        // cross site scripting -> XSS attack 
    }
}

app.get("/", (req, res) => {
    // res.send("Root is working.");
    res.redirect("/listings");
    // res.render("./home.ejs");
});

// ! Session setup
app.use(session(sessionOptions));
app.use(flash());

// ! Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ! Flash setup
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.adminEmail = process.env.ADMIN_EMAIL;
    next();
});

// ! Register a demo user - just for testing
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User ({
//         email : "student@gmail.com",
//         username : "student"
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// ! Use the listings routes
app.use("/listings", listingRouter); // Use the listings routes defined in the listings.js file
// ! Use the reviews routes
app.use("/listings/:id/reviews", reviewRouter); // Use the reviews routes defined in the review.js file
// ! Use the users routes
app.use("/", userRouter);
// ! Use the static routes
app.use(staticRoutes); // ✅ No prefix
// ! Use the page routes
app.use("/", pageRoutes); // Mounts all static routes
// ! Use the booking routes
app.use("/bookings", bookingRoutes);
// ! Use the payment routes
app.use("/payments", paymentRoutes);
// ! Use the admin routes
app.use("/admin", adminRoutes); // 🔥 now /admin/bookings and /admin/contacts will work
// ! Use the user routes
app.use("/users", userRoutes);


// ! Error Handling
app.use((req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

// Global error handler
app.use((err, req, res, next) => {
    // console.log(err);
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong.";
    res.render("error.ejs", { err }); // Render an error page with the error object
    // Alternatively, you can send a JSON response
    // res.status(statusCode).send(err.message);
});


// ? app.listen is used to start the server.
// ! it takes two arguments : port number and a callback function.
// ! the callback function is called when the server is running.
app.listen(3000, () => {
    console.log("Server is running on port 3000 ✈️");
});


// ! You can change the port number to any other port number if you want.
// ! Make sure to change the port number in the .env file as well if you are using one.
// ! You can also use nodemon to automatically restart the server when you make changes to the code.

