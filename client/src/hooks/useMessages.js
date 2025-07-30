import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useSocket } from '../contexts/SocketContext';

export const useMessages = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const { onNewMessage, onRoomHistory, sendMessage, isConnected } = useSocket();
  const messagesRef = useRef([]);

  // Keep messages ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const loadMessages = useCallback(async (page = 1, limit = 100) => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.getRoomMessages(roomId, page, limit);
      
      // Handle both paginated and simple array responses
      const messagesData = response.messages || response;
      setMessages(messagesData);
      
      return response.pagination || null;
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const loadLatestMessages = useCallback(async (limit = 50) => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      const messagesData = await api.getLatestMessages(roomId, limit);
      setMessages(messagesData);
    } catch (err) {
      setError(err.message || 'Failed to load latest messages');
      console.error('Error loading latest messages:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const addMessage = useCallback((newMessage) => {
    setMessages(prev => {
      // Avoid duplicates by checking if message already exists
      const exists = prev.some(msg => 
        msg.id === newMessage.id || 
        (msg.content === newMessage.content && 
         msg.sender === newMessage.sender && 
         Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 1000)
      );
      
      if (exists) return prev;
      
      return [...prev, {
        ...newMessage,
        timestamp: newMessage.timestamp || new Date().toISOString(),
      }];
    });
  }, []);

  const sendNewMessage = useCallback(async (content) => {
    if (!content.trim() || !roomId || !isConnected) return false;
    
    try {
      setSending(true);
      setError(null);
      
      // Send via socket - the server will handle persistence and broadcasting
      sendMessage(roomId, content.trim());
      
      return true;
    } catch (err) {
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
    const cleanupRoomHistory = onRoomHistory?.((historyMessages) => {
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
