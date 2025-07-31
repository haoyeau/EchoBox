// RoomService tests
const RoomService = require('../../services/roomService');
const Room = require('../../models/Room');
const { createMockRoom, cleanupMocks } = require('../utils/testUtils');

// Mock the Room model
jest.mock('../../models/Room');

describe('RoomService', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('createRoom', () => {
    it('should create a room with valid name', async () => {
      const mockRoom = createMockRoom({ name: 'Test Room' });
      Room.create.mockResolvedValue(mockRoom);

      const result = await RoomService.createRoom('Test Room');

      expect(Room.create).toHaveBeenCalledWith('Test Room');
      expect(result).toEqual(mockRoom);
    });

    it('should throw error if name is empty', async () => {
      await expect(RoomService.createRoom('')).rejects.toThrow('Room name is required');
      await expect(RoomService.createRoom('   ')).rejects.toThrow('Room name is required');
      await expect(RoomService.createRoom(null)).rejects.toThrow('Room name is required');
      await expect(RoomService.createRoom(undefined)).rejects.toThrow('Room name is required');
    });

    it('should throw error if name is too long', async () => {
      const longName = 'a'.repeat(256);
      await expect(RoomService.createRoom(longName)).rejects.toThrow('Room name is too long');
    });

    it('should trim whitespace from room name', async () => {
      const mockRoom = createMockRoom({ name: 'Test Room' });
      Room.create.mockResolvedValue(mockRoom);

      await RoomService.createRoom('  Test Room  ');

      expect(Room.create).toHaveBeenCalledWith('Test Room');
    });
  });

  describe('getAllRooms', () => {
    it('should return all rooms', async () => {
      const mockRooms = [
        createMockRoom({ id: 'room-1', name: 'Room 1' }),
        createMockRoom({ id: 'room-2', name: 'Room 2' })
      ];
      Room.findAll.mockResolvedValue(mockRooms);

      const result = await RoomService.getAllRooms();

      expect(Room.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRooms);
    });

    it('should return empty array if no rooms exist', async () => {
      Room.findAll.mockResolvedValue([]);

      const result = await RoomService.getAllRooms();

      expect(result).toEqual([]);
    });
  });

  describe('getRoomById', () => {
    it('should return room if it exists', async () => {
      const mockRoom = createMockRoom({ id: 'room-1', name: 'Test Room' });
      Room.findById.mockResolvedValue(mockRoom);

      const result = await RoomService.getRoomById('room-1');

      expect(Room.findById).toHaveBeenCalledWith('room-1');
      expect(result).toEqual(mockRoom);
    });

    it('should throw error if room does not exist', async () => {
      Room.findById.mockResolvedValue(null);

      await expect(RoomService.getRoomById('non-existent')).rejects.toThrow('Room not found');
    });

    it('should throw error if no ID provided', async () => {
      await expect(RoomService.getRoomById('')).rejects.toThrow('Room ID is required');
      await expect(RoomService.getRoomById(null)).rejects.toThrow('Room ID is required');
      await expect(RoomService.getRoomById(undefined)).rejects.toThrow('Room ID is required');
    });
  });

  describe('roomExists', () => {
    it('should return true if room exists', async () => {
      Room.exists.mockResolvedValue(true);

      const result = await RoomService.roomExists('room-1');

      expect(Room.exists).toHaveBeenCalledWith('room-1');
      expect(result).toBe(true);
    });

    it('should return false if room does not exist', async () => {
      Room.exists.mockResolvedValue(false);

      const result = await RoomService.roomExists('non-existent');

      expect(result).toBe(false);
    });

    it('should return false if no ID provided', async () => {
      const result1 = await RoomService.roomExists('');
      const result2 = await RoomService.roomExists(null);
      const result3 = await RoomService.roomExists(undefined);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      expect(Room.exists).not.toHaveBeenCalled();
    });
  });
});
