# EchoBox

A thoughtful discussion platform built with React and Node.js, designed to encourage focused conversations where every participant can speak without concerns. EchoBox promotes meaningful dialogue by removing barriers to participation through anonymity and topic-centered discussions.

## Features

- **Anonymous participation** - No registration or profiles required
- **Topic-focused rooms** - Create dedicated spaces for specific discussions
- **Real-time communication** - Instant messaging with Socket.io
- **Safe environment** - No permanent user identities or message history tracking
- **Clean, distraction-free UI** - Focus remains on the conversation
- **Ephemeral by design** - Conversations exist in the moment

## Architecture

### Client (React)
- React 19 with hooks for state management
- Socket.io-client for real-time communication
- Custom hooks for rooms and messages
- Error boundary for graceful error handling
- React Router for navigation

### Server (Node.js)
- Express.js REST API
- Socket.io for WebSocket connections
- PostgreSQL with raw SQL queries
- Layered architecture (Controllers → Services → Models)
- Environment-based configuration

## Testing

EchoBox includes a comprehensive test suite covering both client and server components:

### Test Coverage
- **Unit Tests**: Service logic, API functions, React hooks
- **Component Tests**: React component behavior
- **Socket Tests**: WebSocket event handling

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

## Quick Start

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

4. **Run tests**
   ```bash
   npm test
   ```

5. **Start development servers**
   ```bash
   npm run start:dev
   ```

## Technology Stack

- **Frontend**: React, Socket.io-client, React Router
- **Backend**: Node.js, Express, Socket.io, PostgreSQL
- **Testing**: Jest, React Testing Library, Supertest
