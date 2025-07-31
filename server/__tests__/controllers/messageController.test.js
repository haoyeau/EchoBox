// Message Controller tests
const request = require('supertest');
const express = require('express');
const messageController = require('../../controllers/messageController');
const MessageService = require('../../services/messageService');
const { createMockMessage, expectSuccessResponse, expectErrorResponse, cleanupMocks } = require('../utils/testUtils');

// Mock the service
jest.mock('../../services/messageService');

// Create test app
const app = express();
app.use(express.json());
app.get('/rooms/:roomId/messages', messageController.getRoomMessages);
app.get('/rooms/:roomId/messages/latest', messageController.getLatestMessages);
app.delete('/rooms/:roomId/messages', messageController.deleteRoomMessages);

describe('Message Controller', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('GET /rooms/:roomId/messages', () => {
    it('should return paginated messages', async () => {
      const mockResult = {
        messages: [
          createMockMessage({ id: 1, content: 'Message 1' }),
          createMockMessage({ id: 2, content: 'Message 2' })
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      };
      MessageService.getRoomMessages.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/rooms/room-1/messages?page=1&limit=10');

      expectSuccessResponse(response, 200);
      expect(response.body).toEqual(mockResult);
      expect(MessageService.getRoomMessages).toHaveBeenCalledWith('room-1', 1, 10);
    });

    it('should use default pagination parameters', async () => {
      const mockResult = {
        messages: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 }
      };
      MessageService.getRoomMessages.mockResolvedValue(mockResult);

      const response = await request(app).get('/rooms/room-1/messages');

      expectSuccessResponse(response, 200);
      expect(MessageService.getRoomMessages).toHaveBeenCalledWith('room-1', 1, 100);
    });

    it('should return 404 for non-existent room', async () => {
      MessageService.getRoomMessages.mockRejectedValue(new Error('Room not found'));

      const response = await request(app).get('/rooms/non-existent/messages');

      expectErrorResponse(response, 404, 'Room not found');
    });

    it('should return 500 for server errors', async () => {
      MessageService.getRoomMessages.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/rooms/room-1/messages');

      expectErrorResponse(response, 500);
    });
  });

  describe('GET /rooms/:roomId/messages/latest', () => {
    it('should return latest messages', async () => {
      const mockMessages = [
        { id: 1, content: 'Message 1', timestamp: new Date().toISOString() },
        { id: 2, content: 'Message 2', timestamp: new Date().toISOString() }
      ];
      MessageService.getLatestMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/rooms/room-1/messages/latest?limit=20');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMessages);
      expect(MessageService.getLatestMessages).toHaveBeenCalledWith('room-1', 20);
    });

    it('should use default limit', async () => {
      const mockMessages = [];
      MessageService.getLatestMessages.mockResolvedValue(mockMessages);

      const response = await request(app).get('/rooms/room-1/messages/latest');

      expect(response.status).toBe(200);
      expect(MessageService.getLatestMessages).toHaveBeenCalledWith('room-1', 50);
    });

    it('should return 404 for non-existent room', async () => {
      MessageService.getLatestMessages.mockRejectedValue(new Error('Room not found'));

      const response = await request(app).get('/rooms/non-existent/messages/latest');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Room not found');
    });

    it('should return 500 for server errors', async () => {
      MessageService.getLatestMessages.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/rooms/room-1/messages/latest');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch latest messages');
    });
  });

  describe('DELETE /rooms/:roomId/messages', () => {
    it('should delete room messages', async () => {
      const mockDeletedMessages = [
        { id: 1, content: 'Message 1' },
        { id: 2, content: 'Message 2' }
      ];
      MessageService.deleteRoomMessages.mockResolvedValue(mockDeletedMessages);

      const response = await request(app).delete('/rooms/room-1/messages');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Messages deleted successfully',
        deletedCount: 2
      });
      expect(MessageService.deleteRoomMessages).toHaveBeenCalledWith('room-1');
    });

    it('should return 500 for server errors', async () => {
      MessageService.deleteRoomMessages.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/rooms/room-1/messages');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete messages');
    });
  });
});
