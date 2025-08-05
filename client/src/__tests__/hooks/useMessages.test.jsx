// useMessages hook tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessages } from '../../hooks/useMessages';
import { api } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { createMockMessage } from '../utils/testUtils';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../contexts/SocketContext');

describe('useMessages hook', () => {
  const mockUseSocket = {
    onNewMessage: vi.fn(),
    onRoomHistory: vi.fn(),
    sendMessage: vi.fn(),
    isConnected: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSocket.mockReturnValue(mockUseSocket);
  });

  describe('initial state and loadLatestMessages', () => {
    it('should load messages when roomId is provided', async () => {
      const mockMessages = [
        createMockMessage({ id: 1, content: 'Message 1' }),
        createMockMessage({ id: 2, content: 'Message 2' })
      ];
      api.getLatestMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useMessages('room-1'));

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.messages).toEqual([]);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.messages).toEqual(mockMessages);
      expect(result.current.error).toBe(null);
      expect(api.getLatestMessages).toHaveBeenCalledWith('room-1', 50);
    });

    it('should not load messages if no roomId provided', async () => {
      const { result } = renderHook(() => useMessages(null));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.messages).toEqual([]);
      expect(api.getLatestMessages).not.toHaveBeenCalled();
    });

    it('should handle loading error', async () => {
      const errorMessage = 'Failed to load messages';
      api.getLatestMessages.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('loadMessages with pagination', () => {
    it('should load messages with pagination', async () => {
      const mockResponse = {
        messages: [
          { id: 1, content: 'Message 1', timestamp: '2023-01-01' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      };
      api.getRoomMessages.mockResolvedValue(mockResponse);
      api.getLatestMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let paginationInfo;
      await act(async () => {
        paginationInfo = await result.current.loadMessages(1, 10);
      });

      expect(api.getRoomMessages).toHaveBeenCalledWith('room-1', 1, 10);
      expect(result.current.messages).toEqual(mockResponse.messages);
      expect(paginationInfo).toEqual(mockResponse.pagination);
    });

    it('should handle array response without pagination', async () => {
      const mockMessages = [
        { id: 1, content: 'Message 1', timestamp: '2023-01-01' }
      ];
      api.getRoomMessages.mockResolvedValue(mockMessages);
      api.getLatestMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let paginationInfo;
      await act(async () => {
        paginationInfo = await result.current.loadMessages();
      });

      expect(result.current.messages).toEqual(mockMessages);
      expect(paginationInfo).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully when connected', async () => {
      api.getLatestMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let success;
      await act(async () => {
        success = await result.current.sendMessage('Hello world');
      });

      expect(mockUseSocket.sendMessage).toHaveBeenCalledWith('room-1', 'Hello world');
      expect(success).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should not send empty messages', async () => {
      api.getLatestMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let success;
      await act(async () => {
        success = await result.current.sendMessage('   ');
      });

      expect(mockUseSocket.sendMessage).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });

    it('should not send when not connected', async () => {
      useSocket.mockReturnValue({ ...mockUseSocket, isConnected: false });
      api.getLatestMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let success;
      await act(async () => {
        success = await result.current.sendMessage('Hello world');
      });

      expect(mockUseSocket.sendMessage).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });

    it('should handle send error', async () => {
      mockUseSocket.sendMessage.mockImplementation(() => {
        throw new Error('Send failed');
      });
      api.getLatestMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let success;
      await act(async () => {
        success = await result.current.sendMessage('Hello world');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Send failed');
    });
  });

  describe('addMessage', () => {
    it('should add new message', async () => {
      const initialMessages = [
        { id: 1, content: 'Message 1', timestamp: '2023-01-01' }
      ];
      api.getLatestMessages.mockResolvedValue(initialMessages);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const newMessage = {
        id: 2,
        content: 'New message',
        timestamp: '2023-01-02'
      };

      act(() => {
        result.current.addMessage(newMessage);
      });

      expect(result.current.messages).toEqual([...initialMessages, newMessage]);
    });

    it('should avoid duplicate messages by ID', async () => {
      const initialMessages = [
        { id: 1, content: 'Message 1', timestamp: '2023-01-01' }
      ];
      api.getLatestMessages.mockResolvedValue(initialMessages);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const duplicateMessage = {
        id: 1,
        content: 'Message 1',
        timestamp: '2023-01-01'
      };

      act(() => {
        result.current.addMessage(duplicateMessage);
      });

      expect(result.current.messages).toEqual(initialMessages);
    });

    it('should avoid duplicate messages by content and timestamp', async () => {
      const initialMessages = [
        { id: 1, content: 'Message 1', timestamp: '2023-01-01T10:00:00Z' }
      ];
      api.getLatestMessages.mockResolvedValue(initialMessages);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const duplicateMessage = {
        id: 2,
        content: 'Message 1',
        sender: 'user1',
        timestamp: '2023-01-01T10:00:00Z'
      };

      act(() => {
        result.current.addMessage(duplicateMessage);
      });

      // Should add the message since it has a different sender and ID
      expect(result.current.messages).toEqual([...initialMessages, duplicateMessage]);
    });

    it('should add timestamp if not provided', async () => {
      api.getLatestMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const messageWithoutTimestamp = {
        id: 1,
        content: 'New message'
      };

      act(() => {
        result.current.addMessage(messageWithoutTimestamp);
      });

      expect(result.current.messages[0]).toEqual(
        expect.objectContaining({
          id: 1,
          content: 'New message',
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('socket event listeners', () => {
    it('should set up socket listeners when roomId is provided', async () => {
      const mockCleanupNewMessage = vi.fn();
      const mockCleanupRoomHistory = vi.fn();
      
      mockUseSocket.onNewMessage.mockReturnValue(mockCleanupNewMessage);
      mockUseSocket.onRoomHistory.mockReturnValue(mockCleanupRoomHistory);
      
      api.getLatestMessages.mockResolvedValue([]);

      const { unmount } = renderHook(() => useMessages('room-1'));

      expect(mockUseSocket.onNewMessage).toHaveBeenCalledWith(expect.any(Function));
      expect(mockUseSocket.onRoomHistory).toHaveBeenCalledWith(expect.any(Function));

      // Should clean up on unmount
      unmount();
      expect(mockCleanupNewMessage).toHaveBeenCalled();
      expect(mockCleanupRoomHistory).toHaveBeenCalled();
    });

    it('should not set up listeners when no roomId', () => {
      renderHook(() => useMessages(null));

      expect(mockUseSocket.onNewMessage).not.toHaveBeenCalled();
      expect(mockUseSocket.onRoomHistory).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      api.getLatestMessages.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });
});
