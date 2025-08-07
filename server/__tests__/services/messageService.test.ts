// MessageService tests
import MessageService from '../../src/services/messageService';
import Message from '../../src/models/Message';
import RoomService from '../../src/services/roomService';
import { createMockMessage, cleanupMocks } from '../utils/testUtils';

// Mock dependencies
jest.mock('../../src/models/Message');
jest.mock('../../src/services/roomService');

const mockedMessage = Message as jest.Mocked<typeof Message>;
const mockedRoomService = RoomService as jest.Mocked<typeof RoomService>;

describe('MessageService', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('createMessage', () => {
    it('should create a message with valid data', async () => {
      const mockMessage = createMockMessage({ 
        roomId: 'room-1', 
        content: 'Hello world'
      });
      mockedRoomService.roomExists.mockResolvedValue(true);
      mockedMessage.create.mockResolvedValue(mockMessage);

      const result = await MessageService.createMessage('room-1', 'Hello world');

      expect(mockedRoomService.roomExists).toHaveBeenCalledWith('room-1');
      expect(mockedMessage.create).toHaveBeenCalledWith('room-1', 'Hello world');
      expect(result).toEqual(mockMessage);
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.createMessage('', 'content')).rejects.toThrow('Room ID is required');
      await expect(MessageService.createMessage(null as any, 'content')).rejects.toThrow('Room ID is required');
      await expect(MessageService.createMessage(undefined as any, 'content')).rejects.toThrow('Room ID is required');
    });

    it('should throw error if content is empty', async () => {
      mockedRoomService.roomExists.mockResolvedValue(true);

      await expect(MessageService.createMessage('room-1', '')).rejects.toThrow('Message content is required');
      await expect(MessageService.createMessage('room-1', '   ')).rejects.toThrow('Message content is required');
      await expect(MessageService.createMessage('room-1', null as any)).rejects.toThrow('Message content is required');
      await expect(MessageService.createMessage('room-1', undefined as any)).rejects.toThrow('Message content is required');
    });

    it('should throw error if room does not exist', async () => {
      mockedRoomService.roomExists.mockResolvedValue(false);

      await expect(MessageService.createMessage('non-existent', 'content')).rejects.toThrow('Room not found');
      expect(mockedRoomService.roomExists).toHaveBeenCalledWith('non-existent');
      expect(mockedMessage.create).not.toHaveBeenCalled();
    });

    it('should trim whitespace from content', async () => {
      const mockMessage = createMockMessage({ 
        roomId: 'room-1', 
        content: 'Hello world'
      });
      mockedRoomService.roomExists.mockResolvedValue(true);
      mockedMessage.create.mockResolvedValue(mockMessage);

      await MessageService.createMessage('room-1', '  Hello world  ');

      expect(mockedMessage.create).toHaveBeenCalledWith('room-1', 'Hello world');
    });
  });

  describe('getRoomMessages', () => {
    it('should return paginated messages', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Message 1' }),
        createMockMessage({ id: 2, content: 'Message 2' })
      ];
      mockedRoomService.roomExists.mockResolvedValue(true);
      mockedMessage.findByRoomId.mockResolvedValue(mockMessages);
      mockedMessage.getMessageCount.mockResolvedValue(25);

      const result = await MessageService.getRoomMessages('room-1', 1, 10);

      expect(mockedRoomService.roomExists).toHaveBeenCalledWith('room-1');
      expect(mockedMessage.findByRoomId).toHaveBeenCalledWith('room-1', 10, 0);
      expect(result.messages).toEqual(mockMessages);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3
      });
    });

    it('should use default pagination parameters', async () => {
      const mockMessages = [createMockMessage()];
      mockedRoomService.roomExists.mockResolvedValue(true);
      mockedMessage.findByRoomId.mockResolvedValue(mockMessages);
      mockedMessage.getMessageCount.mockResolvedValue(5);

      const result = await MessageService.getRoomMessages('room-1');

      expect(mockedMessage.findByRoomId).toHaveBeenCalledWith('room-1', 100, 0);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 100,
        total: 5,
        totalPages: 1
      });
    });

    it('should throw error if room does not exist', async () => {
      mockedRoomService.roomExists.mockResolvedValue(false);

      await expect(MessageService.getRoomMessages('non-existent')).rejects.toThrow('Room not found');
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.getRoomMessages('')).rejects.toThrow('Room ID is required');
    });
  });

  describe('getLatestMessages', () => {
    it('should return latest messages', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Latest message 1' }),
        createMockMessage({ id: 2, content: 'Latest message 2' })
      ];
      mockedRoomService.roomExists.mockResolvedValue(true);
      mockedMessage.getLatestMessages.mockResolvedValue(mockMessages);

      const result = await MessageService.getLatestMessages('room-1', 5);

      expect(mockedRoomService.roomExists).toHaveBeenCalledWith('room-1');
      expect(mockedMessage.getLatestMessages).toHaveBeenCalledWith('room-1', 5);
      expect(result).toEqual(mockMessages);
    });

    it('should use default limit', async () => {
      const mockMessages = [createMockMessage()];
      mockedRoomService.roomExists.mockResolvedValue(true);
      mockedMessage.getLatestMessages.mockResolvedValue(mockMessages);

      const result = await MessageService.getLatestMessages('room-1');

      expect(mockedMessage.getLatestMessages).toHaveBeenCalledWith('room-1', 50);
      expect(result).toEqual(mockMessages);
    });

    it('should throw error if room does not exist', async () => {
      mockedRoomService.roomExists.mockResolvedValue(false);

      await expect(MessageService.getLatestMessages('non-existent')).rejects.toThrow('Room not found');
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.getLatestMessages('')).rejects.toThrow('Room ID is required');
    });
  });

  describe('deleteRoomMessages', () => {
    it('should delete all messages in room', async () => {
      const deletedMessages = [
        createMockMessage({ id: 1, content: 'Deleted message 1' }),
        createMockMessage({ id: 2, content: 'Deleted message 2' })
      ];
      mockedMessage.deleteByRoomId.mockResolvedValue(deletedMessages);

      const result = await MessageService.deleteRoomMessages('room-1');

      expect(mockedMessage.deleteByRoomId).toHaveBeenCalledWith('room-1');
      expect(result).toEqual(deletedMessages);
    });

    it('should return empty array when no messages to delete', async () => {
      mockedMessage.deleteByRoomId.mockResolvedValue([]);

      const result = await MessageService.deleteRoomMessages('room-1');

      expect(result).toEqual([]);
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.deleteRoomMessages('')).rejects.toThrow('Room ID is required');
    });
  });
});
