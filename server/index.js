const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());

// temporary in-memory storage for rooms
const rooms = {};

// create a new room
app.post('/api/rooms',  (req, res) => {
    const roomName = req.body.name;
    const roomId = require('crypto').randomUUID();
    rooms[roomId] = { id: roomId, name: roomName, messages: [] };
    res.json({ id: roomId, name: roomName });
});

// get all rooms
app.get('/api/rooms', (req, res) => {
    res.json(Object.values(rooms));
});


// send a message to a room
app.post('/api/rooms/:roomId/messages', (req, res) => {
    const roomId = req.params.roomId;
    const message = req.body.message;
    if (!rooms[roomId]) {
        return res.status(404).json({ error: 'Room not found' });
    }
    const newMessage = { content: message };
    rooms[roomId].messages.push(newMessage);
    res.sendStatus(200);
});

// get messages from a room
app.get('/api/rooms/:roomId/messages', (req, res) => {
    const roomId = req.params.roomId;
    if (!rooms[roomId]) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json(rooms[roomId].messages);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

