# EchoBox

A thoughtful discussion platform built with **TypeScript**, **React**, and **Node.js**, designed to encourage focused conversations where every participant can speak without concerns. EchoBox promotes meaningful dialogue by removing barriers to participation through anonymity and topic-centered discussions.


## ✨ Features

- **Anonymous participation** - No registration or profiles required
- **Topic-focused rooms** - Create dedicated spaces for specific discussions
- **Real-time communication** - Instant messaging with Socket.io
- **Safe environment** - No permanent user identities or message history tracking
- **Clean, distraction-free UI** - Focus remains on the conversation
- **Ephemeral by design** - Conversations exist in the moment
- **Type-safe development** - Full TypeScript coverage for better reliability

## 🏗️ Architecture

### Client (React + TypeScript)
- **React 19** with TypeScript and TSX components
- **Custom TypeScript hooks** for rooms and messages with proper typing
- **Socket.io-client** with typed event interfaces
- **Error boundary** with comprehensive error handling
- **React Router** for type-safe navigation
- **Shared type definitions** for API contracts

### Server (Node.js + TypeScript)
- **Express.js REST API** with TypeScript and proper typing
- **Socket.io** for WebSocket connections with typed events
- **PostgreSQL** with typed query interfaces
- **Layered architecture** (Controllers → Services → Models) with full typing
- **Environment-based configuration** with type validation
- **Compiled output** to JavaScript for production

### Type Safety
- **Shared interfaces** between client and server
- **Database query typing** with PostgreSQL types
- **API request/response typing** for full-stack type safety
- **Socket event typing** for real-time communication
- **Strict TypeScript configuration** for maximum safety

## 🧪 Testing

EchoBox includes a comprehensive test suite covering both client and server components with TypeScript support:

### Test Coverage
- **Unit Tests**: Service logic, API functions, React hooks (TypeScript)
- **Component Tests**: React component behavior with proper typing
- **Socket Tests**: WebSocket event handling with typed events
- **Type Tests**: TypeScript compilation and type checking

### Running Tests

```bash
# Run all tests
npm test

# Run client tests only
npm run test:client

# Run server tests only  
npm run test:server

# Run with coverage
npm run test:client:coverage
npm run test:server:coverage

# Watch mode for development
npm run test:watch
```

### Test Structure

```
server/__tests__/
├── controllers/     # API endpoint tests
├── services/        # Business logic tests  
├── models/          # Data layer tests
├── handlers/        # Socket handler tests
└── utils/           # Test utilities

client/src/__tests__/
├── components/      # React component tests
├── hooks/           # Custom hook tests
├── services/        # API service tests
└── utils/           # Test utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Setup environment**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env.local
   ```

3. **Configure database** (Update `server/.env` with your PostgreSQL connection)

4. **Build TypeScript (for production)**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Start development servers**
   ```bash
   npm run start:dev
   ```

### Development Workflow

```bash
# Install dependencies for both client and server
npm run install:all

# Start both client and server in development mode with hot reloading
npm run start:dev

# Build TypeScript files
cd server && npm run build  # Compiles to dist/
cd client && npm run build  # Builds React app

# Run TypeScript type checking
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit
```

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: React 19, TypeScript, TSX components
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with typed queries
- **Real-time**: Socket.io with typed events
- **Testing**: Jest, React Testing Library, Supertest
- **Build**: TypeScript compiler, React Scripts

### TypeScript Features
- **Strict type checking** for compile-time error prevention
- **Shared type definitions** between client and server
- **Typed API contracts** for request/response interfaces
- **Database type safety** with PostgreSQL types
- **Socket event typing** for real-time communication
- **Modern ES2020+ features** with full type support

### Project Structure

```
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # TSX React components
│   │   ├── contexts/       # Typed React contexts
│   │   ├── hooks/          # Custom TypeScript hooks
│   │   ├── services/       # API service layer
│   │   ├── types/          # Shared type definitions
│   │   └── config/         # Environment configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
│
├── server/                 # Node.js TypeScript backend
│   ├── src/
│   │   ├── controllers/    # Express route controllers
│   │   ├── services/       # Business logic layer
│   │   ├── models/         # Data access layer
│   │   ├── handlers/       # Socket.io event handlers
│   │   ├── routes/         # API route definitions
│   │   └── config/         # Database configuration
│   ├── dist/               # Compiled JavaScript output
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json
│
└── package.json              # Workspace scripts
```

## 📚 API Documentation

### REST Endpoints
- `GET /api/rooms` - Get all discussion rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get specific room details
- `GET /api/rooms/:id/messages` - Get room messages (paginated)
- `GET /api/rooms/:id/messages/latest` - Get latest messages

### Socket Events
- `joinRoom` - Join a discussion room
- `leaveRoom` - Leave a discussion room
- `sendMessage` - Send anonymous message
- `newMessage` - Receive new message

All API endpoints and socket events are fully typed with TypeScript interfaces.

## 🎯 Development Benefits

### Type Safety
- **Compile-time error detection** prevents runtime issues
- **IntelliSense support** for better development experience
- **Refactoring safety** with IDE assistance
- **API contract enforcement** between frontend and backend

### Code Quality
- **Consistent interfaces** across the application
- **Self-documenting code** through type definitions
- **Better maintainability** with clear type contracts
- **Team collaboration** with shared type definitions

## 🚀 Deployment

### Production Build
```bash
# Build both client and server
npm run build

# Start production server
npm start
```

### Environment Variables
- Server requires PostgreSQL connection string
- Client can be configured for different API endpoints
- Socket.io endpoints are configurable per environment

## 📄 License

This project is licensed under the ISC License.
