const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://sleepuser:sleepapp123@cluster0.qyenjoe.mongodb.net/sleeptracker?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Cloud Connected!'))
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
    file: String,
    isPremium: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const SleepSession = mongoose.model('SleepSession', {
    userId: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    sleepStages: {
        light: Number,
        deep: Number,
        rem: Number,
        awake: Number
    },
    soundsDetected: [String],
    createdAt: { type: Date, default: Date.now }
});

// REAL APIs FOR FLUTTER APP

// 1. Test API
app.get('/api/test', async (req, res) => {
    try {
        const testUser = new User({
            name: "Gregg Client",
            email: "gregg@test.com",
            sleepHours: 7.5
        });
        await testUser.save();
        
        res.json({
            success: true,
            message: "🎉 SLEEP TRACKER BACKEND IS LIVE!",
            user: testUser,
            database: "MongoDB Cloud Connected",
            server: "Render.com",
            timestamp: new Date()
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// 2. User APIs
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
        res.json({ success: true, message: "User created", user: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Sound APIs
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
        res.json({ success: true, message: "Sound added", sound: sound });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Sleep Session APIs
app.get('/api/sleep-sessions', async (req, res) => {
    try {
        const sessions = await SleepSession.find().sort({ createdAt: -1 });
        res.json({ success: true, count: sessions.length, sessions: sessions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/sleep-sessions', async (req, res) => {
    try {
        const session = new SleepSession(req.body);
        await session.save();
        res.json({ success: true, message: "Sleep session saved", session: session });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Demo Data
app.get('/api/setup-demo', async (req, res) => {
    try {
        // Add demo user
        const user = new User({
            name: "Demo User",
            email: "demo@example.com",
            sleepHours: 8.2
        });
        await user.save();

        // Add demo sounds
        const sounds = [
            { name: "Rain Sounds", category: "Nature", duration: 3600 },
            { name: "White Noise", category: "Focus", duration: 1800 },
            { name: "Ocean Waves", category: "Nature", duration: 2700 },
            { name: "Thunderstorm", category: "Nature", duration: 2400 },
            { name: "Forest Birds", category: "Nature", duration: 3000 }
        ];
        
        for (let soundData of sounds) {
            const sound = new Sound(soundData);
            await sound.save();
        }

        // Add demo sleep session
        const session = new SleepSession({
            userId: user._id,
            startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
            endTime: new Date(),
            duration: 28800,
            sleepStages: { light: 14400, deep: 7200, rem: 7200, awake: 1800 },
            soundsDetected: ["Snoring", "Talking"]
        });
        await session.save();

        res.json({
            success: true,
            message: "🎉 DEMO DATA ADDED!",
            user: user,
            soundsCount: sounds.length,
            session: session
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Home route
app.get('/', (req, res) => {
    res.json({ 
        message: "🚀 Sleep Tracker Backend - LIVE & DEPLOYED", 
        status: "Online - Ready for Flutter App",
        database: "MongoDB Atlas Cloud",
        hosting: "Render.com",
        baseURL: "https://sleep-tracker-backend-0a9f.onrender.com",
        endpoints: [
            "GET /api/test - Test connection",
            "GET /api/users - Get all users",
            "POST /api/users - Create user", 
            "GET /api/sounds - Get all sounds",
            "POST /api/sounds - Create sound",
            "GET /api/sleep-sessions - Get sleep data",
            "POST /api/sleep-sessions - Save sleep session",
            "GET /api/setup-demo - Add demo data"
        ],
        instructions: "Malik - Use these APIs in your Flutter app!"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
