import config from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

// API Response handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
};

export const api = {
  // Get all rooms
  getRooms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Get a specific room by ID
  getRoom: async (roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // Create a new room
  createRoom: async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Get messages from a specific room with pagination
  getRoomMessages: async (roomId, page = 1, limit = 100) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Get latest messages from a specific room
  getLatestMessages: async (roomId, limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages/latest?limit=${limit}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching latest messages:', error);
      throw error;
    }
  },
};
