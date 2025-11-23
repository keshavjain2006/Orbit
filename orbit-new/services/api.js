// API Service for Orbit App
// Connects frontend to backend API

// Get your computer's IP address for physical device testing
// Run: ipconfig getifaddr en0 (Mac) or ipconfig (Windows) to find your IP
// Then replace 'localhost' with your IP below

// API URL Configuration
// IMPORTANT: If you're using a physical device, you MUST use your computer's IP address
// Your computer's IP: 172.16.4.209 (update this if your IP changes)
// To find your IP: Run `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)

const getApiUrl = () => {
  if (__DEV__) {
    // Check if we're on a physical device by looking at the Expo dev server URL
    // If Expo is running on an IP (not localhost), use IP for API too
    const isPhysicalDevice = typeof window !== 'undefined' && 
      (window.location?.hostname !== 'localhost' && window.location?.hostname !== '127.0.0.1');
    
    // For physical device, use your computer's IP address
    // For simulator/emulator/web, use localhost
    // Update the IP below to match your computer's IP address
    const YOUR_COMPUTER_IP = '172.16.4.209';
    
    // Try to auto-detect, but default to IP for safety (works for both)
    // If localhost doesn't work on simulator, change this to use IP
    return `http://${YOUR_COMPUTER_IP}:3000/api`;
    
    // Uncomment below for simulator/emulator if IP doesn't work:
    // return 'http://localhost:3000/api';
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic fetch wrapper
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      console.log(`📥 API Response Status: ${response.status} ${response.statusText}`);
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error('❌ Failed to parse JSON response:', text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      console.log('📦 API Response Data:', data);

      if (!response.ok) {
        const errorMsg = data.error || data.message || `HTTP error! status: ${response.status}`;
        console.error('❌ API Error Response:', errorMsg);
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error('❌ API Request Failed:', {
        url,
        method: config.method || 'GET',
        error: error.message,
        stack: error.stack,
      });
      
      // Provide more helpful error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        const apiUrl = this.baseURL.replace('/api', '');
        throw new Error(`Cannot connect to backend at ${apiUrl}. Make sure:
1. Backend server is running (cd backend && npm run dev)
2. Backend is accessible from your device
3. If using physical device, API URL uses your computer's IP (not localhost)
4. Check firewall settings`);
      }
      
      throw error;
    }
  }

  // User endpoints (if you add them to backend)
  async createUser(userData) {
    // For now, we'll use the seeded users
    // You can add a POST /api/users endpoint later
    return { success: true, data: userData };
  }

  // Encounter endpoints
  async recordEncounter(user1Id, user2Id, latitude = null, longitude = null) {
    return this.request('/encounters', {
      method: 'POST',
      body: {
        user1Id,
        user2Id,
        latitude,
        longitude,
      },
    });
  }

  async getUserEncounters(userId) {
    return this.request(`/encounters?userId=${userId}`);
  }

  async checkConnectionRequests() {
    return this.request('/encounters/check-requests');
  }

  // Connection endpoints
  async createConnectionRequests() {
    return this.request('/connections/create-requests', {
      method: 'POST',
    });
  }

  async respondToConnectionRequest(requestId, userId, accept) {
    return this.request(`/connections/requests/${requestId}/respond`, {
      method: 'PATCH',
      body: {
        userId,
        accept,
      },
    });
  }

  async getUserConnections(userId) {
    return this.request(`/connections/user/${userId}`);
  }

  async getPendingRequests(userId) {
    return this.request(`/connections/pending/${userId}`);
  }

  // Message endpoints
  async sendMessage(conversationId, senderId, content, messageType = 'text') {
    return this.request('/messages', {
      method: 'POST',
      body: {
        conversationId,
        senderId,
        content,
        messageType,
      },
    });
  }

  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    return this.request(
      `/messages/conversation/${conversationId}?limit=${limit}&offset=${offset}`
    );
  }

  async markMessagesAsRead(conversationId, userId) {
    return this.request(`/messages/conversation/${conversationId}/read`, {
      method: 'PATCH',
      body: {
        userId,
      },
    });
  }
}

export default new ApiService();

