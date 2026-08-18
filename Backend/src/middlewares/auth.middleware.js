const jwt = require('jsonwebtoken');
const Partner = require('../models/partnerSchema');

const isAuthorized = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
        const partner = await Partner.findById(decodedToken.id);
        if (!partner) {
            res.status(401).json({ message: "Unauthorized: Partner not found" });
            return;
        }
        req.partner = partner;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ message: "Error: user not authorized" });
    }
};

module.exports = isAuthorized;
