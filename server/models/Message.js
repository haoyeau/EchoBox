const database = require('../config/database');

class Message {
    static async create(roomId, content) {
        const query = `
            INSERT INTO messages (room_id, content) 
            VALUES ($1, $2) 
            RETURNING *
        `;
        const result = await database.query(query, [roomId, content]);
        return result.rows[0];
    }

    static async findByRoomId(roomId, limit = 100, offset = 0) {
        const query = `
            SELECT id, content, timestamp 
            FROM messages 
            WHERE room_id = $1 
            ORDER BY timestamp ASC 
            LIMIT $2 OFFSET $3
        `;
        const result = await database.query(query, [roomId, limit, offset]);
        return result.rows;
    }

    static async getMessageCount(roomId) {
        const query = 'SELECT COUNT(*) FROM messages WHERE room_id = $1';
        const result = await database.query(query, [roomId]);
        return parseInt(result.rows[0].count);
    }

    static async deleteByRoomId(roomId) {
        const query = 'DELETE FROM messages WHERE room_id = $1 RETURNING *';
        const result = await database.query(query, [roomId]);
        return result.rows;
    }

    static async getLatestMessages(roomId, limit = 50) {
        const query = `
            SELECT id, content, timestamp 
            FROM messages 
            WHERE room_id = $1 
            ORDER BY timestamp DESC 
            LIMIT $2
        `;
        const result = await database.query(query, [roomId, limit]);
        return result.rows.reverse(); // Return in chronological order
    }
}

module.exports = Message;
