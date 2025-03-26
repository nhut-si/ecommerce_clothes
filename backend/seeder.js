const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Cart = require("./models/Cart")
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");

dotenv.config();

// Connect to mongoose
mongoose.connect(process.env.MONGO_URL);

// Function to seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    // Create a default admin User
    const createdUser = await User.create({
      name: "YourSi Admin",
      email: "admin@example.com",
      password: "8di0ha66",
      role: "admin",
    });

    // Assign the default use ID to each product
    const userID = createdUser._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: userID };
    });

    // Insert the products into the database
    await Product.insertMany(sampleProducts);

    console.log("Data seeding completed successfully.");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};
 
seedData();