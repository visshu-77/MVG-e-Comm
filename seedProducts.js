const mongoose = require('mongoose');
require('dotenv').config();
const db = require('./config/db');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Seller = require('./models/Seller');

const images = {
  Carrot: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
  Broccoli: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
  Spinach: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  Tomato: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=400&q=80',
  Potato: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  Onion: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  Apple: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
  Banana: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8e9?auto=format&fit=crop&w=400&q=80',
  Orange: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
  Grapes: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  Strawberry: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  Blueberry: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c5c?auto=format&fit=crop&w=400&q=80',
  Raspberry: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  Mango: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
};

async function seedProducts() {
  await db();
  const seller = await Seller.findOne();
  if (!seller) {
    console.error('No seller found. Please create a seller first.');
    process.exit(1);
  }

  const mainCats = await Category.find({ parentCategory: null });
  for (const mainCat of mainCats) {
    const subCats = await Category.find({ parentCategory: mainCat._id });
    for (const sub of subCats) {
      const productData = {
        name: `${sub.name} Sample Product`,
        description: `Fresh and delicious ${sub.name.toLowerCase()} from our store.`,
        price: Math.floor(Math.random() * 100) + 10,
        images: [{ url: images[sub.name] || images['Carrot'], alt: sub.name, isPrimary: true }],
        category: mainCat._id,
        subCategory: sub._id,
        brand: `${sub.name} Brand`,
        seller: seller._id,
        sku: `${sub.name.toUpperCase()}-SKU-001`,
        stock: Math.floor(Math.random() * 100) + 1,
      };
      await Product.findOneAndUpdate(
        { name: productData.name, category: mainCat._id, subCategory: sub._id },
        productData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
  console.log('Sample products seeded!');
  mongoose.connection.close();
}

seedProducts().catch((err) => {
  console.error(err);
  mongoose.connection.close();
}); 