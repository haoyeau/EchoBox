import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, MessageCircle, Users, Calendar } from 'lucide-react';
import { useRooms } from '../hooks/useRooms';

const Home = () => {
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  
  const { 
    rooms, 
    loading, 
    error, 
    createRoom, 
    clearError 
  } = useRooms();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setIsCreating(true);
      const newRoom = await createRoom(newRoomName.trim());
      setNewRoomName('');
      // Automatically navigate to the new room
      navigate(`/room/${newRoom.id}`);
    } catch (err) {
      // Error is already handled by the hook
      console.error('Failed to create room:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="header">
        <h1>EchoBox</h1>
        <p>Where every voice matters - anonymous, focused discussions without judgment</p>
        <div className="vision-subtitle">
          <span>✨ Share ideas freely</span>
          <span>🎯 Stay on topic</span>
          <span>🤝 Speak without concerns</span>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
          <button onClick={clearError} style={{ marginLeft: '1rem' }}>
            Dismiss
          </button>
        </div>
      )}

      <div className="create-room-section">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1e293b' }}>
          Start a Focused Discussion
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#64748b', fontSize: '1rem' }}>
          Create a topic-centered space where ideas can be shared openly and anonymously
        </p>
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            placeholder="Enter discussion topic (e.g., 'Climate Solutions', 'Remote Work Culture')..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="room-input"
            disabled={isCreating}
          />
          <button 
            type="submit" 
            className="create-btn"
            disabled={isCreating || !newRoomName.trim()}
          >
            <Plus size={20} />
            {isCreating ? 'Creating Discussion...' : 'Start Discussion'}
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
          Active Discussions ({rooms.length})
        </h2>
        
        {rooms.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} style={{ margin: '0 auto 1rem' }} />
            <h3>No discussions yet</h3>
            <p>Start the first topic-focused discussion where everyone can contribute freely!</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="room-card"
                onClick={() => handleRoomClick(room.id)}
              >
                <div className="room-header">
                  <div className="room-name">{room.name}</div>
                </div>
                <div className="room-info">
                  <div className="room-meta">
                    <Calendar size={16} />
                    <span>Created {formatDate(room.created_at)}</span>
                  </div>
                  <div className="room-join">
                    <Users size={16} />
                    <span>Join Discussion</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
