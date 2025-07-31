// Model tests with mock database
const Message = require('../../models/Message');
const database = require('../../config/database');
const { createMockMessage, mockDatabaseQuery, cleanupMocks } = require('../utils/testUtils');

// Mock the database
jest.mock('../../config/database');

describe('Message Model', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const mockMessage = createMockMessage({
        room_id: 'room-1',
        content: 'Hello world'
      });
      
      database.query.mockResolvedValue({ rows: [mockMessage] });

      const result = await Message.create('room-1', 'Hello world');

      expect(database.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        ['room-1', 'Hello world']
      );
      expect(result).toEqual(mockMessage);
    });
  });

  describe('findByRoomId', () => {
    it('should find messages by room ID with limit and offset', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Message 1' }),
        createMockMessage({ id: 2, content: 'Message 2' })
      ];
      
      database.query.mockResolvedValue({ rows: mockMessages });

      const result = await Message.findByRoomId('room-1', 10, 5);

      expect(database.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, content, timestamp'),
        ['room-1', 10, 5]
      );
      expect(result).toEqual(mockMessages);
    });

    it('should use default limit and offset', async () => {
      database.query.mockResolvedValue({ rows: [] });

      await Message.findByRoomId('room-1');

      expect(database.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, content, timestamp'),
        ['room-1', 100, 0]
      );
    });
  });

  describe('getMessageCount', () => {
    it('should return message count for room', async () => {
      database.query.mockResolvedValue({ rows: [{ count: '25' }] });

      const result = await Message.getMessageCount('room-1');

      expect(database.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) FROM messages WHERE room_id = $1',
        ['room-1']
      );
      expect(result).toBe(25);
    });
  });

  describe('deleteByRoomId', () => {
    it('should delete messages by room ID', async () => {
      const mockDeletedMessages = [
        { id: 1, content: 'Message 1' },
        { id: 2, content: 'Message 2' }
      ];
      database.query.mockResolvedValue({ rows: mockDeletedMessages });

      const result = await Message.deleteByRoomId('room-1');

      expect(database.query).toHaveBeenCalledWith(
        'DELETE FROM messages WHERE room_id = $1 RETURNING *',
        ['room-1']
      );
      expect(result).toEqual(mockDeletedMessages);
    });
  });

  describe('getLatestMessages', () => {
    it('should get latest messages in chronological order', async () => {
      const mockMessages = [
        { id: 2, content: 'Message 2', timestamp: new Date() },
        { id: 1, content: 'Message 1', timestamp: new Date() }
      ];
      database.query.mockResolvedValue({ rows: mockMessages });

      const result = await Message.getLatestMessages('room-1', 20);

      expect(database.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY timestamp DESC'),
        ['room-1', 20]
      );
      // Should reverse the order for chronological display
      expect(result).toEqual(mockMessages.reverse());
    });

    it('should use default limit', async () => {
      database.query.mockResolvedValue({ rows: [] });

      await Message.getLatestMessages('room-1');

      expect(database.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $2'),
        ['room-1', 50]
      );
    });
  });
});
