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
- **Vite** for fast development and optimized builds
- **Custom TypeScript hooks** for rooms and messages with proper typing
- **Socket.io-client** with typed event interfaces
- **Error boundary** with comprehensive error handling
- **React Router** for type-safe navigation
- **Shared type definitions** for API contracts

### Server (Node.js + TypeScript)
- **Express.js REST API** with TypeScript and proper typing
- **Socket.io** for WebSocket connections with typed events
- **PostgreSQL** with **Prisma ORM** for type-safe database operations
- **Layered architecture** (Controllers → Services → Models) with full typing
- **Environment-based configuration** with type validation
- **Compiled output** to JavaScript for production

### Type Safety
- **Shared interfaces** between client and server
- **Prisma-generated types** for database operations with full type safety
- **API request/response typing** for full-stack type safety
- **Socket event typing** for real-time communication
- **Strict TypeScript configuration** for maximum safety

## 🧪 Testing

EchoBox includes a comprehensive test suite covering both client and server components:

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

## 🚀 Quick Start

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

4. **Setup database schema**
   ```bash
   cd server
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

5. **Start development servers**
   ```bash
   npm run start:dev
   ```

### Development Workflow
```bash
# Install dependencies for both client and server
npm run install:all

# Setup database (first time only)
cd server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
cd ..

# Start both client and server in development mode with hot reloading
npm run start:dev

# Build for production
npm run build  # Builds both client and server

# Database operations
cd server
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:migrate   # Create and apply migrations

# Run TypeScript type checking
cd server && npx tsc --noEmit
cd client && npm run type-check

# Run TypeScript compilation for server
cd server && npm run build

# Run individual test suites
npm run test:server:watch    # Server tests in watch mode
npm run test:client:watch    # Client tests in watch mode
```

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with **Prisma ORM** for type-safe operations
- **Real-time**: Socket.io with typed events
- **Testing**: Vitest, React Testing Library, Supertest
- **Build**: Vite, TypeScript compiler

### TypeScript Features
- **Strict type checking** for compile-time error prevention
- **Shared type definitions** between client and server
- **Typed API contracts** for request/response interfaces
- **Prisma-generated types** for database operations with full type safety
- **Socket event typing** for real-time communication
- **Modern ES2020+ features** with full type support
- **Test Type Safety**: All tests written in TypeScript with proper mock typing
- **Consolidated Configuration**: Single TypeScript setup per environment

### Database & ORM
- **Prisma ORM** for type-safe database operations
- **Auto-generated TypeScript types** from database schema
- **Migration management** with version control
- **Prisma Studio** for database GUI and exploration
- **Connection pooling** and query optimization

### Project Structure

```
├── client/                     # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # TSX React components
│   │   ├── contexts/           # Typed React contexts
│   │   ├── hooks/              # Custom TypeScript hooks
│   │   ├── services/           # API service layer
│   │   ├── types/              # Shared type definitions
│   │   ├── config/             # Environment configuration
│   │   └── __tests__/          # TypeScript test files (.tsx)
│   ├── tsconfig.json           # Client TypeScript configuration
│   ├── vite.config.ts          # Vite configuration with TypeScript
│   └── package.json
│
├── server/                     # Node.js TypeScript backend
│   ├── src/
│   │   ├── controllers/        # Express route controllers
│   │   ├── services/           # Business logic layer
│   │   ├── models/             # Data access layer with Prisma
│   │   ├── handlers/           # Socket.io event handlers
│   │   ├── routes/             # API route definitions
│   │   ├── config/             # Database and Prisma configuration
│   │   └── types/              # Server-specific type definitions
│   ├── __tests__/              # TypeScript test files (.ts)
│   ├── prisma/
│   │   └── schema.prisma       # Database schema definition
│   ├── dist/                   # Compiled JavaScript output
│   ├── tsconfig.json           # Unified TypeScript configuration
│   ├── jest.config.ts          # Jest configuration with TypeScript
│   └── package.json
│
└── package.json                # Workspace scripts
```

## 📄 License
This project is licensed under the ISC License.
