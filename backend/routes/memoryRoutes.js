const express = require("express");
const { cloudinary } = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Memory = require("../models/Memory");
const auth = require("../middleware/authMiddleware");


const router = express.Router();

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isAudio = file.mimetype.startsWith("audio/");
    return {
      folder: "travel_memories",
      resource_type: isAudio ? "video" : "image",
      allowed_formats: isAudio ? ["mp3", "wav", "webm"] : ["jpg", "png", "jpeg"],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// POST /api/memories — add memory
router.post(
  "/",
  auth,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, special, lat, lng } = req.body;
      console.log("Received memory data:", req.body);


      const newMemory = new Memory({
        title,
        description,
        special,
        location: {
           lat: parseFloat(lat),
           lng: parseFloat(lng),
        },
        imageUrls: req.files?.images?.map((f) => f.path) || [],
        audioUrl: req.files?.audio?.[0]?.path || "",
        user: req.user.id, // ✅ fixed
        tripId: req.body.tripId ? req.body.tripId.toString() : null
      });

      await newMemory.save();
      res.status(201).json(newMemory);
    } catch (err) {
      console.error("❌ Error saving memory:", err);
      res.status(500).json({ message: "Error saving memory", err });
    }
  }
);

// GET /api/memories/my — get user's memories
// GET /api/memories/my — get user's memories with trip info
router.get("/my", auth, async (req, res) => {
  try {
    const memories = await Memory.find({ user: req.user.id })
      .populate("tripId", "title description locations createdAt")
      .sort({ createdAt: -1 });

    res.json(memories);
  } catch (err) {
    console.error("❌ Error fetching user memories:", err);
    res.status(500).json({ message: "Error fetching user memories", err });
  }
});


router.get("/trip/:tripId", auth, async (req, res) => {
  try {
    const memories = await Memory.find({
      user: req.user.id,
      tripId: req.params.tripId,
    }).sort({ createdAt: -1 });
    
    res.json(memories);
  } catch (err) {
    console.error("❌ Error fetching trip-specific memories:", err);
    res.status(500).json({ message: "Error fetching trip memories", err });
  }
});

module.exports = router;
