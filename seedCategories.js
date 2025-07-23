const mongoose = require('mongoose');
require('dotenv').config();
const db = require('./config/db');
const Category = require('./models/Category');

const images = {
  vegetables: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  fruits: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
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

const mainCategories = [
  {
    name: 'Vegetables',
    image: images.vegetables,
    subcategories: [
      { name: 'Carrot', image: images.Carrot },
      { name: 'Broccoli', image: images.Broccoli },
      { name: 'Spinach', image: images.Spinach },
      { name: 'Tomato', image: images.Tomato },
      { name: 'Potato', image: images.Potato },
      { name: 'Onion', image: images.Onion },
    ],
  },
  {
    name: 'Fruits',
    image: images.fruits,
    subcategories: [
      { name: 'Apple', image: images.Apple },
      { name: 'Banana', image: images.Banana },
      { name: 'Orange', image: images.Orange },
      { name: 'Grapes', image: images.Grapes },
      { name: 'Strawberry', image: images.Strawberry },
      { name: 'Blueberry', image: images.Blueberry },
      { name: 'Raspberry', image: images.Raspberry },
      { name: 'Mango', image: images.Mango },
    ],
  },
];

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

async function seed() {
  await db();

  for (const mainCat of mainCategories) {
    // Upsert main category
    let main = await Category.findOneAndUpdate(
      { slug: slugify(mainCat.name), parentCategory: null },
      { name: mainCat.name, slug: slugify(mainCat.name), image: mainCat.image, parentCategory: null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Upsert subcategories
    for (const sub of mainCat.subcategories) {
      await Category.findOneAndUpdate(
        { slug: slugify(sub.name), parentCategory: main._id },
        { name: sub.name, slug: slugify(sub.name), image: sub.image, parentCategory: main._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  console.log('Categories and subcategories upserted!');
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
}); 