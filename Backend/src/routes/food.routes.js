const express = require('express');
const router = express.Router();
const isAuthorized = require('../middlewares/auth.middleware');
const foodcontroller = require('../controller/food.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../Frontend/public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage streams uploaded video files directly to disk (uses 0MB Node V8 RAM heap)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const cleanName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        cb(null, cleanName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 80 // 80MB max file size limit
    }
});

// Middleware to handle Multer upload errors gracefully
const handleVideoUpload = (req, res, next) => {
    upload.single('video')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("❌ Multer upload error:", err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Video file is too large (maximum size limit is 80MB)' });
            }
            return res.status(400).json({ message: `Video upload error: ${err.message}` });
        } else if (err) {
            console.error("❌ File upload error:", err);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        }
        next();
    });
};

// Public - get all food items with partner info
router.get('/all', foodcontroller.getAllFood);

// Public - get store profile and all food items by partnerId
router.get('/partner/:partnerId', foodcontroller.getStoreByPartnerId);

// Partner only - get their own food items
router.get('/my-items', isAuthorized, foodcontroller.getPartnerFood);

// Partner only - add a food item
router.post('/add', isAuthorized, handleVideoUpload, foodcontroller.addFood);

module.exports = router;