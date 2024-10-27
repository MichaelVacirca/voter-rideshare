const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Schema Definitions
const riderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    pickupAddress: String,
    pollingLocation: String,
    requestedTime: Date,
    matched: { type: Boolean, default: false },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }
});

const driverSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    vehicle: String,
    availableSeats: Number,
    availability: [{
        date: Date,
        startTime: String,
        endTime: String
    }],
    verified: { type: Boolean, default: false }
});

const Rider = mongoose.model('Rider', riderSchema);
const Driver = mongoose.model('Driver', driverSchema);

// MongoDB Connection
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// API Routes

// Request a ride
app.post('/api/riders', async (req, res) => {
    try {
        const rider = new Rider(req.body);
        await rider.save();
        findMatch(rider);
        res.status(201).json(rider);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Register as a driver
app.post('/api/drivers', async (req, res) => {
    try {
        const driver = new Driver(req.body);
        await driver.save();
        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all unmatched ride requests
app.get('/api/rides/unmatched', async (req, res) => {
    try {
        const rides = await Rider.find({ matched: false });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all available drivers
app.get('/api/drivers/available', async (req, res) => {
    try {
        const drivers = await Driver.find({ verified: true });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Match finding function
async function findMatch(rider) {
    try {
        const availableDriver = await Driver.findOne({
            verified: true,
            'availability.date': rider.requestedTime
        });

        if (availableDriver) {
            rider.matched = true;
            rider.driverId = availableDriver._id;
            await rider.save();
            notifyMatch(rider, availableDriver);
        }
    } catch (error) {
        console.error('Matching error:', error);
    }
}

// Notification function (placeholder - implement with your preferred notification service)
function notifyMatch(rider, driver) {
    // TODO: Implement actual notification (SMS/email)
    console.log(`Match found: Driver ${driver.name} matched with rider ${rider.name}`);
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});