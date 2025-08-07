// Message model tests
import Message from '../../src/models/Message';
import database from '../../src/config/prisma';
import { createMockMessage, cleanupMocks } from '../utils/testUtils';

// Mock the database
jest.mock('../../src/config/prisma');

const mockedDatabase = database as jest.Mocked<typeof database>;

// Mock the prisma client methods
const mockPrismaMessageModel = {
  create: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
};

beforeEach(() => {
  mockedDatabase.prisma = {
    message: mockPrismaMessageModel,
  } as any;
});

describe('Message Model', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const mockPrismaMessageData = {
        id: 1,
        roomId: 'room-1',
        content: 'Hello world',
        timestamp: new Date()
      };
      
      mockPrismaMessageModel.create.mockResolvedValue(mockPrismaMessageData);

      const result = await Message.create('room-1', 'Hello world');

      expect(mockPrismaMessageModel.create).toHaveBeenCalledWith({
        data: {
          roomId: 'room-1',
          content: 'Hello world',
        },
      });
      expect(result).toEqual({
        id: mockPrismaMessageData.id,
        roomId: mockPrismaMessageData.roomId,
        content: mockPrismaMessageData.content,
        timestamp: mockPrismaMessageData.timestamp,
      });
    });
  });

  describe('findByRoomId', () => {
    it('should find messages by room ID with limit and offset', async () => {
      const mockPrismaMessages = [
        { id: 1, roomId: 'room-1', content: 'Message 1', timestamp: new Date() },
        { id: 2, roomId: 'room-1', content: 'Message 2', timestamp: new Date() }
      ];
      
      mockPrismaMessageModel.findMany.mockResolvedValue(mockPrismaMessages);

      const result = await Message.findByRoomId('room-1', 10, 5);

      expect(mockPrismaMessageModel.findMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
        orderBy: { timestamp: 'asc' },
        take: 10,
        skip: 5,
        select: {
          id: true,
          content: true,
          timestamp: true,
          roomId: true,
        },
      });
      expect(result).toEqual(mockPrismaMessages.map(msg => ({
        id: msg.id,
        roomId: msg.roomId,
        content: msg.content,
        timestamp: msg.timestamp,
      })));
    });

    it('should use default limit and offset', async () => {
      const mockPrismaMessages = [
        { id: 1, roomId: 'room-1', content: 'Message 1', timestamp: new Date() }
      ];
      
      mockPrismaMessageModel.findMany.mockResolvedValue(mockPrismaMessages);

      const result = await Message.findByRoomId('room-1');

      expect(mockPrismaMessageModel.findMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
        orderBy: { timestamp: 'asc' },
        take: 100,
        skip: 0,
        select: {
          id: true,
          content: true,
          timestamp: true,
          roomId: true,
        },
      });
      expect(result).toEqual(mockPrismaMessages.map(msg => ({
        id: msg.id,
        roomId: msg.roomId,
        content: msg.content,
        timestamp: msg.timestamp,
      })));
    });
  });

  describe('getLatestMessages', () => {
    it('should get latest messages', async () => {
      const mockPrismaMessages = [
        { id: 2, roomId: 'room-1', content: 'Latest message', timestamp: new Date() },
        { id: 1, roomId: 'room-1', content: 'Older message', timestamp: new Date() }
      ];
      
      mockPrismaMessageModel.findMany.mockResolvedValue(mockPrismaMessages);

      const result = await Message.getLatestMessages('room-1', 5);

      expect(mockPrismaMessageModel.findMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
        orderBy: { timestamp: 'desc' },
        take: 5,
        select: {
          id: true,
          content: true,
          timestamp: true,
          roomId: true,
        },
      });
      expect(result).toEqual(mockPrismaMessages.map(msg => ({
        id: msg.id,
        roomId: msg.roomId,
        content: msg.content,
        timestamp: msg.timestamp,
      })));
    });

    it('should use default limit', async () => {
      const mockPrismaMessages: any[] = [];
      
      mockPrismaMessageModel.findMany.mockResolvedValue(mockPrismaMessages);

      const result = await Message.getLatestMessages('room-1');

      expect(mockPrismaMessageModel.findMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
        orderBy: { timestamp: 'desc' },
        take: 50,
        select: {
          id: true,
          content: true,
          timestamp: true,
          roomId: true,
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('deleteByRoomId', () => {
    it('should delete all messages in a room and return them', async () => {
      const mockPrismaMessages = [
        { id: 1, roomId: 'room-1', content: 'Message 1', timestamp: new Date() },
        { id: 2, roomId: 'room-1', content: 'Message 2', timestamp: new Date() }
      ];
      
      mockPrismaMessageModel.findMany.mockResolvedValue(mockPrismaMessages);
      mockPrismaMessageModel.deleteMany.mockResolvedValue({ count: 2 });

      const result = await Message.deleteByRoomId('room-1');

      expect(mockPrismaMessageModel.findMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
      });
      expect(mockPrismaMessageModel.deleteMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
      });
      expect(result).toEqual(mockPrismaMessages.map(msg => ({
        id: msg.id,
        roomId: msg.roomId,
        content: msg.content,
        timestamp: msg.timestamp,
      })));
    });

    it('should return empty array when no messages to delete', async () => {
      mockPrismaMessageModel.findMany.mockResolvedValue([]);
      mockPrismaMessageModel.deleteMany.mockResolvedValue({ count: 0 });

      const result = await Message.deleteByRoomId('room-1');

      expect(result).toEqual([]);
    });
  });

  describe('getMessageCount', () => {
    it('should count messages in a room', async () => {
      mockPrismaMessageModel.count.mockResolvedValue(42);

      const result = await Message.getMessageCount('room-1');

      expect(mockPrismaMessageModel.count).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
      });
      expect(result).toBe(42);
    });

    it('should return 0 when no messages exist', async () => {
      mockPrismaMessageModel.count.mockResolvedValue(0);

      const result = await Message.getMessageCount('room-1');

      expect(result).toBe(0);
    });
  });
});
