// Room model tests
const Room = require('../../models/Room');
const database = require('../../config/database');
const { createMockRoom, mockDatabaseQuery, cleanupMocks } = require('../utils/testUtils');

// Mock the database
jest.mock('../../config/database');

// Mock crypto module
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-123')
}));

describe('Room Model', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('create', () => {
    it('should create a room with generated UUID', async () => {
      const mockRoom = createMockRoom({
        id: 'mock-uuid-123',
        name: 'Test Room'
      });
      
      database.query.mockResolvedValue({ rows: [mockRoom] });

      const result = await Room.create('Test Room');

      expect(database.query).toHaveBeenCalledWith(
        'INSERT INTO rooms (id, name) VALUES ($1, $2) RETURNING *',
        ['mock-uuid-123', 'Test Room']
      );
      expect(result).toEqual(mockRoom);
    });
  });

  describe('findAll', () => {
    it('should return all rooms ordered by creation date', async () => {
      const mockRooms = [
        createMockRoom({ id: 'room-1', name: 'Room 1' }),
        createMockRoom({ id: 'room-2', name: 'Room 2' })
      ];
      
      database.query.mockResolvedValue({ rows: mockRooms });

      const result = await Room.findAll();

      expect(database.query).toHaveBeenCalledWith(
        'SELECT id, name, created_at FROM rooms ORDER BY created_at DESC'
      );
      expect(result).toEqual(mockRooms);
    });
  });

  describe('findById', () => {
    it('should find room by ID', async () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', created_at: new Date() };
      database.query.mockResolvedValue({ rows: [mockRoom] });

      const result = await Room.findById('room-1');

      expect(database.query).toHaveBeenCalledWith(
        'SELECT * FROM rooms WHERE id = $1',
        ['room-1']
      );
      expect(result).toEqual(mockRoom);
    });

    it('should return undefined when room not found', async () => {
      database.query.mockResolvedValue({ rows: [] });

      const result = await Room.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete room by ID', async () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', created_at: new Date() };
      database.query.mockResolvedValue({ rows: [mockRoom] });

      const result = await Room.delete('room-1');

      expect(database.query).toHaveBeenCalledWith(
        'DELETE FROM rooms WHERE id = $1 RETURNING *',
        ['room-1']
      );
      expect(result).toEqual(mockRoom);
    });
  });

  describe('exists', () => {
    it('should return true when room exists', async () => {
      database.query.mockResolvedValue({ rows: [{ exists: true }] });

      const result = await Room.exists('room-1');

      expect(database.query).toHaveBeenCalledWith(
        'SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)',
        ['room-1']
      );
      expect(result).toBe(true);
    });

    it('should return false when room does not exist', async () => {
      database.query.mockResolvedValue({ rows: [{ exists: false }] });

      const result = await Room.exists('non-existent');

      expect(result).toBe(false);
    });
  });
});
