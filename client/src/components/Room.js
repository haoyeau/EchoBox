import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, ArrowLeft } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../services/api';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected, joinRoom, leaveRoom, sendMessage } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const loadRoomData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        
        // Get all rooms to find the current room's name
        const rooms = await api.getRooms();
        const currentRoom = rooms.find(room => room.id === roomId);
        
        if (!currentRoom) {
            setError('Room not found');
            return;
        }
        
        setRoomName(currentRoom.name);
        
        // Load existing messages
        const messagesData = await api.getRoomMessages(roomId);
        setMessages(messagesData);
    } catch (err) {
        setError('Failed to load room data');
        console.error('Error loading room data:', err);
    } finally {
        setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    // Load room data and join the room
    loadRoomData();
    
    if (socket && isConnected) {
      joinRoom(roomId);
    }

    // Listen for new messages
    if (socket) {
      socket.on('newMessage', handleNewMessage);
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
        leaveRoom(roomId);
      }
    };
  }, [roomId, socket, isConnected, joinRoom, leaveRoom, loadRoomData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !isConnected) return;

    try {
      setSending(true);
      const messageData = {
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        id: Date.now() // Simple ID generation
      };

      sendMessage(roomId, messageData);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      leaveRoom(roomId);
    }
    navigate('/');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="room-container">
        <div className="loading">Loading room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-container">
        <div className="error">
          {error}
          <button onClick={() => navigate('/')} style={{ marginLeft: '1rem' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <div>
          <h1 className="room-title">{roomName}</h1>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
        <button onClick={handleLeaveRoom} className="leave-btn">
          <ArrowLeft size={16} />
          Leave Room
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>No messages yet</h3>
            <p>Be the first to send a message in this room!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id || index} className="message">
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            disabled={!isConnected || sending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={!newMessage.trim() || !isConnected || sending}
          >
            <Send size={16} />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Room;
