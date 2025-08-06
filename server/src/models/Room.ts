import database from '../config/prisma';
import { randomUUID } from 'crypto';
import { Room as PrismaRoom } from '@prisma/client';

export interface RoomData {
    id: string;
    name: string;
    createdAt?: Date;
}

class Room {
    static async create(name: string): Promise<RoomData> {
        const id = randomUUID();
        const room = await database.prisma.room.create({
            data: {
                id,
                name,
            },
        });
        return {
            id: room.id,
            name: room.name,
            createdAt: room.createdAt,
        };
    }

    static async findAll(): Promise<RoomData[]> {
        const rooms = await database.prisma.room.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return rooms.map(room => ({
            id: room.id,
            name: room.name,
            createdAt: room.createdAt,
        }));
    }

    static async findById(id: string): Promise<RoomData | undefined> {
        const room = await database.prisma.room.findUnique({
            where: { id },
        });
        if (!room) return undefined;
        return {
            id: room.id,
            name: room.name,
            createdAt: room.createdAt,
        };
    }

    static async delete(id: string): Promise<RoomData | undefined> {
        try {
            const room = await database.prisma.room.delete({
                where: { id },
            });
            return {
                id: room.id,
                name: room.name,
                createdAt: room.createdAt,
            };
        } catch (error) {
            return undefined;
        }
    }

    static async exists(id: string): Promise<boolean> {
        const room = await database.prisma.room.findUnique({
            where: { id },
            select: { id: true },
        });
        return room !== null;
    }
}

export default Room;
