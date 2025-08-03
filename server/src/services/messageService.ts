import Message, { MessageData } from '../models/Message';
import RoomService from './roomService';

export interface PaginationResult {
    messages: MessageData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class MessageService {
    static async createMessage(roomId: string, content: string): Promise<MessageData> {
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

    static async getRoomMessages(roomId: string, page: number = 1, limit: number = 100): Promise<PaginationResult> {
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

    static async getLatestMessages(roomId: string, limit: number = 50): Promise<MessageData[]> {
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

    static async deleteRoomMessages(roomId: string): Promise<MessageData[]> {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        return await Message.deleteByRoomId(roomId);
    }
}

export default MessageService;
