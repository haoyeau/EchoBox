import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    // Get socket URL from environment configuration
    console.log('Connecting to socket server:', config.socketUrl);
    
    // Connect to the server
    const newSocket = io(config.socketUrl);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('joinRoom', { roomId });
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leaveRoom', { roomId });
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit('sendMessage', { roomId, message });
    }
  };

  const value = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
