// Test utilities for server-side testing

export interface MockRoom {
  id: string;
  name: string;
  createdAt?: Date;
}

export interface MockMessage {
  id: number;
  roomId: string;
  content: string;
  timestamp: Date;
}

export interface MockSocket {
  id: string;
  join: jest.Mock<any, any>;
  leave: jest.Mock<any, any>;
  emit: jest.Mock<any, any>;
  on: jest.Mock<any, any>;
  broadcast: {
    to: jest.Mock<any, any>;
    emit: jest.Mock<any, any>;
  };
}

export interface MockIo {
  to: jest.Mock<any, any>;
  emit: jest.Mock<any, any>;
  sockets: {
    in: jest.Mock<any, any>;
    emit: jest.Mock<any, any>;
  };
}

/**
 * Mock database query responses
 */
export const mockDatabaseQuery = (mockData: any[]) => {
  const database = require('../../config/database');
  database.query.mockResolvedValue({ rows: mockData });
  return database;
};

/**
 * Mock database query error
 */
export const mockDatabaseError = (error: Error) => {
  const database = require('../../config/database');
  database.query.mockRejectedValue(error);
  return database;
};

/**
 * Create mock room data
 */
export const createMockRoom = (overrides: Partial<MockRoom> = {}): MockRoom => ({
  id: 'room-123',
  name: 'Test Room',
  createdAt: new Date(),
  ...overrides
});

/**
 * Create mock message data
 */
export const createMockMessage = (overrides: Partial<MockMessage> = {}): MockMessage => ({
  id: 1,
  roomId: 'room-123',
  content: 'Test message',
  timestamp: new Date(),
  ...overrides
});

/**
 * Create mock socket for testing
 */
export const createMockSocket = (): MockSocket => ({
  id: 'socket-123',
  join: jest.fn(),
  leave: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  broadcast: {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  }
});

/**
 * Create mock io for testing
 */
export const createMockIo = (): MockIo => ({
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
  sockets: {
    in: jest.fn().mockReturnThis(),
    emit: jest.fn()
  }
});

/**
 * Setup test database with common mock responses
 */
export const setupTestDatabase = () => {
  const database = require('../../config/database');
  
  // Default successful responses
  database.query
    .mockResolvedValueOnce({ rows: [createMockRoom()] }) // Room creation
    .mockResolvedValueOnce({ rows: [{ exists: true }] }) // Room exists check
    .mockResolvedValueOnce({ rows: [createMockMessage()] }); // Message creation
  
  return database;
};

/**
 * Clean up mocks after tests
 */
export const cleanupMocks = (): void => {
  jest.clearAllMocks();
  jest.resetModules();
};

/**
 * Assert error response format
 */
export const expectErrorResponse = (response: any, status: number, message?: string): void => {
  expect(response.status).toBe(status);
  expect(response.body).toHaveProperty('error');
  if (message) {
    expect(response.body.error).toBe(message);
  }
};

/**
 * Assert successful response format
 */
export const expectSuccessResponse = (response: any, status: number = 200): void => {
  expect(response.status).toBe(status);
  expect(response.body).toBeDefined();
};

// Simple test to make this file valid for Jest
describe('Test Utils', () => {
  test('should export utility functions', () => {
    expect(typeof mockDatabaseQuery).toBe('function');
    expect(typeof createMockRoom).toBe('function');
    expect(typeof createMockMessage).toBe('function');
  });
});
