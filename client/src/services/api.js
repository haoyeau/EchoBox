import config from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export const api = {
  // Get all rooms
  getRooms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rooms:', error);
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
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Get messages from a specific room
  getRoomMessages: async (roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
};
