import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import config from '../config/environment';
import { Message } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: string | { content: string }) => void;
  onNewMessage: (callback: (message: Message) => void) => (() => void) | undefined;
  onRoomHistory: (callback: (messages: Message[]) => void) => (() => void) | undefined;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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

    newSocket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      console.log('Joining room:', roomId);
      socket.emit('joinRoom', { roomId });
    }
  }, [socket, isConnected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      console.log('Leaving room:', roomId);
      socket.emit('leaveRoom', { roomId });
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((roomId: string, message: string | { content: string }) => {
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

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    if (socket) {
      socket.on('newMessage', callback);
      return () => socket.off('newMessage', callback);
    }
  }, [socket]);

  const onRoomHistory = useCallback((callback: (messages: Message[]) => void) => {
    if (socket) {
      socket.on('roomHistory', callback);
      return () => socket.off('roomHistory', callback);
    }
  }, [socket]);

  const value: SocketContextType = {
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
