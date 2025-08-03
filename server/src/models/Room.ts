import database from '../config/database';
import { randomUUID } from 'crypto';

export interface RoomData {
    id: string;
    name: string;
    created_at?: Date;
}

class Room {
    static async create(name: string): Promise<RoomData> {
        const id = randomUUID();
        const query = 'INSERT INTO rooms (id, name) VALUES ($1, $2) RETURNING *';
        const result = await database.query(query, [id, name]);
        return result.rows[0] as RoomData;
    }

    static async findAll(): Promise<RoomData[]> {
        const query = 'SELECT id, name, created_at FROM rooms ORDER BY created_at DESC';
        const result = await database.query(query);
        return result.rows as RoomData[];
    }

    static async findById(id: string): Promise<RoomData | undefined> {
        const query = 'SELECT * FROM rooms WHERE id = $1';
        const result = await database.query(query, [id]);
        return result.rows[0] as RoomData | undefined;
    }

    static async delete(id: string): Promise<RoomData | undefined> {
        const query = 'DELETE FROM rooms WHERE id = $1 RETURNING *';
        const result = await database.query(query, [id]);
        return result.rows[0] as RoomData | undefined;
    }

    static async exists(id: string): Promise<boolean> {
        const query = 'SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)';
        const result = await database.query(query, [id]);
        return result.rows[0].exists as boolean;
    }
}

export default Room;
