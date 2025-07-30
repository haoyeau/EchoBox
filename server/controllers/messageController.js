const MessageService = require('../services/messageService');

const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;

        const result = await MessageService.getRoomMessages(roomId, page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error fetching messages:', error);
        if (error.message === 'Room not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

const getLatestMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const messages = await MessageService.getLatestMessages(roomId, limit);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching latest messages:', error);
        if (error.message === 'Room not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch latest messages' });
    }
};

const deleteRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const deletedMessages = await MessageService.deleteRoomMessages(roomId);
        res.json({ 
            message: 'Messages deleted successfully', 
            deletedCount: deletedMessages.length 
        });
    } catch (error) {
        console.error('Error deleting messages:', error);
        res.status(500).json({ error: 'Failed to delete messages' });
    }
};

module.exports = {
    getRoomMessages,
    getLatestMessages,
    deleteRoomMessages
};
