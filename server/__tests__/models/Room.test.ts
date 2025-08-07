// Room model tests
import Room from '../../src/models/Room';
import database from '../../src/config/prisma';
import { createMockRoom, cleanupMocks } from '../utils/testUtils';

// Mock the database
jest.mock('../../src/config/prisma');

const mockedDatabase = database as jest.Mocked<typeof database>;

// Mock the prisma client methods
const mockPrismaRoomModel = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
};

beforeEach(() => {
  mockedDatabase.prisma = {
    room: mockPrismaRoomModel,
  } as any;
});

describe('Room Model', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('create', () => {
    it('should create a room', async () => {
      const mockPrismaRoomData = {
        id: 'test-uuid',
        name: 'Test Room',
        createdAt: new Date()
      };
      
      mockPrismaRoomModel.create.mockResolvedValue(mockPrismaRoomData);

      const result = await Room.create('Test Room');

      expect(mockPrismaRoomModel.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: 'Test Room',
        },
      });
      expect(result).toEqual({
        id: mockPrismaRoomData.id,
        name: mockPrismaRoomData.name,
        createdAt: mockPrismaRoomData.createdAt,
      });
    });
  });

  describe('findAll', () => {
    it('should return all rooms ordered by creation date', async () => {
      const mockPrismaRooms = [
        { id: 'room-1', name: 'Room 1', createdAt: new Date() },
        { id: 'room-2', name: 'Room 2', createdAt: new Date() }
      ];
      
      mockPrismaRoomModel.findMany.mockResolvedValue(mockPrismaRooms);

      const result = await Room.findAll();

      expect(mockPrismaRoomModel.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockPrismaRooms.map(room => ({
        id: room.id,
        name: room.name,
        createdAt: room.createdAt,
      })));
    });

    it('should return empty array when no rooms exist', async () => {
      mockPrismaRoomModel.findMany.mockResolvedValue([]);

      const result = await Room.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return room if found', async () => {
      const mockPrismaRoomData = {
        id: 'room-1',
        name: 'Test Room',
        createdAt: new Date()
      };
      
      mockPrismaRoomModel.findUnique.mockResolvedValue(mockPrismaRoomData);

      const result = await Room.findById('room-1');

      expect(mockPrismaRoomModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'room-1' },
      });
      expect(result).toEqual({
        id: mockPrismaRoomData.id,
        name: mockPrismaRoomData.name,
        createdAt: mockPrismaRoomData.createdAt,
      });
    });

    it('should return undefined if room not found', async () => {
      mockPrismaRoomModel.findUnique.mockResolvedValue(null);

      const result = await Room.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete room and return it', async () => {
      const mockPrismaRoomData = {
        id: 'room-1',
        name: 'Test Room',
        createdAt: new Date()
      };
      
      mockPrismaRoomModel.delete.mockResolvedValue(mockPrismaRoomData);

      const result = await Room.delete('room-1');

      expect(mockPrismaRoomModel.delete).toHaveBeenCalledWith({
        where: { id: 'room-1' },
      });
      expect(result).toEqual({
        id: mockPrismaRoomData.id,
        name: mockPrismaRoomData.name,
        createdAt: mockPrismaRoomData.createdAt,
      });
    });

    it('should return undefined if delete fails', async () => {
      mockPrismaRoomModel.delete.mockRejectedValue(new Error('Not found'));

      const result = await Room.delete('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true if room exists', async () => {
      mockPrismaRoomModel.findUnique.mockResolvedValue({ id: 'room-1' });

      const result = await Room.exists('room-1');

      expect(mockPrismaRoomModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if room does not exist', async () => {
      mockPrismaRoomModel.findUnique.mockResolvedValue(null);

      const result = await Room.exists('non-existent');

      expect(result).toBe(false);
    });
  });
});
