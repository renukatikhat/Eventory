
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const gifts = [
  // BIRTHDAY
  {
    name: "Luxury Birthday Party Hamper",
    price: 1499,
    category: "Birthday",
    categoryType: "Occasion",
    description: "A premium celebration hamper for memorable birthdays.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Birthday Celebration Cake",
    price: 899,
    category: "Birthday",
    categoryType: "Occasion",
    description: "A beautifully styled cake for birthday celebrations.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Birthday Party Decoration Set",
    price: 699,
    category: "Birthday",
    categoryType: "Occasion",
    description: "A festive decoration set for a special birthday.",
    image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Birthday Memory Scrapbook",
    price: 549,
    category: "Birthday",
    categoryType: "Occasion",
    description: "A keepsake for preserving beautiful memories.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"
  },

  // RAKSHA BANDHAN
  {
    name: "Designer Rakhi Collection",
    price: 349,
    category: "Raksha Bandhan",
    categoryType: "Festival",
    description: "A festive rakhi collection for your brother.",
    image: "https://images.unsplash.com/photo-1519659528534-7fd733a832a0?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sibling Celebration Hamper",
    price: 1099,
    category: "Raksha Bandhan",
    categoryType: "Festival",
    description: "A thoughtful hamper to celebrate sibling love.",
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Rakhi Sweet Box",
    price: 649,
    category: "Raksha Bandhan",
    categoryType: "Festival",
    description: "A festive sweet gift for your family.",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sibling Photo Keepsake",
    price: 499,
    category: "Raksha Bandhan",
    categoryType: "Festival",
    description: "A sentimental keepsake for special memories.",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80"
  },

  // EID
  {
    name: "Eid Festive Treat Hamper",
    price: 1299,
    category: "Eid",
    categoryType: "Festival",
    description: "A premium festive hamper for Eid gifting.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Eid Dessert Celebration Box",
    price: 749,
    category: "Eid",
    categoryType: "Festival",
    description: "A dessert-inspired gift for festive gatherings.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Eid Home Fragrance Gift",
    price: 899,
    category: "Eid",
    categoryType: "Festival",
    description: "A stylish fragrance gift for a welcoming home.",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Eid Elegant Gift Basket",
    price: 999,
    category: "Eid",
    categoryType: "Festival",
    description: "A thoughtfully arranged basket for loved ones.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
  },

  // GRADUATION
  {
    name: "Graduation Party Bundle",
    price: 899,
    category: "Graduation",
    categoryType: "Occasion",
    description: "A celebration bundle for a graduate's big day.",
    image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Graduate Inspiration Journal",
    price: 499,
    category: "Graduation",
    categoryType: "Occasion",
    description: "An inspiring journal for new goals and ambitions.",
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Graduation Celebration Flowers",
    price: 799,
    category: "Graduation",
    categoryType: "Occasion",
    description: "A floral surprise to celebrate academic success.",
    image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "New Chapter Gift Set",
    price: 1199,
    category: "Graduation",
    categoryType: "Occasion",
    description: "A thoughtful gift for the next stage of life.",
    image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=800&q=80"
  }
];

async function seedGifts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    let added = 0;
    let skipped = 0;

    for (const gift of gifts) {
      const existing = await Product.findOne({
        name: {
          $regex: "^" + gift.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          $options: "i"
        }
      });

      if (existing) {
        console.log("Skipped:", gift.name);
        skipped++;
        continue;
      }

      await Product.create(gift);
      console.log("Added:", gift.name);
      added++;
    }

    console.log(`\nSuccess! Added: ${added}; skipped: ${skipped}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedGifts();
