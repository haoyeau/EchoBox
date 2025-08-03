import { Request, Response } from 'express';
import RoomService from '../services/roomService';

const createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const room = await RoomService.createRoom(name);
        res.status(201).json(room);
    } catch (error: any) {
        console.error('Error creating room:', error);
        if (error.message === 'Room name is required' || error.message === 'Room name is too long') {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to create room' });
    }
};

const getAllRooms = async (req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await RoomService.getAllRooms();
        res.json(rooms);
    } catch (error: any) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

const getRoomById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const room = await RoomService.getRoomById(roomId);
        res.json(room);
    } catch (error: any) {
        console.error('Error fetching room:', error);
        if (error.message === 'Room not found') {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch room' });
    }
};

export {
    createRoom,
    getAllRooms,
    getRoomById
};
