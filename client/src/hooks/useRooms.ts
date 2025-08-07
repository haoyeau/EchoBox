import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Room } from '../types';

interface UseRoomsReturn {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  loadRooms: () => Promise<void>;
  createRoom: (name: string) => Promise<Room | null>;
  getRoom: (roomId: string) => Promise<Room>;
  clearError: () => void;
}

export const useRooms = (): UseRoomsReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await api.getRooms();
      setRooms(roomsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (name: string): Promise<Room | null> => {
    try {
      setError(null);
      
      // Validate room name
      if (!name || !name.trim()) {
        setError('Room name is required');
        return null;
      }
      
      const newRoom = await api.createRoom(name.trim());
      setRooms(prev => [newRoom, ...prev]);
      return newRoom;
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
      console.error('Error creating room:', err);
      return null;
    }
  }, []);

  const getRoom = useCallback(async (roomId: string): Promise<Room> => {
    try {
      setError(null);
      return await api.getRoom(roomId);
    } catch (err: any) {
      setError(err.message || 'Failed to get room');
      console.error('Error getting room:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    rooms,
    loading,
    error,
    loadRooms,
    createRoom,
    getRoom,
    clearError: () => setError(null),
  };
};
