const database = require('../config/database');
const { randomUUID } = require('crypto');

class Room {
    static async create(name) {
        const id = randomUUID();
        const query = 'INSERT INTO rooms (id, name) VALUES ($1, $2) RETURNING *';
        const result = await database.query(query, [id, name]);
        return result.rows[0];
    }

    static async findAll() {
        const query = 'SELECT id, name, created_at FROM rooms ORDER BY created_at DESC';
        const result = await database.query(query);
        return result.rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM rooms WHERE id = $1';
        const result = await database.query(query, [id]);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM rooms WHERE id = $1 RETURNING *';
        const result = await database.query(query, [id]);
        return result.rows[0];
    }

    static async exists(id) {
        const query = 'SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)';
        const result = await database.query(query, [id]);
        return result.rows[0].exists;
    }
}

module.exports = Room;
