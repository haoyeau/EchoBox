import express from 'express';
import { createRoom, getAllRooms, getRoomById } from '../controllers/roomController';
import { getRoomMessages, getLatestMessages, deleteRoomMessages } from '../controllers/messageController';

const router = express.Router();

// Room routes
router.post('/rooms', createRoom);
router.get('/rooms', getAllRooms);
router.get('/rooms/:roomId', getRoomById);

// Message routes
router.get('/rooms/:roomId/messages', getRoomMessages);
router.get('/rooms/:roomId/messages/latest', getLatestMessages);

export default router;
