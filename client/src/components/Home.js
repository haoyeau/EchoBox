import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, MessageCircle, Users } from 'lucide-react';
import { api } from '../services/api';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await api.getRooms();
      setRooms(roomsData);
    } catch (err) {
      setError('Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setIsCreating(true);
      const newRoom = await api.createRoom(newRoomName.trim());
      setRooms(prev => [newRoom, ...prev]);
      setNewRoomName('');
      // Automatically navigate to the new room
      navigate(`/room/${newRoom.id}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
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
        <p>Create rooms and chat with others in real-time</p>
      </div>

      {error && (
        <div className="error">
          {error}
          <button onClick={loadRooms} style={{ marginLeft: '1rem' }}>
            Retry
          </button>
        </div>
      )}

      <div className="create-room-section">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b' }}>
          Create a New Room
        </h2>
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            placeholder="Enter room name..."
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
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
          Available Rooms ({rooms.length})
        </h2>
        
        {rooms.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} style={{ margin: '0 auto 1rem' }} />
            <h3>No rooms yet</h3>
            <p>Create the first room to start chatting!</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="room-card"
                onClick={() => handleRoomClick(room.id)}
              >
                <div className="room-name">{room.name}</div>
                <div className="room-info">
                  <Users size={16} />
                  <span>Room ID: {room.id.slice(0, 8)}...</span>
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
