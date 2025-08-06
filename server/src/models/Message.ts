import database from '../config/prisma';
import { Message as PrismaMessage } from '@prisma/client';

export interface MessageData {
    id: number;
    roomId: string;
    content: string;
    timestamp: Date;
}

class Message {
    static async create(roomId: string, content: string): Promise<MessageData> {
        const message = await database.prisma.message.create({
            data: {
                roomId,
                content,
            },
        });
        return {
            id: message.id,
            roomId: message.roomId,
            content: message.content,
            timestamp: message.timestamp,
        };
    }

    static async findByRoomId(roomId: string, limit: number = 100, offset: number = 0): Promise<MessageData[]> {
        const messages = await database.prisma.message.findMany({
            where: { roomId },
            orderBy: { timestamp: 'asc' },
            take: limit,
            skip: offset,
            select: {
                id: true,
                content: true,
                timestamp: true,
                roomId: true,
            },
        });
        return messages.map(message => ({
            id: message.id,
            roomId: message.roomId,
            content: message.content,
            timestamp: message.timestamp,
        }));
    }

    static async getMessageCount(roomId: string): Promise<number> {
        return await database.prisma.message.count({
            where: { roomId },
        });
    }

    static async deleteByRoomId(roomId: string): Promise<MessageData[]> {
        const messages = await database.prisma.message.findMany({
            where: { roomId },
        });
        
        await database.prisma.message.deleteMany({
            where: { roomId },
        });
        
        return messages.map(message => ({
            id: message.id,
            roomId: message.roomId,
            content: message.content,
            timestamp: message.timestamp,
        }));
    }

    static async getLatestMessages(roomId: string, limit: number = 50): Promise<MessageData[]> {
        const messages = await database.prisma.message.findMany({
            where: { roomId },
            orderBy: { timestamp: 'desc' },
            take: limit,
            select: {
                id: true,
                content: true,
                timestamp: true,
                roomId: true,
            },
        });
        // Return in chronological order
        return messages.reverse().map(message => ({
            id: message.id,
            roomId: message.roomId,
            content: message.content,
            timestamp: message.timestamp,
        }));
    }
}

export default Message;
