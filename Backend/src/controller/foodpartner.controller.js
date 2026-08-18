const Partner = require('../models/partnerSchema');
const Food = require('../models/foodSchema');

async function getFoodpartner(req, res) {
    try {
        const partnerId = req.params.id;
        
        const partner = await Partner.findById(partnerId).select('-password');
        if (!partner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        const foods = await Food.find({ foodPartner: partnerId }).sort({ createdAt: -1 });

        res.status(200).json({
            ...partner.toObject(),
            partner,
            foods,
            totalMeals: foods.length
        });
    } catch (error) {
        console.error("Get food partner error:", error);
        res.status(500).json({ message: "Error fetching food partner: " + error.message });
    }
}   

module.exports = { getFoodpartner };
    