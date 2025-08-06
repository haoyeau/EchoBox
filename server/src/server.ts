import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import database from './config/prisma';
import apiRoutes from './routes/api';
import SocketHandler from './handlers/socketHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/build')));
}

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file in production
if (process.env.NODE_ENV === 'production') {
    app.get('/*index', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
});

// Initialize socket handler
const socketHandler = new SocketHandler(io);
io.on('connection', (socket) => socketHandler.handleConnection(socket));

// Initialize database and start server
async function startServer(): Promise<void> {
    try {
        await database.connect();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

// Start the server initialization
startServer();

export { app, httpServer };
