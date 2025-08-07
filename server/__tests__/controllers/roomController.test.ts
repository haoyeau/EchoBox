// Controller tests
import request from 'supertest';
import express from 'express';
import * as roomController from '../../src/controllers/roomController';
import RoomService from '../../src/services/roomService';
import { createMockRoom, expectSuccessResponse, expectErrorResponse, cleanupMocks } from '../utils/testUtils';

// Mock the service
jest.mock('../../src/services/roomService');

const mockedRoomService = RoomService as jest.Mocked<typeof RoomService>;

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
      mockedRoomService.createRoom.mockResolvedValue(mockRoom);

      const response = await request(app)
        .post('/rooms')
        .send({ name: 'Test Room' });

      expectSuccessResponse(response, 201);
      expect(response.body).toEqual({
        id: mockRoom.id,
        name: mockRoom.name,
        createdAt: mockRoom.createdAt!.toISOString()
      });
      expect(mockedRoomService.createRoom).toHaveBeenCalledWith('Test Room');
    });

    it('should return 400 for invalid room name', async () => {
      mockedRoomService.createRoom.mockRejectedValue(new Error('Room name is required'));

      const response = await request(app)
        .post('/rooms')
        .send({ name: '' });

      expectErrorResponse(response, 400, 'Room name is required');
    });

    it('should return 400 for room name too long', async () => {
      mockedRoomService.createRoom.mockRejectedValue(new Error('Room name is too long'));

      const response = await request(app)
        .post('/rooms')
        .send({ name: 'a'.repeat(256) });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Room name is too long');
    });

    it('should return 500 for server errors', async () => {
      mockedRoomService.createRoom.mockRejectedValue(new Error('Database error'));

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
        { id: 'room-1', name: 'Room 1', createdAt: new Date() },
        { id: 'room-2', name: 'Room 2', createdAt: new Date() }
      ];
      mockedRoomService.getAllRooms.mockResolvedValue(mockRooms);

      const response = await request(app).get('/rooms');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRooms.map(room => ({
        id: room.id,
        name: room.name,
        createdAt: room.createdAt!.toISOString()
      })));
      expect(mockedRoomService.getAllRooms).toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      mockedRoomService.getAllRooms.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/rooms');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch rooms');
    });
  });

  describe('GET /rooms/:roomId', () => {
    it('should return a specific room', async () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', createdAt: new Date() };
      mockedRoomService.getRoomById.mockResolvedValue(mockRoom);

      const response = await request(app).get('/rooms/room-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockRoom.id,
        name: mockRoom.name,
        createdAt: mockRoom.createdAt!.toISOString()
      });
      expect(mockedRoomService.getRoomById).toHaveBeenCalledWith('room-1');
    });

    it('should return 404 for non-existent room', async () => {
      mockedRoomService.getRoomById.mockRejectedValue(new Error('Room not found'));

      const response = await request(app).get('/rooms/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Room not found');
    });

    it('should return 500 for server errors', async () => {
      mockedRoomService.getRoomById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/rooms/room-1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch room');
    });
  });
});
