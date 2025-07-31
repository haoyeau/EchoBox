// API service tests
import { api } from '../../services/api';
import config from '../../config/environment';
import { createMockRoom, createMockMessage, mockFetchResponse, mockFetchError } from '../utils/testUtils';

// Mock the config
jest.mock('../../config/environment', () => ({
  apiBaseUrl: 'http://localhost:3001/api'
}));

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRooms', () => {
    it('should fetch all rooms successfully', async () => {
      const mockRooms = [
        createMockRoom({ id: 'room-1', name: 'Room 1' }),
        createMockRoom({ id: 'room-2', name: 'Room 2' })
      ];

      fetch.mockImplementation(() => mockFetchResponse(mockRooms));

      const result = await api.getRooms();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms');
      expect(result).toEqual(mockRooms);
    });

    it('should handle fetch errors', async () => {
      fetch.mockImplementation(() => mockFetchResponse(
        { error: 'Server error' }, 
        500, 
        false
      ));

      await expect(api.getRooms()).rejects.toThrow('Server error');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getRooms()).rejects.toThrow('Network error');
    });
  });

  describe('getRoom', () => {
    it('should fetch a specific room', async () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', created_at: '2023-01-01' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom
      });

      const result = await api.getRoom('room-1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms/room-1');
      expect(result).toEqual(mockRoom);
    });

    it('should handle room not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Room not found' })
      });

      await expect(api.getRoom('non-existent')).rejects.toThrow('Room not found');
    });
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const mockRoom = { id: 'room-1', name: 'New Room', created_at: '2023-01-01' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom
      });

      const result = await api.createRoom('New Room');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'New Room' }),
      });
      expect(result).toEqual(mockRoom);
    });

    it('should handle validation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Room name is required' })
      });

      await expect(api.createRoom('')).rejects.toThrow('Room name is required');
    });
  });

  describe('getRoomMessages', () => {
    it('should fetch room messages with pagination', async () => {
      const mockResponse = {
        messages: [
          { id: 1, content: 'Message 1', timestamp: '2023-01-01' },
          { id: 2, content: 'Message 2', timestamp: '2023-01-02' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.getRoomMessages('room-1', 1, 10);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms/room-1/messages?page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should use default pagination parameters', async () => {
      const mockResponse = { messages: [], pagination: {} };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await api.getRoomMessages('room-1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms/room-1/messages?page=1&limit=100');
    });
  });

  describe('getLatestMessages', () => {
    it('should fetch latest messages', async () => {
      const mockMessages = [
        { id: 1, content: 'Message 1', timestamp: '2023-01-01' },
        { id: 2, content: 'Message 2', timestamp: '2023-01-02' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages
      });

      const result = await api.getLatestMessages('room-1', 20);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms/room-1/messages/latest?limit=20');
      expect(result).toEqual(mockMessages);
    });

    it('should use default limit', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await api.getLatestMessages('room-1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms/room-1/messages/latest?limit=50');
    });
  });
});
