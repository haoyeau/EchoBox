const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');


const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('A user connected');
    // Listen for a user joining a room
    socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });
    // Listen for messages sent to a specific room
    socket.on('sendMessage', ({ roomId, message }) => {
        // Store the message in the room's history
        if (rooms[roomId]) {
            rooms[roomId].messages.push(message);
        }
        io.to(roomId).emit('newMessage', message);
        console.log(`Message sent to room ${roomId}: ${message}`);
    });
    // Listen for a user leaving a room
    socket.on('leaveRoom', ({ roomId }) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
    });
    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

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


// get history messages from a room
app.get('/api/rooms/:roomId/messages', (req, res) => {
    const roomId = req.params.roomId;
    if (!rooms[roomId]) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json(rooms[roomId].messages);
});


module.exports = { app, httpServer }; // Export app and httpServer for testing purposes
