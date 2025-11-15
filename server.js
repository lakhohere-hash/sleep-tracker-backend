const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://sleepuser:sleepapp123@cluster0.qyenjoe.mongodb.net/sleeptracker?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Cloud!'))
    .catch(err => console.log('❌ MongoDB error:', err.message));

// Models
const User = mongoose.model('User', {
    name: String,
    email: String,
    sleepHours: Number,
    createdAt: { type: Date, default: Date.now }
});

const Sound = mongoose.model('Sound', {
    name: String,
    category: String,
    duration: Number,
    createdAt: { type: Date, default: Date.now }
});

// APIs
app.get('/api/test', async (req, res) => {
    try {
        const testUser = new User({
            name: "Gregg Test",
            email: "gregg@test.com",
            sleepHours: 8.2
        });
        await testUser.save();
        res.json({
            success: true,
            message: "🎉 BACKEND IS LIVE ONLINE!",
            user: testUser,
            database: "MongoDB Cloud Connected",
            timestamp: new Date()
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ success: true, message: "User created successfully", user: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/sounds', async (req, res) => {
    try {
        const sounds = await Sound.find().sort({ name: 1 });
        res.json({ success: true, count: sounds.length, sounds: sounds });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/sounds', async (req, res) => {
    try {
        const sound = new Sound(req.body);
        await sound.save();
        res.json({ success: true, message: "Sound added successfully", sound: sound });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        message: "🚀 Sleep Tracker Backend - DEPLOYED ONLINE", 
        status: "LIVE & WORKING",
        database: "MongoDB Atlas Cloud",
        endpoints: [
            "GET /api/test - Test connection",
            "GET /api/users - Get users",
            "POST /api/users - Create user", 
            "GET /api/sounds - Get sounds",
            "POST /api/sounds - Create sound"
        ],
        instructions: "Malik can use these APIs in Flutter app from any city!"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
