const RoomService = require('../services/roomService');

const createRoom = async (req, res) => {
    try {
        const { name } = req.body;
        const room = await RoomService.createRoom(name);
        res.status(201).json(room);
    } catch (error) {
        console.error('Error creating room:', error);
        if (error.message === 'Room name is required' || error.message === 'Room name is too long') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create room' });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await RoomService.getAllRooms();
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await RoomService.getRoomById(roomId);
        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        if (error.message === 'Room not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch room' });
    }
};

module.exports = {
    createRoom,
    getAllRooms,
    getRoomById
};
