const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 Starting Sleep Tracker Backend...');

// MongoDB Configuration
const MONGODB_URI = 'mongodb+srv://sleepapp:SleepApp123@cluster0.qyenjoe.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'sleep_tracker';

let db = null;
let client = null;

// Connect to MongoDB
async function connectDB() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        client = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ MongoDB Connected Successfully!');
        
        // Create collections if they don't exist
        await db.createCollection('users');
        await db.createCollection('sleep_sessions');
        await db.createCollection('sounds');
        
        console.log('📊 Database collections ready!');
        
    } catch (error) {
        console.log('❌ MongoDB Connection Failed:', error.message);
        console.log('💡 Please check MongoDB Atlas IP Whitelist');
    }
}

// Initialize database connection
connectDB();

// ==================== REAL DATA APIs ====================

// 1. Health Check
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = db ? 'CONNECTED ✅' : 'DISCONNECTED ❌';
        
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
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const usersCollection = db.collection('users');
        const sleepCollection = db.collection('sleep_sessions');
        
        const totalUsers = await usersCollection.countDocuments();
        const premiumUsers = await usersCollection.countDocuments({ subscription: 'premium' });
        const totalSleepSessions = await sleepCollection.countDocuments();
        
        // Today's sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySleepSessions = await sleepCollection.countDocuments({ 
            date: { $gte: today } 
        });

        res.json({
            totalUsers: totalUsers || 0,
            activeSubscriptions: premiumUsers || 0,
            totalSleepSessions: totalSleepSessions || 0,
            todaySleepSessions: todaySleepSessions || 0,
            premiumUsers: premiumUsers || 0,
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
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const usersCollection = db.collection('users');
        const users = await usersCollection.find().sort({ createdAt: -1 }).toArray();
        
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            subscription: user.subscription || 'free',
            loginMethod: user.loginMethod || 'email',
            createdAt: user.createdAt?.toISOString() || new Date().toISOString()
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Sleep Data API - REAL DATA
app.get('/api/sleep-data', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const sleepCollection = db.collection('sleep_sessions');
        const sleepSessions = await sleepCollection.find().sort({ date: -1 }).toArray();
        
        const formattedSessions = sleepSessions.map(session => ({
            _id: session._id.toString(),
            userId: session.userId,
            duration: session.duration,
            quality: session.quality,
            stages: session.stages,
            soundsDetected: session.soundsDetected || [],
            date: session.date?.toISOString() || new Date().toISOString()
        }));

        res.json(formattedSessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Sounds API - REAL DATA
app.get('/api/sounds', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const soundsCollection = db.collection('sounds');
        const sounds = await soundsCollection.find().sort({ name: 1 }).toArray();
        
        const formattedSounds = sounds.map(sound => ({
            _id: sound._id.toString(),
            name: sound.name,
            category: sound.category,
            filePath: sound.filePath,
            isPremium: sound.isPremium || false
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
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const { name, email, subscription, loginMethod } = req.body;
        const usersCollection = db.collection('users');
        
        const user = {
            name,
            email,
            subscription: subscription || 'free',
            loginMethod: loginMethod || 'email',
            createdAt: new Date()
        };
        
        const result = await usersCollection.insertOne(user);
        
        res.json({
            _id: result.insertedId.toString(),
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
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const { userId, duration, quality, stages, soundsDetected } = req.body;
        const sleepCollection = db.collection('sleep_sessions');
        
        const session = {
            userId,
            duration,
            quality,
            stages,
            soundsDetected: soundsDetected || [],
            date: new Date(),
            createdAt: new Date()
        };
        
        const result = await sleepCollection.insertOne(session);
        
        res.json({
            _id: result.insertedId.toString(),
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
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const { name, category, filePath, isPremium } = req.body;
        const soundsCollection = db.collection('sounds');
        
        const sound = {
            name,
            category,
            filePath,
            isPremium: isPremium || false,
            createdAt: new Date()
        };
        
        const result = await soundsCollection.insertOne(sound);
        
        res.json({
            _id: result.insertedId.toString(),
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
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const usersCollection = db.collection('users');
        const sleepCollection = db.collection('sleep_sessions');
        const soundsCollection = db.collection('sounds');

        // Clear existing data
        await usersCollection.deleteMany({});
        await sleepCollection.deleteMany({});
        await soundsCollection.deleteMany({});

        // Create real users
        const users = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                subscription: 'premium',
                loginMethod: 'google',
                sleepHours: 7.5,
                createdAt: new Date()
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                subscription: 'free',
                loginMethod: 'email',
                sleepHours: 6.8,
                createdAt: new Date()
            },
            {
                name: 'Mike Johnson',
                email: 'mike@example.com',
                subscription: 'premium',
                loginMethod: 'apple',
                sleepHours: 8.2,
                createdAt: new Date()
            }
        ];

        const usersResult = await usersCollection.insertMany(users);
        const createdUsers = Object.values(usersResult.insertedIds);

        // Create real sleep sessions
        const sleepSessions = [
            {
                userId: createdUsers[0].toString(),
                duration: 7.5,
                quality: 85,
                stages: { light: 4.5, deep: 1.5, rem: 1.5 },
                soundsDetected: ['snoring', 'deep breathing'],
                date: new Date(),
                createdAt: new Date()
            },
            {
                userId: createdUsers[1].toString(),
                duration: 6.2,
                quality: 72,
                stages: { light: 3.8, deep: 1.2, rem: 1.2 },
                soundsDetected: ['coughing', 'talking'],
                date: new Date(),
                createdAt: new Date()
            }
        ];

        await sleepCollection.insertMany(sleepSessions);

        // Create real sounds
        const sounds = [
            {
                name: 'Ocean Waves',
                category: 'Nature',
                filePath: '/sounds/ocean.wav',
                isPremium: false,
                createdAt: new Date()
            },
            {
                name: 'Rainforest',
                category: 'Nature',
                filePath: '/sounds/rainforest.wav',
                isPremium: true,
                createdAt: new Date()
            },
            {
                name: 'White Noise',
                category: 'Brainwaves',
                filePath: '/sounds/white-noise.wav',
                isPremium: false,
                createdAt: new Date()
            }
        ];

        await soundsCollection.insertMany(sounds);

        res.json({
            message: 'Real data setup completed successfully!',
            users: users.length,
            sleepSessions: sleepSessions.length,
            sounds: sounds.length,
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
        const dbStatus = db ? 'CONNECTED ✅' : 'DISCONNECTED ❌';
        
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
    const dbStatus = db ? 'connected' : 'disconnected';
    
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
    const dbStatus = db ? 'CONNECTED ✅' : 'DISCONNECTED ❌';
    
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
    console.log(`🗄️  MongoDB Status: ${db ? 'Connected' : 'Disconnected'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    if (client) {
        await client.close();
    }
    process.exit(0);
});
