// useRooms hook tests
import { renderHook, act } from '@testing-library/react';
import { useRooms } from '../../hooks/useRooms';
import { api } from '../../services/api';
import { createMockRoom } from '../utils/testUtils';

// Mock the API service
jest.mock('../../services/api');

describe('useRooms hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state and loadRooms', () => {
    it('should load rooms on mount', async () => {
      const mockRooms = [
        createMockRoom({ id: 'room-1', name: 'Room 1' }),
        createMockRoom({ id: 'room-2', name: 'Room 2' })
      ];
      api.getRooms.mockResolvedValue(mockRooms);

      const { result } = renderHook(() => useRooms());

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.rooms).toEqual([]);
      expect(result.current.error).toBe(null);

      // Wait for rooms to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.rooms).toEqual(mockRooms);
      expect(result.current.error).toBe(null);
      expect(api.getRooms).toHaveBeenCalledTimes(1);
    });

    it('should handle loading error', async () => {
      const errorMessage = 'Failed to fetch rooms';
      api.getRooms.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useRooms());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.rooms).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('createRoom', () => {
    it('should create a new room and add it to the list', async () => {
      const initialRooms = [
        { id: 'room-1', name: 'Room 1', created_at: '2023-01-01' }
      ];
      const newRoom = { id: 'room-2', name: 'New Room', created_at: '2023-01-02' };

      api.getRooms.mockResolvedValue(initialRooms);
      api.createRoom.mockResolvedValue(newRoom);

      const { result } = renderHook(() => useRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Create new room
      let createdRoom;
      await act(async () => {
        createdRoom = await result.current.createRoom('New Room');
      });

      expect(api.createRoom).toHaveBeenCalledWith('New Room');
      expect(createdRoom).toEqual(newRoom);
      expect(result.current.rooms).toEqual([newRoom, ...initialRooms]);
      expect(result.current.error).toBe(null);
    });

    it('should handle create room error', async () => {
      const errorMessage = 'Room name is required';
      api.getRooms.mockResolvedValue([]);
      api.createRoom.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useRooms());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        try {
          await result.current.createRoom('');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.rooms).toEqual([]);
    });
  });

  describe('getRoom', () => {
    it('should get a specific room', async () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', created_at: '2023-01-01' };
      api.getRooms.mockResolvedValue([]);
      api.getRoom.mockResolvedValue(mockRoom);

      const { result } = renderHook(() => useRooms());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let fetchedRoom;
      await act(async () => {
        fetchedRoom = await result.current.getRoom('room-1');
      });

      expect(api.getRoom).toHaveBeenCalledWith('room-1');
      expect(fetchedRoom).toEqual(mockRoom);
      expect(result.current.error).toBe(null);
    });

    it('should handle get room error', async () => {
      const errorMessage = 'Room not found';
      api.getRooms.mockResolvedValue([]);
      api.getRoom.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useRooms());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        try {
          await result.current.getRoom('non-existent');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      api.getRooms.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useRooms());

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
