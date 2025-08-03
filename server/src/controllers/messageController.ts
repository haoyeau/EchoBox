import { Request, Response } from 'express';
import MessageService from '../services/messageService';

const getRoomMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;

        const result = await MessageService.getRoomMessages(roomId, page, limit);
        res.json(result);
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        if (error.message === 'Room not found') {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

const getLatestMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const messages = await MessageService.getLatestMessages(roomId, limit);
        res.json(messages);
    } catch (error: any) {
        console.error('Error fetching latest messages:', error);
        if (error.message === 'Room not found') {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch latest messages' });
    }
};

const deleteRoomMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const deletedMessages = await MessageService.deleteRoomMessages(roomId);
        res.json({ 
            message: 'Messages deleted successfully', 
            deletedCount: deletedMessages.length 
        });
    } catch (error: any) {
        console.error('Error deleting messages:', error);
        res.status(500).json({ error: 'Failed to delete messages' });
    }
};

export {
    getRoomMessages,
    getLatestMessages,
    deleteRoomMessages
};
