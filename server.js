const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'sessions.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serves index.html, style.css, script.js automatically

// Helper function to read saved session data
function readSessions() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
}

// Helper function to save session data
function writeSessions(sessions) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2));
}

// API Endpoint: Save a session
app.post('/api/sessions', (req, res) => {
    const sessionData = req.body;

    if (!sessionData.totalKeys) {
        return res.status(400).json({ error: 'Invalid session data' });
    }

    const sessions = readSessions();
    const newSession = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...sessionData
    };

    sessions.push(newSession);
    writeSessions(sessions);

    console.log(`[Backend] Saved typing session #${newSession.id}`);
    res.json({ message: 'Session saved successfully!', session: newSession });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running! Open http://localhost:${PORT} in your browser.\n`);
});