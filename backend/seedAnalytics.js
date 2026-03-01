const mongoose = require('mongoose');
const Payment = require('./models/payment'); 
const User = require('./models/User');

const seedData = async () => {
    try {
        // Replace with your MONGO_URI if different
        await mongoose.connect('mongodb://localhost:27017/artasystudio');
        console.log("🚀 Syncing ArtVista Intelligence Nodes...");

        // 1. Clean up old dummy data to avoid duplicates
        await Payment.deleteMany({ isDummy: true });

        // 2. Ensure a valid User exists to link the payments
        const admin = await User.findOneAndUpdate(
            { email: "admin@artvista.com" },
            { name: "Sayali Gaikwad", role: "admin" },
            { returnDocument: 'after', upsert: true }
        );

        const cities = [
            { name: "mumbai", state: "maharashtra" },
            { name: "pune", state: "maharashtra" },
            { name: "delhi", state: "delhi" },
            { name: "bangalore", state: "karnataka" },
            { name: "hyderabad", state: "telangana" },
            { name: "lucknow", state: "uttar pradesh" }
        ];

        // Categories for Data Mining distribution
        const cats = ["Sketching", "Oil Painting", "Digital Art", "Acrylic"];

        let dummyPayments = [];
        
        // Generating 150 nodes for a dense graph
        for (let i = 0; i < 150; i++) {
            const loc = cities[i % cities.length];
            const randomMonth = Math.floor(Math.random() * 12) + 1; // 1 to 12
            
            // 🔥 TREND BOOSTER: If month is February (2), significantly increase the price/volume
            let boost = (randomMonth === 2) ? (Math.random() * 8 + 5) : (Math.random() * 2 + 1);

            dummyPayments.push({
                userId: admin._id,
                name: `Client Node ${i + 1}`, // Required field
                email: `customer_${i}@artvista.io`, // Required field
                amount: Math.floor((Math.random() * 5000 + 2000) * boost) * 100, // Amount in paise
                status: 'captured',
                isDummy: true, // Tag to identify synthetic data
                createdAt: new Date(2026, randomMonth - 1, Math.floor(Math.random() * 28) + 1),
                razorpay_order_id: `ord_${Math.random().toString(36).substring(7)}`,
                razorpay_payment_id: `pay_${Math.random().toString(36).substring(7)}`,
                address: { 
                    street: `${i + 101} Innovation Square`, // Required field
                    city: loc.name, 
                    state: loc.state, 
                    pincode: "400001", 
                    phone: "9876543210" 
                }
            });
        }

        // 3. Insert into the main Payment collection
        await Payment.insertMany(dummyPayments);
        
        console.log("✅ Success: 150 Data Mining Nodes Seeded into 'payments'!");
        console.log("📈 February Trend Spike: ENABLED");
        
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
        process.exit(1);
    }
};

seedData();