// useMessages hook tests
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessages } from '../../hooks/useMessages';
import { api } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { createMockMessage } from '../utils/testUtils';
import type { Message } from '../../types';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../contexts/SocketContext');

interface MockUseSocket {
  onNewMessage: Mock;
  onRoomHistory: Mock;
  sendMessage: Mock;
  isConnected: boolean;
}

interface MockApi {
  getLatestMessages: Mock;
  getRoomMessages: Mock;
}

describe('useMessages hook', () => {
  const mockUseSocket: MockUseSocket = {
    onNewMessage: vi.fn(),
    onRoomHistory: vi.fn(),
    sendMessage: vi.fn(),
    isConnected: true
  };

  const mockedApi = api as unknown as MockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocket as Mock).mockReturnValue(mockUseSocket);
  });

  describe('Test Utils', () => {
    it('should export utility functions', () => {
      expect(createMockMessage).toBeDefined();
    });
  });

  describe('initial state and loadLatestMessages', () => {
    it('should load messages when roomId is provided', async () => {
      const mockMessages: Message[] = [
        createMockMessage({ id: 1, content: 'Message 1' }),
        createMockMessage({ id: 2, content: 'Message 2' })
      ];
      mockedApi.getLatestMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useMessages('room-1'));

      expect(result.current.loading).toBe(true);

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.messages).toEqual(mockMessages);
      expect(mockedApi.getLatestMessages).toHaveBeenCalledWith('room-1', 50);
    });

    it('should not load messages if no roomId provided', () => {
      const { result } = renderHook(() => useMessages(''));

      expect(result.current.loading).toBe(false);
      expect(result.current.messages).toEqual([]);
      expect(mockedApi.getLatestMessages).not.toHaveBeenCalled();
    });

    it('should handle loading error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedApi.getLatestMessages.mockRejectedValue(new Error('Failed to load messages'));

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to load messages');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading latest messages:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadMessages with pagination', () => {
    it('should load messages with pagination', async () => {
      const mockMessages: Message[] = [
        createMockMessage({ id: 3, content: 'Message 3' }),
        createMockMessage({ id: 4, content: 'Message 4' })
      ];
      const mockResponse = {
        messages: mockMessages,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      };
      mockedApi.getRoomMessages.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await result.current.loadMessages(1, 10);
      });

      expect(result.current.messages).toEqual(mockMessages);
      expect(mockedApi.getRoomMessages).toHaveBeenCalledWith('room-1', 1, 10);
    });

    it('should handle array response without pagination', async () => {
      const mockMessages: Message[] = [
        createMockMessage({ id: 5, content: 'Message 5' }),
        createMockMessage({ id: 6, content: 'Message 6' })
      ];
      mockedApi.getRoomMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        await result.current.loadMessages(1, 10);
      });

      expect(result.current.messages).toEqual(mockMessages);
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully when connected', async () => {
      mockUseSocket.isConnected = true;
      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        result.current.sendMessage('Hello world');
      });

      expect(mockUseSocket.sendMessage).toHaveBeenCalledWith('room-1', 'Hello world');
    });

    it('should not send empty messages', async () => {
      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        result.current.sendMessage('');
      });

      expect(mockUseSocket.sendMessage).not.toHaveBeenCalled();

      await act(async () => {
        result.current.sendMessage('   ');
      });

      expect(mockUseSocket.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send when not connected', async () => {
      mockUseSocket.isConnected = false;
      const { result } = renderHook(() => useMessages('room-1'));

      await act(async () => {
        result.current.sendMessage('Hello world');
      });

      expect(mockUseSocket.sendMessage).not.toHaveBeenCalled();
    });

    it('should handle send error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Make sure initial load doesn't fail
      mockedApi.getLatestMessages.mockResolvedValue([]);
      
      mockUseSocket.isConnected = true;
      mockUseSocket.sendMessage.mockImplementation(() => {
        throw new Error('Send failed');
      });

      const { result } = renderHook(() => useMessages('room-1'));

      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Clear any errors from initial load
      act(() => {
        result.current.clearError();
      });

      // Now test the send error
      await act(async () => {
        result.current.sendMessage('Hello world');
      });

      expect(result.current.error).toBe('Send failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending message:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('addMessage', () => {
    it('should add new message', async () => {
      // Mock getLatestMessages to return empty array initially
      mockedApi.getLatestMessages.mockResolvedValue([]);
      
      const { result } = renderHook(() => useMessages('room-1'));
      
      // Wait for initial load to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const newMessage = createMockMessage({ id: 1, content: 'New message' });

      act(() => {
        result.current.addMessage(newMessage);
      });

      expect(result.current.messages).toContainEqual(newMessage);
    });

    it('should avoid duplicate messages by ID', () => {
      const { result } = renderHook(() => useMessages('room-1'));
      const message1 = createMockMessage({ id: 1, content: 'Message 1' });
      const message2 = createMockMessage({ id: 1, content: 'Different content' });

      act(() => {
        result.current.addMessage(message1);
        result.current.addMessage(message2);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(message1);
    });

    it('should avoid duplicate messages by content and timestamp', () => {
      const { result } = renderHook(() => useMessages('room-1'));
      const message1 = createMockMessage({ 
        id: 1, 
        content: 'Message 1', 
        timestamp: '2023-01-01T10:00:00Z' 
      });
      const message2 = createMockMessage({ 
        id: 2, 
        content: 'Message 1', 
        timestamp: '2023-01-01T10:00:00Z'
      });

      act(() => {
        result.current.addMessage(message1);
        result.current.addMessage(message2);
      });

      // Should add the duplicate message since logic might have changed
      expect(result.current.messages).toEqual([message1]);
    });

    it('should add timestamp if not provided', () => {
      const { result } = renderHook(() => useMessages('room-1'));
      const messageWithoutTimestamp = {
        id: 1,
        content: 'Message without timestamp'
      } as Message;

      act(() => {
        result.current.addMessage(messageWithoutTimestamp);
      });

      expect(result.current.messages[0]).toHaveProperty('timestamp');
      expect(typeof result.current.messages[0].timestamp).toBe('string');
    });
  });

  describe('socket event listeners', () => {
    it('should set up socket listeners when roomId is provided', () => {
      renderHook(() => useMessages('room-1'));

      expect(mockUseSocket.onNewMessage).toHaveBeenCalled();
      expect(mockUseSocket.onRoomHistory).toHaveBeenCalled();
    });

    it('should not set up listeners when no roomId', () => {
      renderHook(() => useMessages(''));

      expect(mockUseSocket.onNewMessage).not.toHaveBeenCalled();
      expect(mockUseSocket.onRoomHistory).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedApi.getLatestMessages.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useMessages('room-1'));

      // Wait for error to be set
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      
      consoleErrorSpy.mockRestore();
    });
  });
});
