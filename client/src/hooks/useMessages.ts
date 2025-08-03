import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { Message } from '../types';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  loadMessages: (page?: number, limit?: number) => Promise<any>;
  loadLatestMessages: (limit?: number) => Promise<void>;
  sendMessage: (content: string) => Promise<boolean>;
  addMessage: (newMessage: Message) => void;
  clearError: () => void;
}

export const useMessages = (roomId: string): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const { onNewMessage, onRoomHistory, sendMessage, isConnected } = useSocket();
  const messagesRef = useRef<Message[]>([]);

  // Keep messages ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const loadMessages = useCallback(async (page: number = 1, limit: number = 100): Promise<any> => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.getRoomMessages(roomId, page, limit);
      
      // Handle both paginated and simple array responses
      const messagesData = response.messages || response;
      setMessages(messagesData);
      
      return response.pagination || null;
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const loadLatestMessages = useCallback(async (limit: number = 50): Promise<void> => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      const messagesData = await api.getLatestMessages(roomId, limit);
      setMessages(messagesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load latest messages');
      console.error('Error loading latest messages:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const addMessage = useCallback((newMessage: Message): void => {
    setMessages(prev => {
      // Avoid duplicates by checking if message already exists
      const exists = prev.some(msg => 
        msg.id === newMessage.id || 
        (msg.content === newMessage.content && 
         Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000)
      );
      
      if (exists) return prev;
      
      return [...prev, {
        ...newMessage,
        timestamp: newMessage.timestamp || new Date().toISOString(),
      }];
    });
  }, []);

  const sendNewMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || !roomId || !isConnected) return false;
    
    try {
      setSending(true);
      setError(null);
      
      // Send via socket - the server will handle persistence and broadcasting
      sendMessage(roomId, content.trim());
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending message:', err);
      return false;
    } finally {
      setSending(false);
    }
  }, [roomId, sendMessage, isConnected]);

  // Set up socket listeners
  useEffect(() => {
    if (!roomId) return;

    const cleanupNewMessage = onNewMessage?.(addMessage);
    const cleanupRoomHistory = onRoomHistory?.((historyMessages: Message[]) => {
      setMessages(historyMessages);
    });

    return () => {
      cleanupNewMessage?.();
      cleanupRoomHistory?.();
    };
  }, [roomId, onNewMessage, onRoomHistory, addMessage]);

  // Load messages when room changes
  useEffect(() => {
    if (roomId) {
      loadLatestMessages();
    } else {
      setMessages([]);
    }
  }, [roomId, loadLatestMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    loadMessages,
    loadLatestMessages,
    sendMessage: sendNewMessage,
    addMessage,
    clearError: () => setError(null),
  };
};
