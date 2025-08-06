import { PrismaClient } from '@prisma/client';

class Database {
    private static instance: Database;
    public prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect(): Promise<void> {
        try {
            await this.prisma.$connect();
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Failed to connect to database:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
        console.log('Database disconnected');
    }
}

export default Database.getInstance();
