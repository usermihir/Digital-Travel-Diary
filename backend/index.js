const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes); 

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const memoryRoutes = require("./routes/memoryRoutes");
app.use("/api/memories", memoryRoutes);

const tripRoutes = require("./routes/tripRoutes");
app.use("/api/trips", tripRoutes);


// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
