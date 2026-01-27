const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const artRoutes = require('./routes/artRoutes');

const app = express();

app.use(express.json());

// ✅ Allow local and future production frontend
const allowedOrigins = ['http://localhost:3000', 'https://artasystudio-frontend.onrender.com'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true 
}));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sayaligaikwad838_db_user:JcVzNWNFqWBjW63I@cluster0.nloy2kl.mongodb.net/ArtGallery?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { family: 4 })
.then(() => console.log("✅ ArtVista DB Connected!"))
.catch(err => console.log("❌ DB ERROR:", err.message));

app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);

app.get('/', (req, res) => res.send("🚀 ArtVista Backend Live!"));

// ✅ FIXED: Using 0.0.0.0 for external binding
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});