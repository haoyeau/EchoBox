import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await api.getRooms();
      setRooms(roomsData);
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (name) => {
    try {
      setError(null);
      const newRoom = await api.createRoom(name);
      setRooms(prev => [newRoom, ...prev]);
      return newRoom;
    } catch (err) {
      setError(err.message || 'Failed to create room');
      console.error('Error creating room:', err);
      throw err;
    }
  }, []);

  const getRoom = useCallback(async (roomId) => {
    try {
      setError(null);
      return await api.getRoom(roomId);
    } catch (err) {
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
