const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Partner = require('../models/partnerSchema');

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction
    };
};

// User Registration
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const ifUserAlreadyExists = await User.findOne({ email });
        if (ifUserAlreadyExists) {
            res.status(400).json({ message: "Error: user already exists" });
            return;
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashPassword
        });

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "1d" }
        );

        res.cookie("token", token, getCookieOptions());

        return res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Error: user not registered" });
    }
};

// User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "1d" }
        );
        res.cookie("token", token, getCookieOptions());
        res.status(201).json({
            message: "Login successful",
            _id: user._id,
            username: user.username
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// User Logout
const logoutUser = async (req, res) => {
    res.clearCookie("token", getCookieOptions());
    res.status(200).json({ message: "Logout successful" });
    return;
};

// Partner Registration
const registerPartner = async (req, res) => {
    try {
        const { name, ownerName, email, password, phone, address, city, cuisineType, licenseNumber } = req.body;

        const ifPartnerAlreadyExists = await Partner.findOne({ email });
        if (ifPartnerAlreadyExists) {
            res.status(400).json({ message: "Error: partner email already exists" });
            return;
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newPartner = await Partner.create({
            name,
            ownerName,
            email,
            password: hashPassword,
            phone,
            address,
            city,
            cuisineType,
            licenseNumber: licenseNumber || ""
        });

        const token = jwt.sign(
            { id: newPartner._id },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "1d" }
        );

        res.cookie("token", token, getCookieOptions());

        return res.status(201).json({
            _id: newPartner._id,
            name: newPartner.name,
            ownerName: newPartner.ownerName,
            email: newPartner.email,
            phone: newPartner.phone,
            address: newPartner.address,
            city: newPartner.city,
            cuisineType: newPartner.cuisineType,
            licenseNumber: newPartner.licenseNumber
        });
    } catch (error) {
        console.error("Register partner error:", error);
        res.status(500).json({ message: "Error: partner not registered" });
    }
};

// Partner Login
const loginPartner = async (req, res) => {
    try {
        const { email, password } = req.body;
        const partner = await Partner.findOne({ email });

        if (!partner) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, partner.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jwt.sign(
            { id: partner._id },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "1d" }
        );
        res.cookie("token", token, getCookieOptions());
        res.status(201).json({
            message: "Login successful",
            _id: partner._id,
            name: partner.name,
            email: partner.email
        });
    } catch (error) {
        console.error("Login partner error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Partner Logout
const logoutPartner = async (req, res) => {
    res.clearCookie("token", getCookieOptions());
    res.status(200).json({ message: "Logout successful" });
    return;
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerPartner,
    loginPartner,
    logoutPartner
};