const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .jpg, .jpeg, .png formats allowed"));
  },
});

// @route POST /api/users/upload-profile
// @desc Upload user profile image
// @access Private
router.post("/upload-profile", auth, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.file.path.replace(/\\/g, "/") }, // normalize slashes for Windows
      { new: true }
    );

    res.json({ message: "Profile image uploaded", imagePath: user.profileImage, user });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// @route GET /api/users/me
// @desc Get current logged-in user's data
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Fetch user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports = router;
