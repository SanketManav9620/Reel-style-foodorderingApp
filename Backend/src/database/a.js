const mongoose = require('mongoose');

async function seedInitialData() {
  try {
    const Partner = require('../models/partnerSchema');
    const Food = require('../models/foodSchema');

    // Remove legacy incorrect dummy food entries where video1 was named burger or video2 pizza
    await Food.deleteMany({ videoUrl: { $in: ['/videos/video1.mp4', '/videos/video2.mp4', '/videos/video3.mp4', '/videos/video4.mp4'] } });

    console.log('🌱 Seeding accurate food partners & reels into MongoDB...');

    // Seed partners with correct store info
    let partner1 = await Partner.findOne({ name: 'Royal Biryani House' });
    if (!partner1) {
      partner1 = await Partner.create({
        name: 'Royal Biryani House',
        ownerName: 'Chef Zaheer',
        email: 'royalbiryani@foodreel.com',
        password: 'password123',
        phone: '+91 98765 43210',
        address: '42 Royal Palace Road, Koramangala',
        city: 'Bangalore',
        cuisineType: 'Hyderabadi Biryani'
      });
    }

    let partner2 = await Partner.findOne({ name: 'The Biryani Express' });
    if (!partner2) {
      partner2 = await Partner.create({
        name: 'The Biryani Express',
        ownerName: 'Chef Tariq',
        email: 'biryaniexpress@foodreel.com',
        password: 'password123',
        phone: '+91 87654 32100',
        address: '18 Grand Avenue, Indiranagar',
        city: 'Bangalore',
        cuisineType: 'Mughlai & Biryani'
      });
    }

    let partner3 = await Partner.findOne({ name: 'Burger Palace' });
    if (!partner3) {
      partner3 = await Partner.create({
        name: 'Burger Palace',
        ownerName: 'Chef Marco',
        email: 'burgerpalace@foodreel.com',
        password: 'password123',
        phone: '+91 76543 21000',
        address: '7 Flame Lane, HSR Layout',
        city: 'Bangalore',
        cuisineType: 'American Grill'
      });
    }

    let partner4 = await Partner.findOne({ name: 'The Liquid Lounge' });
    if (!partner4) {
      partner4 = await Partner.create({
        name: 'The Liquid Lounge',
        ownerName: 'Mixologist Riya',
        email: 'liquidlounge@foodreel.com',
        password: 'password123',
        phone: '+91 65432 10000',
        address: '99 Chill Drive, Whitefield',
        city: 'Bangalore',
        cuisineType: 'Beverages & Cocktails'
      });
    }

    // Seed food items with accurate video content mapping
    await Food.create([
      {
        name: 'Hyderabadi Dum Biryani',
        description: 'Fragrant basmati rice cooked with rich aromatic spices, tender meat, saffron, and fresh herbs.',
        price: 349,
        videoUrl: '/videos/video1.mp4',
        category: 'Biryani',
        foodPartner: partner1._id,
        likesCount: 0,
        savesCount: 0
      },
      {
        name: 'Special Dum Biryani Plate',
        description: 'Slow-cooked authentic handi biryani served piping hot with raita and spicy salan.',
        price: 399,
        videoUrl: '/videos/video2.mp4',
        category: 'Biryani',
        foodPartner: partner2._id,
        likesCount: 0,
        savesCount: 0
      },
      {
        name: 'Sizzling Double Cheese Burger',
        description: 'Juicy flame-grilled gourmet burger loaded with melted cheddar, fresh lettuce, pickles, and secret sauce.',
        price: 299,
        videoUrl: '/videos/video3.mp4',
        category: 'Burgers',
        foodPartner: partner3._id,
        likesCount: 0,
        savesCount: 0
      },
      {
        name: 'Artisanal Berry Mocktail',
        description: 'Refreshing handcrafted summer drink infused with wild berries, floral lavender, citrus, and sparkling soda.',
        price: 249,
        videoUrl: '/videos/video4.mp4',
        category: 'Beverages',
        foodPartner: partner4._id,
        likesCount: 0,
        savesCount: 0
      }
    ]);

    console.log('✅ Accurate food partners & reels seeded successfully into MongoDB!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

function dbconnect() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reel';

  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ WARNING: MONGODB_URI environment variable is NOT set. Falling back to local mongodb://127.0.0.1:27017/reel.');
    console.warn('👉 If deployed on Render/Cloud, add MONGODB_URI (e.g. MongoDB Atlas connection string) to your Render Environment Variables!');
  }

  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log(`✅ MongoDB connected successfully to: ${mongoURI}`);
      seedInitialData();
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      if (!process.env.MONGODB_URI) {
        console.error('💡 TIP: Set MONGODB_URI in your production environment (Render dashboard -> Environment -> Add Environment Variable MONGODB_URI).');
      }
    });
}

module.exports = dbconnect;
