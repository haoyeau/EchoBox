import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import config from '../config/environment';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Get socket URL from environment configuration
    console.log('Connecting to socket server:', config.socketUrl);
    
    // Connect to the server
    const newSocket = io(config.socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      console.log('Joining room:', roomId);
      socket.emit('joinRoom', { roomId });
    }
  }, [socket, isConnected]);

  const leaveRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      console.log('Leaving room:', roomId);
      socket.emit('leaveRoom', { roomId });
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((roomId, message) => {
    if (socket && isConnected) {
      const messageData = {
        roomId,
        message: {
          content: typeof message === 'string' ? message : message.content,
        }
      };
      console.log('Sending anonymous message:', messageData);
      socket.emit('sendMessage', messageData);
    }
  }, [socket, isConnected]);

  const onNewMessage = useCallback((callback) => {
    if (socket) {
      socket.on('newMessage', callback);
      return () => socket.off('newMessage', callback);
    }
  }, [socket]);

  const onRoomHistory = useCallback((callback) => {
    if (socket) {
      socket.on('roomHistory', callback);
      return () => socket.off('roomHistory', callback);
    }
  }, [socket]);

  const value = {
    socket,
    isConnected,
    connectionError,
    joinRoom,
    leaveRoom,
    sendMessage,
    onNewMessage,
    onRoomHistory,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
