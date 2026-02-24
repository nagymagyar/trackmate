// Ingyenes JSON storage API - jsonbox.io
// Vagy használhatsz saját backend-et is később

export const API_CONFIG = {
    // Használjunk jsonbox.io-t ingyenes tároláshoz
    // Vagy változtasd meg a saját backend URL-re
    storageUrl: 'https://jsonbox.io/box_c2e7d7d7d7d7d7d7d7d7'
};

// Helper functions for API calls
export class ApiService {
    static async register(username: string, password: string): Promise<any> {
        const response = await fetch(`${API_CONFIG.storageUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password,
                salary: 0,
                fixedDeductions: [],
                notifications: [],
                expenses: []
            })
        });
        return response.json();
    }

    static async login(username: string): Promise<any> {
        // JSONBox filter syntax
        const response = await fetch(`${API_CONFIG.storageUrl}?q=username:${username}`);
        const data = await response.json();
        return data;
    }

    static async saveUser(userId: string, data: any): Promise<any> {
        // First get existing record
        const response = await fetch(`${API_CONFIG.storageUrl}?q=userId:${userId}`);
        const existing = await response.json();
        
        if (existing.length > 0) {
            // Update
            const id = existing[0]._id;
            await fetch(`${API_CONFIG.storageUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, userId })
            });
        } else {
            // Create new
            await fetch(`${API_CONFIG.storageUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, userId })
            });
        }
    }

    static async getUser(userId: string): Promise<any> {
        const response = await fetch(`${API_CONFIG.storageUrl}?q=userId:${userId}`);
        const data = await response.json();
        if (data.length > 0) {
            const { _id, ...userData } = data[0];
            return userData;
        }
        return null;
    }
}
