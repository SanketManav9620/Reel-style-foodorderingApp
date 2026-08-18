const Partner = require('../models/partnerSchema');
const Food = require('../models/foodSchema');
const { uploadToImageKit } = require('../services/storage.service');

// Add a new food item (partner only)
const addFood = async (req, res) => {
    try {
        const partnerId = req.partner?._id;
        const { name, description, price, videoUrl, imageUrl, category } = req.body;

        let finalVideoUrl = videoUrl || '';

        // If a video file is uploaded via Multer diskStorage
        if (req.file) {
            console.log(`🎥 Uploaded video file saved to disk: ${req.file.filename}`);
            finalVideoUrl = `/uploads/${req.file.filename}`;
        }

        if (!finalVideoUrl) {
            res.status(400).json({ message: "Video file or Video URL is required" });
            return;
        }

        const newFood = await Food.create({
            name,
            description,
            price: Number(price),
            videoUrl: finalVideoUrl,
            imageUrl: imageUrl || '',
            category: category || 'General',
            foodPartner: partnerId
        });

        // Populate partner details for immediate UI presentation
        const populatedFood = await Food.findById(newFood._id).populate(
            'foodPartner',
            'name ownerName email phone address city cuisineType'
        );

        res.status(201).json({
            message: "Food added successfully",
            food: populatedFood || newFood
        });
    } catch (error) {
        console.error("Add food error:", error);
        res.status(500).json({ message: "Error adding food item: " + error.message });
    }
};

// Get all food items with partner info (public)
const getAllFood = async (req, res) => {
    try {
        const foods = await Food.find()
            .populate('foodPartner', 'name ownerName email phone address city cuisineType')
            .sort({ createdAt: -1 });

        res.status(200).json({ foods });
    } catch (error) {
        console.error("Get all food error:", error);
        res.status(500).json({ message: "Error fetching food items" });
    }
};

// Get food items for the logged-in partner only
const getPartnerFood = async (req, res) => {
    try {
        const partnerId = req.partner?._id;
        const foods = await Food.find({ foodPartner: partnerId })
            .sort({ createdAt: -1 });

        res.status(200).json({ foods });
    } catch (error) {
        console.error("Get partner food error:", error);
        res.status(500).json({ message: "Error fetching partner food items" });
    }
};

// Get store profile and all food items by partnerId (public)
const getStoreByPartnerId = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const partner = await Partner.findById(partnerId).select('-password');
        if (!partner) {
            return res.status(404).json({ message: "Food Partner / Store not found" });
        }
        const foods = await Food.find({ foodPartner: partnerId }).sort({ createdAt: -1 });

        res.status(200).json({
            partner,
            foods,
            totalMeals: foods.length
        });
    } catch (error) {
        console.error("Get store by partnerId error:", error);
        res.status(500).json({ message: "Error fetching store profile: " + error.message });
    }
};

module.exports = { addFood, getAllFood, getPartnerFood, getStoreByPartnerId };

