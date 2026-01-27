const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const artRoutes = require('./routes/artRoutes');

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const MONGO_URI = "mongodb+srv://sayaligaikwad838_db_user:JcVzNWNFqWBjW63I@cluster0.nloy2kl.mongodb.net/ArtGallery?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { family: 4 })
.then(() => console.log("✅ ArtVista DB Connected!"))
.catch(err => console.log("❌ DB ERROR:", err.message));

// Link Routes
app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);

app.get('/', (req, res) => res.send("🚀 ArtVista Backend Live!"));

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));