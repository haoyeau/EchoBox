// Controller tests
const request = require('supertest');
const express = require('express');
const roomController = require('../../controllers/roomController');
const RoomService = require('../../services/roomService');
const { createMockRoom, expectSuccessResponse, expectErrorResponse, cleanupMocks } = require('../utils/testUtils');

// Mock the service
jest.mock('../../services/roomService');

// Create test app
const app = express();
app.use(express.json());
app.post('/rooms', roomController.createRoom);
app.get('/rooms', roomController.getAllRooms);
app.get('/rooms/:roomId', roomController.getRoomById);

describe('Room Controller', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('POST /rooms', () => {
    it('should create a room successfully', async () => {
      const mockRoom = createMockRoom({ name: 'Test Room' });
      RoomService.createRoom.mockResolvedValue(mockRoom);

      const response = await request(app)
        .post('/rooms')
        .send({ name: 'Test Room' });

      expectSuccessResponse(response, 201);
      expect(response.body).toEqual(mockRoom);
      expect(RoomService.createRoom).toHaveBeenCalledWith('Test Room');
    });

    it('should return 400 for invalid room name', async () => {
      RoomService.createRoom.mockRejectedValue(new Error('Room name is required'));

      const response = await request(app)
        .post('/rooms')
        .send({ name: '' });

      expectErrorResponse(response, 400, 'Room name is required');
    });

    it('should return 400 for room name too long', async () => {
      RoomService.createRoom.mockRejectedValue(new Error('Room name is too long'));

      const response = await request(app)
        .post('/rooms')
        .send({ name: 'a'.repeat(256) });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Room name is too long');
    });

    it('should return 500 for server errors', async () => {
      RoomService.createRoom.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/rooms')
        .send({ name: 'Test Room' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create room');
    });
  });

  describe('GET /rooms', () => {
    it('should return all rooms', async () => {
      const mockRooms = [
        { id: 'room-1', name: 'Room 1', created_at: new Date().toISOString() },
        { id: 'room-2', name: 'Room 2', created_at: new Date().toISOString() }
      ];
      RoomService.getAllRooms.mockResolvedValue(mockRooms);

      const response = await request(app).get('/rooms');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRooms);
      expect(RoomService.getAllRooms).toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      RoomService.getAllRooms.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/rooms');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch rooms');
    });
  });

  describe('GET /rooms/:roomId', () => {
    it('should return a specific room', async () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', created_at: new Date().toISOString() };
      RoomService.getRoomById.mockResolvedValue(mockRoom);

      const response = await request(app).get('/rooms/room-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRoom);
      expect(RoomService.getRoomById).toHaveBeenCalledWith('room-1');
    });

    it('should return 404 for non-existent room', async () => {
      RoomService.getRoomById.mockRejectedValue(new Error('Room not found'));

      const response = await request(app).get('/rooms/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Room not found');
    });

    it('should return 500 for server errors', async () => {
      RoomService.getRoomById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/rooms/room-1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch room');
    });
  });
});
