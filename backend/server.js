const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { paymentRoutes } = require('./routes/ProductRoutes');
const authRoutes = require('./routes/authRoutes');
const artRoutes = require('./routes/artRoutes');
const commerceRoutes = require('./routes/commerceRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. MIDDLEWARES 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

// 2. STATIC FILES (Ensures images are visible if stored locally)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI, { family: 4 })
    .then(() => console.log("✅ ArtVista DB Connected!"))
    .catch(err => console.error("❌ DB ERROR:", err.message));

// 4. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);
app.use('/api/commerce', commerceRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send("🚀 ArtVista Backend Live!"));

// 5. SERVER START
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});