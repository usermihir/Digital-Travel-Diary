const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  locations: [
    {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      name: String, // optional: can be auto-filled by reverse geocoding
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trip", tripSchema);
