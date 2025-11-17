const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 Starting Sleep Tracker Backend with REAL MongoDB...');

// MongoDB Connection with YOUR REAL CREDENTIALS
const MONGODB_URI = 'mongodb+srv://sleepapp:SleepApp123@cluster0.qyenjoe.mongodb.net/sleep_tracker?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database: sleep_tracker');
})
.catch((error) => {
    console.log('❌ MongoDB Connection Failed:', error.message);
    console.log('💡 Please check:');
    console.log('   - MongoDB Atlas IP Whitelist (add 0.0.0.0/0)');
    console.log('   - Username/password correctness');
    console.log('   - Network connectivity');
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    subscription: { type: String, default: 'free' },
    loginMethod: { type: String, default: 'email' },
    sleepHours: Number,
    createdAt: { type: Date, default: Date.now }
});

// Sleep Session Schema
const sleepSessionSchema = new mongoose.Schema({
    userId: String,
    duration: Number,
    quality: Number,
    stages: {
        light: Number,
        deep: Number,
        rem: Number
    },
    soundsDetected: [String],
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Sound Schema
const soundSchema = new mongoose.Schema({
    name: String,
    category: String,
    filePath: String,
    isPremium: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const SleepSession = mongoose.model('SleepSession', sleepSessionSchema);
const Sound = mongoose.model('Sound', soundSchema);

// ==================== REAL DATA APIs ====================

// 1. Health Check
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED ✅' : 'DISCONNECTED ❌';
        
        res.json({
            server: "RUNNING 🚀",
            database: dbStatus,
            timestamp: new Date().toISOString(),
            message: "Backend with REAL MongoDB Connection"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Dashboard Statistics - REAL DATA
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const totalUsers = await User.countDocuments();
        const premiumUsers = await User.countDocuments({ subscription: 'premium' });
        const totalSleepSessions = await SleepSession.countDocuments();
        
        // Today's sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySleepSessions = await SleepSession.countDocuments({ 
            date: { $gte: today } 
        });

        res.json({
            totalUsers: totalUsers,
            activeSubscriptions: premiumUsers,
            totalSleepSessions: totalSleepSessions,
            todaySleepSessions: todaySleepSessions,
            premiumUsers: premiumUsers,
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Users API - REAL DATA
app.get('/api/users', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const users = await User.find().sort({ createdAt: -1 });
        
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            subscription: user.subscription,
            loginMethod: user.loginMethod,
            createdAt: user.createdAt.toISOString()
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Sleep Data API - REAL DATA
app.get('/api/sleep-data', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const sleepSessions = await SleepSession.find().sort({ date: -1 });
        
        const formattedSessions = sleepSessions.map(session => ({
            _id: session._id.toString(),
            userId: session.userId,
            duration: session.duration,
            quality: session.quality,
            stages: session.stages,
            soundsDetected: session.soundsDetected,
            date: session.date.toISOString()
        }));

        res.json(formattedSessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Sounds API - REAL DATA
app.get('/api/sounds', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const sounds = await Sound.find().sort({ name: 1 });
        
        const formattedSounds = sounds.map(sound => ({
            _id: sound._id.toString(),
            name: sound.name,
            category: sound.category,
            filePath: sound.filePath,
            isPremium: sound.isPremium
        }));

        res.json(formattedSounds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CREATE REAL DATA ====================

// Create User - REAL DATA
app.post('/api/users', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const { name, email, subscription, loginMethod } = req.body;
        
        const user = new User({
            name,
            email,
            subscription: subscription || 'free',
            loginMethod: loginMethod || 'email'
        });
        
        await user.save();
        
        res.json({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            subscription: user.subscription,
            loginMethod: user.loginMethod,
            createdAt: user.createdAt.toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Sleep Session - REAL DATA
app.post('/api/sleep-data', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const { userId, duration, quality, stages, soundsDetected } = req.body;
        
        const session = new SleepSession({
            userId,
            duration,
            quality,
            stages,
            soundsDetected: soundsDetected || []
        });
        
        await session.save();
        
        res.json({
            _id: session._id.toString(),
            userId: session.userId,
            duration: session.duration,
            quality: session.quality,
            stages: session.stages,
            soundsDetected: session.soundsDetected,
            date: session.date.toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Sound - REAL DATA
app.post('/api/sounds', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const { name, category, filePath, isPremium } = req.body;
        
        const sound = new Sound({
            name,
            category,
            filePath,
            isPremium: isPremium || false
        });
        
        await sound.save();
        
        res.json({
            _id: sound._id.toString(),
            name: sound.name,
            category: sound.category,
            filePath: sound.filePath,
            isPremium: sound.isPremium
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SETUP REAL DATA ====================

// Setup Initial Data
app.get('/api/setup-demo', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        // Clear existing data
        await User.deleteMany({});
        await SleepSession.deleteMany({});
        await Sound.deleteMany({});

        // Create real users
        const users = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                subscription: 'premium',
                loginMethod: 'google',
                sleepHours: 7.5
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                subscription: 'free',
                loginMethod: 'email',
                sleepHours: 6.8
            },
            {
                name: 'Mike Johnson',
                email: 'mike@example.com',
                subscription: 'premium',
                loginMethod: 'apple',
                sleepHours: 8.2
            }
        ];

        const createdUsers = [];
        for (let userData of users) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
        }

        // Create real sleep sessions
        const sleepSessions = [
            {
                userId: createdUsers[0]._id.toString(),
                duration: 7.5,
                quality: 85,
                stages: { light: 4.5, deep: 1.5, rem: 1.5 },
                soundsDetected: ['snoring', 'deep breathing']
            },
            {
                userId: createdUsers[1]._id.toString(),
                duration: 6.2,
                quality: 72,
                stages: { light: 3.8, deep: 1.2, rem: 1.2 },
                soundsDetected: ['coughing', 'talking']
            },
            {
                userId: createdUsers[2]._id.toString(),
                duration: 8.1,
                quality: 91,
                stages: { light: 4.8, deep: 2.1, rem: 1.2 },
                soundsDetected: ['light snoring']
            }
        ];

        const createdSessions = [];
        for (let sessionData of sleepSessions) {
            const session = new SleepSession(sessionData);
            await session.save();
            createdSessions.push(session);
        }

        // Create real sounds
        const sounds = [
            {
                name: 'Ocean Waves',
                category: 'Nature',
                filePath: '/sounds/ocean.wav',
                isPremium: false
            },
            {
                name: 'Rainforest',
                category: 'Nature',
                filePath: '/sounds/rainforest.wav',
                isPremium: true
            },
            {
                name: 'White Noise',
                category: 'Brainwaves',
                filePath: '/sounds/white-noise.wav',
                isPremium: false
            },
            {
                name: 'Thunderstorm',
                category: 'Nature',
                filePath: '/sounds/thunderstorm.wav',
                isPremium: true
            }
        ];

        const createdSounds = [];
        for (let soundData of sounds) {
            const sound = new Sound(soundData);
            await sound.save();
            createdSounds.push(sound);
        }

        res.json({
            message: 'Real data setup completed successfully!',
            users: createdUsers.length,
            sleepSessions: createdSessions.length,
            sounds: createdSounds.length,
            database: 'MongoDB Atlas',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== OTHER ENDPOINTS ====================

// Test endpoint
app.get('/api/test', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED ✅' : 'DISCONNECTED ❌';
        
        res.json({
            message: "🚀 Sleep Tracker Backend - REAL MONGODB",
            status: "Using REAL Database Data",
            database: dbStatus,
            timestamp: new Date().toISOString(),
            endpoints: [
                "GET /api/health - Health check",
                "GET /api/dashboard/stats - Real dashboard data", 
                "GET /api/users - Real users from MongoDB",
                "GET /api/sleep-data - Real sleep sessions",
                "GET /api/sounds - Real sounds library",
                "POST /api/users - Create real user",
                "POST /api/sleep-data - Create real sleep session",
                "POST /api/sounds - Create real sound"
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root API endpoint
app.get('/api', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
        message: 'Sleep Tracker API - REAL MONGODB',
        status: 'Using Real Database',
        database: dbStatus,
        note: 'All endpoints return REAL data from MongoDB',
        endpoints: [
            'GET /api/health - Health check',
            'GET /api/dashboard/stats - Dashboard statistics',
            'GET /api/users - Get all users (REAL DATA)', 
            'POST /api/users - Create user (REAL DATA)',
            'GET /api/sleep-data - Get sleep data (REAL DATA)',
            'POST /api/sleep-data - Create sleep session (REAL DATA)',
            'GET /api/sounds - Get sounds (REAL DATA)',
            'POST /api/sounds - Create sound (REAL DATA)',
            'GET /api/setup-demo - Setup real demo data'
        ]
    });
});

// Home route
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED ✅' : 'DISCONNECTED ❌';
    
    res.json({ 
        message: "🚀 Sleep Tracker Backend - REAL MONGODB", 
        status: "Using REAL Database Data",
        database: dbStatus,
        baseURL: "https://sleep-tracker-backend-0a9f.onrender.com",
        adminPanel: "Angular app with REAL data",
        flutterApp: "APIs with REAL data for Flutter",
        note: "NO SAMPLE DATA - Only REAL MongoDB data"
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 REAL DATA APIs ready at: https://sleep-tracker-backend-0a9f.onrender.com/api`);
    console.log(`🗄️  MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`💡 If MongoDB fails, check:`);
    console.log(`   - IP Whitelist in MongoDB Atlas`);
    console.log(`   - Username: sleepapp`);
    console.log(`   - Password: SleepApp123`);
});
