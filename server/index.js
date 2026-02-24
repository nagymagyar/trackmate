const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    credentials: true
}));
app.use(express.json());

// Load data from file
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
    return { users: {} };
}

// Save data to file
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Login - authenticate user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = loadData();
    
    // Check if user exists and password matches
    if (data.users[username] && data.users[username].password === password) {
        res.json({ success: true, userId: username });
    } else {
        res.json({ success: false, message: 'Hibás felhasználónév vagy jelszó' });
    }
});

// Register new user
app.post('/api/register', (req, res) => {
    const { username, password, email } = req.body;
    const data = loadData();
    
    if (data.users[username]) {
        res.json({ success: false, message: 'Felhasználó már létezik' });
    } else {
        // Create new user with default data
        data.users[username] = {
            password: password,
            email: email || '',
            salary: 0,
            fixedDeductions: [],
            notifications: [],
            expenses: []
        };
        saveData(data);
        res.json({ success: true, userId: username });
    }
});

// Get user data
app.get('/api/user/:id', (req, res) => {
    const data = loadData();
    const user = data.users[req.params.id];
    if (user) {
        // Don't return password
        const { password, ...userData } = user;
        res.json(userData);
    } else {
        res.json(null);
    }
});

// Save user data
app.post('/api/user/:id', (req, res) => {
    const data = loadData();
    const { salary, fixedDeductions, notifications, expenses } = req.body;
    
    if (data.users[req.params.id]) {
        // Preserve password and email
        const password = data.users[req.params.id].password;
        const email = data.users[req.params.id].email;
        
        // Ensure arrays are always arrays
        data.users[req.params.id] = {
            salary: salary || 0,
            fixedDeductions: Array.isArray(fixedDeductions) ? fixedDeductions : [],
            notifications: Array.isArray(notifications) ? notifications : [],
            expenses: Array.isArray(expenses) ? expenses : [],
            password,
            email
        };
    } else {
        data.users[req.params.id] = {
            salary: salary || 0,
            fixedDeductions: Array.isArray(fixedDeductions) ? fixedDeductions : [],
            notifications: Array.isArray(notifications) ? notifications : [],
            expenses: Array.isArray(expenses) ? expenses : []
        };
    }
    saveData(data);
    res.json({ success: true });
});

// Add expense
app.post('/api/user/:id/expense', (req, res) => {
    const data = loadData();
    if (!data.users[req.params.id]) {
        data.users[req.params.id] = { salary: 0, fixedDeductions: [], expenses: [], notifications: [] };
    }
    if (!data.users[req.params.id].expenses) {
        data.users[req.params.id].expenses = [];
    }
    data.users[req.params.id].expenses.push(req.body);
    saveData(data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
