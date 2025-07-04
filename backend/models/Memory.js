const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  title: String,
  description: String,
  special: String,
  audioUrl: { type: String },
  imageUrls: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  tripId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Trip",   // This links memory to a trip
  default: null,
  }, 
}, {
  timestamps: true,
});

module.exports = mongoose.model("Memory", memorySchema);
