const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const artRoutes = require('./routes/artRoutes');

const app = express();

// 1. Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// 2. Setup Uploads Folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// 3. MongoDB Connection with "Family 4" Fix
const MONGO_URI = "mongodb+srv://sayaligaikwad838_db_user:JcVzNWNFqWBjW63I@cluster0.nloy2kl.mongodb.net/ArtGallery?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { 
    family: 4 // Forces IPv4 to fix connection issues on Mac/Node v25+
})
.then(() => console.log("✅ ArtVista DB Connected Successfully!"))
.catch(err => {
    console.log("❌ DB CONNECTION ERROR:");
    console.log(err.message);
});

// 4. Link Routes
app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);

// 5. Success Check Route
app.get('/', (req, res) => res.send("🚀 ArtVista Backend is Live and Connected!"));

// 6. Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));