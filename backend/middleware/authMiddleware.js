const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Sửa ở đây: Tìm user bằng ID từ decoded.user.id
      const user = await User.findById(decoded.user.id).select("-password");

      // Kiểm tra xem user có tồn tại không
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user; // Gán user đã tìm thấy vào req.user
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Middleware to check if the user is admin
const admin = (req, res, next) => {
  if(req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
}
module.exports = { protect, admin };
