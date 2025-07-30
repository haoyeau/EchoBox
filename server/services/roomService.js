const Room = require('../models/Room');

class RoomService {
    static async createRoom(name) {
        if (!name || name.trim().length === 0) {
            throw new Error('Room name is required');
        }

        if (name.length > 255) {
            throw new Error('Room name is too long');
        }

        return await Room.create(name.trim());
    }

    static async getAllRooms() {
        return await Room.findAll();
    }

    static async getRoomById(id) {
        if (!id) {
            throw new Error('Room ID is required');
        }

        const room = await Room.findById(id);
        if (!room) {
            throw new Error('Room not found');
        }

        return room;
    }

    static async roomExists(id) {
        if (!id) {
            return false;
        }
        return await Room.exists(id);
    }
}

module.exports = RoomService;
