const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const messageController = require('../controllers/messageController');

// Room routes
router.post('/rooms', roomController.createRoom);
router.get('/rooms', roomController.getAllRooms);
router.get('/rooms/:roomId', roomController.getRoomById);

// Message routes
router.get('/rooms/:roomId/messages', messageController.getRoomMessages);
router.get('/rooms/:roomId/messages/latest', messageController.getLatestMessages);

module.exports = router;
