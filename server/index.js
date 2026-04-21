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

// ROOT route
app.get("/", (req, res) => {
    res.send("Backend működik 🚀");
});

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
        const password = data.users[req.params.id].password;
        const email = data.users[req.params.id].email;
        
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

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
    const data = loadData();
    const users = {};
    for (const [username, user] of Object.entries(data.users || {})) {
        const { password, ...safeUser } = user;
        users[username] = safeUser;
    }
    res.json({ users, totalUsers: Object.keys(users).length, dataFileSize: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).size : 0 });
});

app.get('/api/admin/raw', (req, res) => {
    const data = loadData();
    res.json(data);
});

// Admin CRUD - Create user
app.post('/api/admin/user', (req, res) => {
    const { username, password, salary = 0, email = '' } = req.body;
    const data = loadData();
    
    if (data.users[username]) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    data.users[username] = {
        password,
        salary,
        email,
        fixedDeductions: [],
        notifications: [],
        expenses: []
    };
    saveData(data);
    res.json({ success: true, message: 'User created' });
});

// Admin CRUD - Update user
app.put('/api/admin/user/:username', (req, res) => {
    const username = req.params.username;
    const updates = req.body;
    const data = loadData();
    
    if (!data.users[username]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    data.users[username] = { ...data.users[username], ...updates };
    saveData(data);
    res.json({ success: true });
});

// Admin CRUD - Delete user
app.delete('/api/admin/user/:username', (req, res) => {
    const username = req.params.username;
    const data = loadData();
    
    if (!data.users[username]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    delete data.users[username];
    saveData(data);
    res.json({ success: true });
});

// Admin add expense to user
app.post('/api/admin/user/:username/expense', (req, res) => {
    const username = req.params.username;
    const expense = req.body;
    const data = loadData();
    
    if (!data.users[username]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    data.users[username].expenses.push(expense);
    saveData(data);
    res.json({ success: true });
});

// Update expense endpoint
app.put('/api/user/:id/expense/:expIndex', (req, res) => {
    const data = loadData();
    const userId = req.params.id;
    const expIndex = parseInt(req.params.expIndex);
    
    if (!data.users[userId]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!data.users[userId].expenses || expIndex >= data.users[userId].expenses.length || expIndex < 0) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    data.users[userId].expenses[expIndex] = { ...req.body };
    saveData(data);
    res.json({ success: true });
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
