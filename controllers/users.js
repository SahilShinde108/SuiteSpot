const User = require('../models/user.js');
const bcrypt = require('bcrypt');

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// Handle new user signup
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Securely hash the user's password before saving it
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Log the new user in automatically after they sign up
        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to SuiteSpot!");
            res.redirect("/listings");
        });

    } catch (e) {
        // Handle errors, like if a username is already taken
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// Handle user login
module.exports.login = (req, res) => {
    req.flash("success", "Welcome Back to SuiteSpot!");
    // Redirect user to the page they were trying to visit, or back to listings
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Handle user logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been successfully logged out!");
        res.redirect("/listings");
    });
};

module.exports.index = async (req, res) => {
    const allUsers = await User.findAll();
    res.render("users/index.ejs", { allUsers });
};

