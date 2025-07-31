// MessageService tests
const MessageService = require('../../services/messageService');
const Message = require('../../models/Message');
const RoomService = require('../../services/roomService');
const { createMockMessage, cleanupMocks } = require('../utils/testUtils');

// Mock dependencies
jest.mock('../../models/Message');
jest.mock('../../services/roomService');

describe('MessageService', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('createMessage', () => {
    it('should create a message with valid data', async () => {
      const mockMessage = createMockMessage({ 
        room_id: 'room-1', 
        content: 'Hello world'
      });
      RoomService.roomExists.mockResolvedValue(true);
      Message.create.mockResolvedValue(mockMessage);

      const result = await MessageService.createMessage('room-1', 'Hello world');

      expect(RoomService.roomExists).toHaveBeenCalledWith('room-1');
      expect(Message.create).toHaveBeenCalledWith('room-1', 'Hello world');
      expect(result).toEqual(mockMessage);
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.createMessage('', 'content')).rejects.toThrow('Room ID is required');
      await expect(MessageService.createMessage(null, 'content')).rejects.toThrow('Room ID is required');
      await expect(MessageService.createMessage(undefined, 'content')).rejects.toThrow('Room ID is required');
    });

    it('should throw error if content is empty', async () => {
      RoomService.roomExists.mockResolvedValue(true);

      await expect(MessageService.createMessage('room-1', '')).rejects.toThrow('Message content is required');
      await expect(MessageService.createMessage('room-1', '   ')).rejects.toThrow('Message content is required');
      await expect(MessageService.createMessage('room-1', null)).rejects.toThrow('Message content is required');
      await expect(MessageService.createMessage('room-1', undefined)).rejects.toThrow('Message content is required');
    });

    it('should throw error if room does not exist', async () => {
      RoomService.roomExists.mockResolvedValue(false);

      await expect(MessageService.createMessage('non-existent', 'content')).rejects.toThrow('Room not found');
    });

    it('should trim whitespace from content', async () => {
      const mockMessage = createMockMessage({ 
        room_id: 'room-1', 
        content: 'Hello world'
      });
      RoomService.roomExists.mockResolvedValue(true);
      Message.create.mockResolvedValue(mockMessage);

      await MessageService.createMessage('room-1', '  Hello world  ');

      expect(Message.create).toHaveBeenCalledWith('room-1', 'Hello world');
    });
  });

  describe('getRoomMessages', () => {
    it('should return messages with pagination', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Message 1' }),
        createMockMessage({ id: 2, content: 'Message 2' })
      ];
      RoomService.roomExists.mockResolvedValue(true);
      Message.findByRoomId.mockResolvedValue(mockMessages);
      Message.getMessageCount.mockResolvedValue(25);

      const result = await MessageService.getRoomMessages('room-1', 1, 10);

      expect(RoomService.roomExists).toHaveBeenCalledWith('room-1');
      expect(Message.findByRoomId).toHaveBeenCalledWith('room-1', 10, 0);
      expect(Message.getMessageCount).toHaveBeenCalledWith('room-1');
      expect(result).toEqual({
        messages: mockMessages,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      });
    });

    it('should use default pagination values', async () => {
      const mockMessages = [];
      RoomService.roomExists.mockResolvedValue(true);
      Message.findByRoomId.mockResolvedValue(mockMessages);
      Message.getMessageCount.mockResolvedValue(0);

      await MessageService.getRoomMessages('room-1');

      expect(Message.findByRoomId).toHaveBeenCalledWith('room-1', 100, 0);
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.getRoomMessages('')).rejects.toThrow('Room ID is required');
      await expect(MessageService.getRoomMessages(null)).rejects.toThrow('Room ID is required');
      await expect(MessageService.getRoomMessages(undefined)).rejects.toThrow('Room ID is required');
    });

    it('should throw error if room does not exist', async () => {
      RoomService.roomExists.mockResolvedValue(false);

      await expect(MessageService.getRoomMessages('non-existent')).rejects.toThrow('Room not found');
    });
  });

  describe('getLatestMessages', () => {
    it('should return latest messages', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Message 1' }),
        createMockMessage({ id: 2, content: 'Message 2' })
      ];
      RoomService.roomExists.mockResolvedValue(true);
      Message.getLatestMessages.mockResolvedValue(mockMessages);

      const result = await MessageService.getLatestMessages('room-1', 20);

      expect(RoomService.roomExists).toHaveBeenCalledWith('room-1');
      expect(Message.getLatestMessages).toHaveBeenCalledWith('room-1', 20);
      expect(result).toEqual(mockMessages);
    });

    it('should use default limit', async () => {
      const mockMessages = [];
      RoomService.roomExists.mockResolvedValue(true);
      Message.getLatestMessages.mockResolvedValue(mockMessages);

      await MessageService.getLatestMessages('room-1');

      expect(Message.getLatestMessages).toHaveBeenCalledWith('room-1', 50);
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.getLatestMessages('')).rejects.toThrow('Room ID is required');
      await expect(MessageService.getLatestMessages(null)).rejects.toThrow('Room ID is required');
      await expect(MessageService.getLatestMessages(undefined)).rejects.toThrow('Room ID is required');
    });

    it('should throw error if room does not exist', async () => {
      RoomService.roomExists.mockResolvedValue(false);

      await expect(MessageService.getLatestMessages('non-existent')).rejects.toThrow('Room not found');
    });
  });

  describe('deleteRoomMessages', () => {
    it('should delete messages for a room', async () => {
      const mockDeletedMessages = [
        { id: 1, content: 'Message 1' },
        { id: 2, content: 'Message 2' }
      ];
      Message.deleteByRoomId.mockResolvedValue(mockDeletedMessages);

      const result = await MessageService.deleteRoomMessages('room-1');

      expect(Message.deleteByRoomId).toHaveBeenCalledWith('room-1');
      expect(result).toEqual(mockDeletedMessages);
    });

    it('should throw error if room ID is missing', async () => {
      await expect(MessageService.deleteRoomMessages('')).rejects.toThrow('Room ID is required');
      await expect(MessageService.deleteRoomMessages(null)).rejects.toThrow('Room ID is required');
      await expect(MessageService.deleteRoomMessages(undefined)).rejects.toThrow('Room ID is required');
    });
  });
});
