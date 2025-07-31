// Socket Handler tests
const SocketHandler = require('../../handlers/socketHandler');
const MessageService = require('../../services/messageService');
const RoomService = require('../../services/roomService');
const { createMockSocket, createMockIo, createMockMessage, cleanupMocks } = require('../utils/testUtils');

// Mock dependencies
jest.mock('../../services/messageService');
jest.mock('../../services/roomService');

describe('SocketHandler', () => {
  let mockSocket;
  let mockIo;
  let socketHandler;

  beforeEach(() => {
    cleanupMocks();
    mockSocket = createMockSocket();
    mockIo = createMockIo();
    socketHandler = new SocketHandler(mockIo);
  });

  describe('handleConnection', () => {
    it('should set up event listeners on connection', () => {
      socketHandler.handleConnection(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('joinRoom', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('sendMessage', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('leaveRoom', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('joinRoom event', () => {
    let joinRoomHandler;

    beforeEach(() => {
      socketHandler.handleConnection(mockSocket);
      // Get the joinRoom handler function
      const joinRoomCall = mockSocket.on.mock.calls.find(call => call[0] === 'joinRoom');
      joinRoomHandler = joinRoomCall[1];
    });

    it('should join room and send history when room exists', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Message 1' }),
        createMockMessage({ id: 2, content: 'Message 2' })
      ];
      RoomService.roomExists.mockResolvedValue(true);
      MessageService.getLatestMessages.mockResolvedValue(mockMessages);

      await joinRoomHandler({ roomId: 'room-1' });

      expect(RoomService.roomExists).toHaveBeenCalledWith('room-1');
      expect(mockSocket.join).toHaveBeenCalledWith('room-1');
      expect(MessageService.getLatestMessages).toHaveBeenCalledWith('room-1', 20);
      expect(mockSocket.emit).toHaveBeenCalledWith('roomHistory', mockMessages);
    });

    it('should emit error when room does not exist', async () => {
      RoomService.roomExists.mockResolvedValue(false);

      await joinRoomHandler({ roomId: 'non-existent' });

      expect(mockSocket.join).not.toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Room not found' });
    });

    it('should emit error when join room fails', async () => {
      RoomService.roomExists.mockRejectedValue(new Error('Database error'));

      await joinRoomHandler({ roomId: 'room-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Failed to join room' });
    });
  });

  describe('sendMessage event', () => {
    let sendMessageHandler;

    beforeEach(() => {
      socketHandler.handleConnection(mockSocket);
      const sendMessageCall = mockSocket.on.mock.calls.find(call => call[0] === 'sendMessage');
      sendMessageHandler = sendMessageCall[1];
    });

    it('should create and broadcast message', async () => {
      const mockMessage = {
        id: 1,
        content: 'Hello world',
        timestamp: new Date()
      };
      MessageService.createMessage.mockResolvedValue(mockMessage);

      await sendMessageHandler({ 
        roomId: 'room-1', 
        message: 'Hello world' 
      });

      expect(MessageService.createMessage).toHaveBeenCalledWith('room-1', 'Hello world');
      expect(mockIo.to).toHaveBeenCalledWith('room-1');
      expect(mockIo.emit).toHaveBeenCalledWith('newMessage', {
        id: mockMessage.id,
        content: mockMessage.content,
        timestamp: mockMessage.timestamp
      });
    });

    it('should handle message object with content property', async () => {
      const mockMessage = {
        id: 1,
        content: 'Hello world',
        timestamp: new Date()
      };
      MessageService.createMessage.mockResolvedValue(mockMessage);

      await sendMessageHandler({ 
        roomId: 'room-1', 
        message: { content: 'Hello world' }
      });

      expect(MessageService.createMessage).toHaveBeenCalledWith('room-1', 'Hello world');
    });

    it('should emit error when message creation fails', async () => {
      MessageService.createMessage.mockRejectedValue(new Error('Database error'));

      await sendMessageHandler({ 
        roomId: 'room-1', 
        message: 'Hello world' 
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Database error' });
    });
  });

  describe('leaveRoom event', () => {
    let leaveRoomHandler;

    beforeEach(() => {
      socketHandler.handleConnection(mockSocket);
      const leaveRoomCall = mockSocket.on.mock.calls.find(call => call[0] === 'leaveRoom');
      leaveRoomHandler = leaveRoomCall[1];
    });

    it('should leave room', () => {
      leaveRoomHandler({ roomId: 'room-1' });

      expect(mockSocket.leave).toHaveBeenCalledWith('room-1');
    });
  });

  describe('disconnect event', () => {
    let disconnectHandler;

    beforeEach(() => {
      socketHandler.handleConnection(mockSocket);
      const disconnectCall = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
      disconnectHandler = disconnectCall[1];
    });

    it('should handle disconnect', () => {
      // Should not throw any errors
      expect(() => disconnectHandler()).not.toThrow();
    });
  });
});
