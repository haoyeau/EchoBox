// API service tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../../services/api';
import { mockFetchResponse, mockFetchError, createMockRoom } from '../utils/testUtils';

// Mock the config
vi.mock('../../config/environment', () => ({
  default: {
    apiBaseUrl: 'http://localhost:3001/api'
  }
}));

// Mock fetch globally
global.fetch = vi.fn();

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Service', () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getRooms', () => {
    it('should fetch all rooms successfully', async () => {
      const mockRooms = [
        createMockRoom({ id: 'room-1', name: 'Room 1' }),
        createMockRoom({ id: 'room-2', name: 'Room 2' })
      ];

      mockedFetch.mockImplementation(() => mockFetchResponse(mockRooms) as Promise<Response>);

      const result = await api.getRooms();

      expect(mockedFetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms');
      expect(result).toEqual(mockRooms);
    });

    it('should handle fetch errors', async () => {
      mockedFetch.mockImplementation(() => mockFetchResponse(
        { error: 'Server error' }, 
        500, 
        false
      ) as Promise<Response>);

      await expect(api.getRooms()).rejects.toThrow('Server error');
    });

    it('should handle network errors', async () => {
      mockedFetch.mockImplementation(() => mockFetchError('Network error') as Promise<Response>);

      await expect(api.getRooms()).rejects.toThrow('Network error');
    });
  });

  describe('getRoom', () => {
    it('should fetch a specific room successfully', async () => {
      const mockRoom = createMockRoom({ id: 'room-1', name: 'Test Room' });

      mockedFetch.mockImplementation(() => mockFetchResponse(mockRoom) as Promise<Response>);

      const result = await api.getRoom('room-1');

      expect(mockedFetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms/room-1');
      expect(result).toEqual(mockRoom);
    });

    it('should handle 404 errors', async () => {
      mockedFetch.mockImplementation(() => mockFetchResponse(
        { error: 'Room not found' }, 
        404, 
        false
      ) as Promise<Response>);

      await expect(api.getRoom('non-existent')).rejects.toThrow('Room not found');
    });
  });

  describe('createRoom', () => {
    it('should create a new room successfully', async () => {
      const newRoom = createMockRoom({ id: 'room-new', name: 'New Room' });

      mockedFetch.mockImplementation(() => mockFetchResponse(newRoom, 201) as Promise<Response>);

      const result = await api.createRoom('New Room');

      expect(mockedFetch).toHaveBeenCalledWith('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'New Room' }),
      });
      expect(result).toEqual(newRoom);
    });

    it('should handle validation errors', async () => {
      mockedFetch.mockImplementation(() => mockFetchResponse(
        { error: 'Room name is required' }, 
        400, 
        false
      ) as Promise<Response>);

      await expect(api.createRoom('')).rejects.toThrow('Room name is required');
    });
  });

  describe('getRoomMessages', () => {
    it('should fetch room messages with pagination', async () => {
      const mockResponse = {
        messages: [
          { id: 1, content: 'Message 1', timestamp: new Date().toISOString() },
          { id: 2, content: 'Message 2', timestamp: new Date().toISOString() }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      };

      mockedFetch.mockImplementation(() => mockFetchResponse(mockResponse) as Promise<Response>);

      const result = await api.getRoomMessages('room-1', 1, 10);

      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/rooms/room-1/messages?page=1&limit=10'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use default pagination parameters', async () => {
      const mockResponse = {
        messages: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 }
      };

      mockedFetch.mockImplementation(() => mockFetchResponse(mockResponse) as Promise<Response>);

      await api.getRoomMessages('room-1');

      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/rooms/room-1/messages?page=1&limit=100'
      );
    });
  });

  describe('getLatestMessages', () => {
    it('should fetch latest messages', async () => {
      const mockMessages: any[] = [
        { id: 1, content: 'Latest message 1', timestamp: new Date().toISOString() },
        { id: 2, content: 'Latest message 2', timestamp: new Date().toISOString() }
      ];

      mockedFetch.mockImplementation(() => mockFetchResponse(mockMessages) as Promise<Response>);

      const result = await api.getLatestMessages('room-1', 5);

      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/rooms/room-1/messages/latest?limit=5'
      );
      expect(result).toEqual(mockMessages);
    });

    it('should use default limit', async () => {
      const mockMessages: any[] = [];

      mockedFetch.mockImplementation(() => mockFetchResponse(mockMessages) as Promise<Response>);

      await api.getLatestMessages('room-1');

      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/rooms/room-1/messages/latest?limit=50'
      );
    });
  });

  describe('error handling', () => {
    it('should throw error for non-JSON responses', async () => {
      mockedFetch.mockImplementation(() => Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Not JSON'))
      } as Response));

      await expect(api.getRooms()).rejects.toThrow('Unknown error');
    });

    it('should handle network timeouts', async () => {
      mockedFetch.mockImplementation(() => Promise.reject(new Error('Request timeout')));

      await expect(api.getRooms()).rejects.toThrow('Request timeout');
    });
  });
});
