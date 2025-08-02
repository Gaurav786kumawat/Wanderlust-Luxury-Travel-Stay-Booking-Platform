const Contact = require("../models/contact");
const nodemailer = require("nodemailer");

module.exports.renderPrivacy = (req, res) => {
    res.render("listings/privacy", { currUser: req.user });
};

module.exports.renderTerms = (req, res) => {
    res.render("listings/terms", { currUser: req.user });
};

module.exports.renderContact = (req, res) => {
    res.render("listings/contact", { currUser: req.user });
};



module.exports.handleContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // 1. DB me Save
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();

        // 2. Email Setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // 3. Email Content
        const mailOptions = {
            from: `"Wanderlust Contact" <${process.env.EMAIL_USERNAME}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `📩 New Contact Message: ${subject}`,
            html: `
                <h2>New Contact Message Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        // 4. Send Email
        await transporter.sendMail(mailOptions);

        req.flash("success", "Your message has been sent successfully.");
        res.redirect("/contact");
    } catch (err) {
        console.error("Error in contact form:", err);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/contact");
    }
};


module.exports.viewContacts = async (req, res) => {
  const perPage = 10;
  const page = parseInt(req.query.page) || 1;

  const totalContacts = await Contact.countDocuments({});
  const contacts = await Contact.find({})
    .sort({ createdAt: -1 })
    .skip((perPage * (page - 1)))
    .limit(perPage);

  res.render("listings/admin-contacts", {
    contacts,
    currUser: req.user,
    currentPage: page,
    totalPages: Math.ceil(totalContacts / perPage)
  });
};


