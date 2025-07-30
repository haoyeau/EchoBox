const Message = require('../models/Message');
const RoomService = require('./roomService');

class MessageService {
    static async createMessage(roomId, content) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        if (!content || content.trim().length === 0) {
            throw new Error('Message content is required');
        }

        // Verify room exists
        const roomExists = await RoomService.roomExists(roomId);
        if (!roomExists) {
            throw new Error('Room not found');
        }

        return await Message.create(roomId, content.trim());
    }

    static async getRoomMessages(roomId, page = 1, limit = 100) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        // Verify room exists
        const roomExists = await RoomService.roomExists(roomId);
        if (!roomExists) {
            throw new Error('Room not found');
        }

        const offset = (page - 1) * limit;
        const messages = await Message.findByRoomId(roomId, limit, offset);
        const totalCount = await Message.getMessageCount(roomId);

        return {
            messages,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    static async getLatestMessages(roomId, limit = 50) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        // Verify room exists
        const roomExists = await RoomService.roomExists(roomId);
        if (!roomExists) {
            throw new Error('Room not found');
        }

        return await Message.getLatestMessages(roomId, limit);
    }

    static async deleteRoomMessages(roomId) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        return await Message.deleteByRoomId(roomId);
    }
}

module.exports = MessageService;
