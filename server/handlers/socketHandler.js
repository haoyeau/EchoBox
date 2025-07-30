const MessageService = require('../services/messageService');
const RoomService = require('../services/roomService');

class SocketHandler {
    constructor(io) {
        this.io = io;
    }

    handleConnection(socket) {
        console.log('A user connected:', socket.id);

        // Listen for a user joining a room
        socket.on('joinRoom', async ({ roomId }) => {
            try {
                // Verify room exists before joining
                const roomExists = await RoomService.roomExists(roomId);
                if (!roomExists) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                socket.join(roomId);
                console.log(`User ${socket.id} joined room: ${roomId}`);
                
                // Optionally, send recent messages to the newly joined user
                const recentMessages = await MessageService.getLatestMessages(roomId, 20);
                socket.emit('roomHistory', recentMessages);
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Listen for messages sent to a specific room
        socket.on('sendMessage', async ({ roomId, message }) => {
            try {
                // Extract message content (remove sender information)
                const content = typeof message === 'string' ? message : message.content;

                // Store the message in the database (anonymous)
                const savedMessage = await MessageService.createMessage(roomId, content);
                
                // Broadcast the message to all users in the room (without sender info)
                this.io.to(roomId).emit('newMessage', {
                    id: savedMessage.id,
                    content: savedMessage.content,
                    timestamp: savedMessage.timestamp
                });

                console.log(`Anonymous message sent to room ${roomId}: ${content}`);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: error.message || 'Failed to send message' });
            }
        });

        // Listen for a user leaving a room
        socket.on('leaveRoom', ({ roomId }) => {
            socket.leave(roomId);
            console.log(`User ${socket.id} left room: ${roomId}`);
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    }
}

module.exports = SocketHandler;
