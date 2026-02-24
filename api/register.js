const cors = require('cors');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Enable CORS
const corsHandler = cors({
    origin: true,
    credentials: true
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

module.exports = (req, res) => {
    corsHandler(req, res, () => {
        if (req.method === 'POST' && req.url === '/api/register') {
            const { username, password } = req.body;
            const data = loadData();
            
            if (data.users[username]) {
                res.status(200).json({ success: false, message: 'Felhasználó már létezik' });
            } else {
                data.users[username] = {
                    password: password,
                    salary: 0,
                    fixedDeductions: [],
                    notifications: [],
                    expenses: []
                };
                saveData(data);
                res.status(200).json({ success: true, userId: username });
            }
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    });
};
