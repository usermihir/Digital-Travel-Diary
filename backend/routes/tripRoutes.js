const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Memory = require("../models/Memory");
const auth = require("../middleware/authMiddleware");

// POST /api/trips - Create/save a new trip
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, locations } = req.body;

    if (
      !Array.isArray(locations) ||
      locations.some(
        (loc) => typeof loc.lat !== "number" || typeof loc.lng !== "number"
      )
    ) {
      return res.status(400).json({ msg: "Invalid or missing trip locations" });
    }

    const newTrip = new Trip({
      user: userId,
      title: title || "Untitled Trip",
      description: description || "",
      locations,
    });

    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (err) {
    console.error("❌ Error saving trip:", err);
    res.status(500).json({ msg: "Error saving trip", err });
  }
});

// GET /api/trips - Fetch all trips of the logged-in user (with memories)
router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();

    const tripsWithMemories = await Promise.all(
      trips.map(async (trip) => {
        const memories = await Memory.find({ tripId: trip._id }).sort({ createdAt: -1 });
        return { ...trip, memories };
      })
    );

    res.json(tripsWithMemories);
  } catch (err) {
    console.error("❌ Error fetching trips:", err);
    res.status(500).json({ msg: "Server error", err });
  }
});

// PUT /api/trips/:id - Update a trip's data (e.g. title, description, or locations)
router.put("/:id", auth, async (req, res) => {
  try {
    const tripId = req.params.id;
    const updateData = req.body;

    const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, {
      new: true,
    });

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(updatedTrip);
  } catch (err) {
    console.error("❌ Error updating trip:", err);
    res.status(500).json({ message: "Server error", err });
  }
});

module.exports = router;
