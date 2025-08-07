// Message Controller tests
import request from 'supertest';
import express from 'express';
import * as messageController from '../../src/controllers/messageController';
import MessageService from '../../src/services/messageService';
import { createMockMessage, expectSuccessResponse, expectErrorResponse, cleanupMocks } from '../utils/testUtils';

// Mock the service
jest.mock('../../src/services/messageService');

const mockedMessageService = MessageService as jest.Mocked<typeof MessageService>;

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
      mockedMessageService.getRoomMessages.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/rooms/room-1/messages?page=1&limit=10');

      expectSuccessResponse(response, 200);
      expect(response.body).toEqual({
        messages: mockResult.messages.map(msg => ({
          id: msg.id,
          roomId: msg.roomId,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        })),
        pagination: mockResult.pagination
      });
      expect(mockedMessageService.getRoomMessages).toHaveBeenCalledWith('room-1', 1, 10);
    });

    it('should use default pagination parameters', async () => {
      const mockResult = {
        messages: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 }
      };
      mockedMessageService.getRoomMessages.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/rooms/room-1/messages');

      expectSuccessResponse(response, 200);
      expect(response.body).toEqual(mockResult);
      expect(mockedMessageService.getRoomMessages).toHaveBeenCalledWith('room-1', 1, 100);
    });

    it('should handle invalid pagination parameters', async () => {
      const mockResult = {
        messages: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 }
      };
      mockedMessageService.getRoomMessages.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/rooms/room-1/messages?page=abc&limit=xyz');

      expectSuccessResponse(response, 200);
      expect(mockedMessageService.getRoomMessages).toHaveBeenCalledWith('room-1', 1, 100);
    });

    it('should return 404 for non-existent room', async () => {
      mockedMessageService.getRoomMessages.mockRejectedValue(new Error('Room not found'));

      const response = await request(app)
        .get('/rooms/non-existent/messages');

      expectErrorResponse(response, 404, 'Room not found');
    });

    it('should return 500 for server errors', async () => {
      mockedMessageService.getRoomMessages.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/rooms/room-1/messages');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch messages');
    });
  });

  describe('GET /rooms/:roomId/messages/latest', () => {
    it('should return latest messages', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Latest message 1' }),
        createMockMessage({ id: 2, content: 'Latest message 2' })
      ];
      mockedMessageService.getLatestMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/rooms/room-1/messages/latest?limit=5');

      expectSuccessResponse(response, 200);
      expect(response.body).toEqual(mockMessages.map(msg => ({
        id: msg.id,
        roomId: msg.roomId,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      })));
      expect(mockedMessageService.getLatestMessages).toHaveBeenCalledWith('room-1', 5);
    });

    it('should use default limit', async () => {
      const mockMessages = [createMockMessage()];
      mockedMessageService.getLatestMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/rooms/room-1/messages/latest');

      expectSuccessResponse(response, 200);
      expect(mockedMessageService.getLatestMessages).toHaveBeenCalledWith('room-1', 50);
    });

    it('should return 404 for non-existent room', async () => {
      mockedMessageService.getLatestMessages.mockRejectedValue(new Error('Room not found'));

      const response = await request(app)
        .get('/rooms/non-existent/messages/latest');

      expectErrorResponse(response, 404, 'Room not found');
    });
  });

  describe('DELETE /rooms/:roomId/messages', () => {
    it('should delete all messages in room', async () => {
      const deletedMessages = [
        createMockMessage({ id: 1, content: 'Deleted message 1' }),
        createMockMessage({ id: 2, content: 'Deleted message 2' })
      ];
      mockedMessageService.deleteRoomMessages.mockResolvedValue(deletedMessages);

      const response = await request(app)
        .delete('/rooms/room-1/messages');

      expectSuccessResponse(response, 200);
      expect(response.body).toEqual({ 
        message: 'Messages deleted successfully', 
        deletedCount: deletedMessages.length 
      });
      expect(mockedMessageService.deleteRoomMessages).toHaveBeenCalledWith('room-1');
    });

    it('should return 404 for non-existent room', async () => {
      mockedMessageService.deleteRoomMessages.mockRejectedValue(new Error('Room not found'));

      const response = await request(app)
        .delete('/rooms/non-existent/messages');

      expectErrorResponse(response, 500, 'Failed to delete messages');
    });

    it('should return 500 for server errors', async () => {
      mockedMessageService.deleteRoomMessages.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/rooms/room-1/messages');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete messages');
    });
  });
});
