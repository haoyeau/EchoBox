// useRooms hook tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRooms } from '../../hooks/useRooms';
import { api } from '../../services/api';
import { createMockRoom } from '../utils/testUtils';

// Mock the API service
vi.mock('../../services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('useRooms hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state and loadRooms', () => {
    it('should load rooms on mount', async () => {
      const mockRooms = [
        createMockRoom({ id: 'room-1', name: 'Room 1' }),
        createMockRoom({ id: 'room-2', name: 'Room 2' })
      ];
      mockedApi.getRooms.mockResolvedValue(mockRooms);

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
      expect(mockedApi.getRooms).toHaveBeenCalledTimes(1);
    });

    it('should handle loading error', async () => {
      const errorMessage = 'Failed to fetch rooms';
      mockedApi.getRooms.mockRejectedValue(new Error(errorMessage));

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
        createMockRoom({ id: 'room-1', name: 'Existing Room' })
      ];
      const newRoom = createMockRoom({ id: 'room-2', name: 'New Room' });

      mockedApi.getRooms.mockResolvedValue(initialRooms);
      mockedApi.createRoom.mockResolvedValue(newRoom);

      const { result } = renderHook(() => useRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.rooms).toEqual(initialRooms);

      // Create new room
      await act(async () => {
        await result.current.createRoom('New Room');
      });

      expect(mockedApi.createRoom).toHaveBeenCalledWith('New Room');
      expect(result.current.rooms).toEqual([newRoom, ...initialRooms]);
      expect(result.current.error).toBe(null);
    });

    it('should handle creation error', async () => {
      const initialRooms = [createMockRoom({ id: 'room-1', name: 'Existing Room' })];
      const errorMessage = 'Failed to create room';

      mockedApi.getRooms.mockResolvedValue(initialRooms);
      mockedApi.createRoom.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Try to create room
      await act(async () => {
        await result.current.createRoom('New Room');
      });

      expect(result.current.rooms).toEqual(initialRooms);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should not create room with empty name', async () => {
      const initialRooms = [createMockRoom({ id: 'room-1', name: 'Existing Room' })];

      mockedApi.getRooms.mockResolvedValue(initialRooms);
      mockedApi.createRoom.mockClear(); // Clear any previous mock setup

      const { result } = renderHook(() => useRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Try to create room with empty name - this should not call API and return null
      let result_createRoom;
      await act(async () => {
        result_createRoom = await result.current.createRoom('');
      });

      expect(result_createRoom).toBe(null);
      expect(mockedApi.createRoom).not.toHaveBeenCalled();
      expect(result.current.rooms).toEqual(initialRooms);
      expect(result.current.error).toBe('Room name is required');
    });
  });

  describe('loadRooms', () => {
    it('should reload rooms from API', async () => {
      const initialRooms = [createMockRoom({ id: 'room-1', name: 'Room 1' })];
      const updatedRooms = [
        createMockRoom({ id: 'room-1', name: 'Room 1' }),
        createMockRoom({ id: 'room-2', name: 'Room 2' })
      ];

      mockedApi.getRooms
        .mockResolvedValueOnce(initialRooms)
        .mockResolvedValueOnce(updatedRooms);

      const { result } = renderHook(() => useRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.rooms).toEqual(initialRooms);

      // Manually reload rooms
      await act(async () => {
        await result.current.loadRooms();
      });

      expect(result.current.rooms).toEqual(updatedRooms);
      expect(mockedApi.getRooms).toHaveBeenCalledTimes(2);
    });

    it('should handle reload error', async () => {
      const initialRooms = [createMockRoom({ id: 'room-1', name: 'Room 1' })];
      const errorMessage = 'Failed to load rooms';

      mockedApi.getRooms
        .mockResolvedValueOnce(initialRooms)
        .mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Try to reload
      await act(async () => {
        await result.current.loadRooms();
      });

      expect(result.current.rooms).toEqual(initialRooms); // Should keep previous rooms
      expect(result.current.error).toBe(errorMessage);
    });
  });
});
