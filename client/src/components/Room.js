import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, ArrowLeft, Users, Loader2 } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useMessages } from '../hooks/useMessages';
import { useRooms } from '../hooks/useRooms';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isConnected, joinRoom, leaveRoom, connectionError } = useSocket();
  const { getRoom } = useRooms();
  
  const [newMessage, setNewMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState(null);
  
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sending,
    sendMessage,
    clearError: clearMessagesError
  } = useMessages(roomId);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load room data
  useEffect(() => {
    const loadRoomData = async () => {
      if (!roomId) return;

      try {
        setRoomLoading(true);
        setRoomError(null);
        const room = await getRoom(roomId);
        setRoomName(room.name);
      } catch (err) {
        setRoomError(err.message || 'Room not found');
        console.error('Error loading room data:', err);
      } finally {
        setRoomLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, getRoom]);

  // Join room when connected
  useEffect(() => {
    if (roomId && isConnected) {
      joinRoom(roomId);
    }

    return () => {
      if (roomId) {
        leaveRoom(roomId);
      }
    };
  }, [roomId, isConnected, joinRoom, leaveRoom]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const success = await sendMessage(newMessage.trim());
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          dateLabel: formatMessageDate(message.timestamp),
          messages: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });

    return groups;
  };

  if (roomLoading) {
    return (
      <div className="room-container">
        <div className="room-header">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="room-info">
            <h2>Loading...</h2>
          </div>
        </div>
        <div className="loading-messages">
          <Loader2 size={24} className="spinning" />
          <span>Loading room...</span>
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="room-container">
        <div className="room-header">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="room-info">
            <h2>Error</h2>
          </div>
        </div>
        <div className="error-state">
          <h3>Room not found</h3>
          <p>{roomError}</p>
          <button onClick={handleBack} className="btn-primary">
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="room-container">
      <div className="room-header">
        <button onClick={handleBack} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div className="room-info">
          <h2>{roomName}</h2>
          <div className="connection-status">
            {isConnected ? (
              <span className="status-connected">
                <Users size={16} />
                Connected
              </span>
            ) : (
              <span className="status-disconnected">
                <Users size={16} />
                {connectionError ? 'Connection error' : 'Disconnected'}
              </span>
            )}
          </div>
        </div>
      </div>

      {(messagesError || connectionError) && (
        <div className="message-error">
          <span>{messagesError || connectionError}</span>
          {messagesError && (
            <button onClick={clearMessagesError} className="error-dismiss">
              ×
            </button>
          )}
        </div>
      )}

      <div className="messages-container">
        {messagesLoading ? (
          <div className="loading-messages">
            <Loader2 size={24} className="spinning" />
            <span>Loading messages...</span>
          </div>
        ) : messageGroups.length === 0 ? (
          <div className="empty-messages">
            <h3>Discussion starts here</h3>
            <p>Share your thoughts anonymously - every perspective matters!</p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date} className="message-group">
              <div className="date-separator">
                <span>{group.dateLabel}</span>
              </div>
              {group.messages.map((message, index) => (
                <div key={message.id || `${group.date}-${index}`} className="message">
                  <div className="message-header">
                    <span className="message-time">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            ref={inputRef}
            type="text"
            placeholder={isConnected ? "Share your thoughts on this topic..." : "Connecting..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="message-input"
            disabled={!isConnected || sending}
            maxLength={1000}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={!newMessage.trim() || !isConnected || sending}
          >
            {sending ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Room;
