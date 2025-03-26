const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const cartRoutes = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes")
const orderRoutes = require("./routes/orderRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const subscribeRoute = require("./routes/subscribeRoute")
const adminRoutes = require("./routes/admin/adminRoutes")
const adminProductRoutes = require("./routes/admin/adminProductRoutes")
const adminOderRoutes = require("./routes/admin/adminOrderRoutes")


const app = express();
app.use(express.json());
app.use(cors());  

// Load biến môi trường trước khi kết nối
dotenv.config();

const PORT = process.env.PORT || 3000;

// Kết nối đến MongoDB
connectDB();

app.get("/", (req, res) => {
  res.json({ message: "xin chao" });
});

// API Routes
app.use("/api/users", userRoutes)

app.use("/api/products", productRoutes)

app.use("/api/cart", cartRoutes)

app.use("/api/checkout", checkoutRoutes)

app.use("/api/orders", orderRoutes)

app.use("/api/upload", uploadRoutes)

app.use("/api", subscribeRoute)

// Admin
app.use("/api/admin/users", adminRoutes)

app.use("/api/admin/products", adminProductRoutes)

app.use("/api/admin/orders", adminOderRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});