const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const artRoutes = require('./routes/artRoutes');
const commerceRoutes = require('./routes/commerceRoutes');

const app = express();

// 1. MIDDLEWARES
app.use(express.json());

// 2. SIMPLIFIED CORS (To stop the Network Error)
app.use(cors({
    origin: true, // Automatically allows whatever address the frontend is using
    credentials: true 
}));

// 3. STATIC FILES
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// 4. DATABASE
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sayaligaikwad838_db_user:JcVzNWNFqWBjW63I@cluster0.nloy2kl.mongodb.net/ArtGallery?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { family: 4 })
    .then(() => console.log("✅ ArtVista DB Connected!"))
    .catch(err => console.error("❌ DB ERROR:", err.message));

// 5. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);
app.use('/api/commerce', commerceRoutes);

app.get('/', (req, res) => res.send("🚀 ArtVista Backend Live!"));

// 6. SERVER
const PORT = 5001; // Hardcoded to 5001 to ensure consistency
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});