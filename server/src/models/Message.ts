import database from '../config/database';

export interface MessageData {
    id: number;
    room_id: string;
    content: string;
    timestamp: Date;
}

class Message {
    static async create(roomId: string, content: string): Promise<MessageData> {
        const query = `
            INSERT INTO messages (room_id, content) 
            VALUES ($1, $2) 
            RETURNING *
        `;
        const result = await database.query(query, [roomId, content]);
        return result.rows[0] as MessageData;
    }

    static async findByRoomId(roomId: string, limit: number = 100, offset: number = 0): Promise<MessageData[]> {
        const query = `
            SELECT id, content, timestamp 
            FROM messages 
            WHERE room_id = $1 
            ORDER BY timestamp ASC 
            LIMIT $2 OFFSET $3
        `;
        const result = await database.query(query, [roomId, limit, offset]);
        return result.rows as MessageData[];
    }

    static async getMessageCount(roomId: string): Promise<number> {
        const query = 'SELECT COUNT(*) FROM messages WHERE room_id = $1';
        const result = await database.query(query, [roomId]);
        return parseInt(result.rows[0].count);
    }

    static async deleteByRoomId(roomId: string): Promise<MessageData[]> {
        const query = 'DELETE FROM messages WHERE room_id = $1 RETURNING *';
        const result = await database.query(query, [roomId]);
        return result.rows as MessageData[];
    }

    static async getLatestMessages(roomId: string, limit: number = 50): Promise<MessageData[]> {
        const query = `
            SELECT id, content, timestamp 
            FROM messages 
            WHERE room_id = $1 
            ORDER BY timestamp DESC 
            LIMIT $2
        `;
        const result = await database.query(query, [roomId, limit]);
        return result.rows.reverse() as MessageData[]; // Return in chronological order
    }
}

export default Message;
