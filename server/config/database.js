const { Pool } = require('pg');

class Database {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    async query(text, params) {
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Executed query', { text, duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    async getClient() {
        return this.pool.connect();
    }

    async close() {
        return this.pool.end();
    }

    async initializeTables() {
        try {
            // Create rooms table
            await this.query(`
                CREATE TABLE IF NOT EXISTS rooms (
                    id UUID PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create messages table
            await this.query(`
                CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create index for better query performance
            await this.query(`
                CREATE INDEX IF NOT EXISTS idx_messages_room_id 
                ON messages(room_id)
            `);

            await this.query(`
                CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
                ON messages(timestamp)
            `);

            console.log('Database tables initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }
}

module.exports = new Database();
