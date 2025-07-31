// Test utilities for server-side testing

/**
 * Mock database query responses
 */
const mockDatabaseQuery = (mockData) => {
  const database = require('../../config/database');
  database.query.mockResolvedValue({ rows: mockData });
  return database;
};

/**
 * Mock database query error
 */
const mockDatabaseError = (error) => {
  const database = require('../../config/database');
  database.query.mockRejectedValue(error);
  return database;
};

/**
 * Create mock room data
 */
const createMockRoom = (overrides = {}) => ({
  id: 'room-123',
  name: 'Test Room',
  created_at: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock message data
 */
const createMockMessage = (overrides = {}) => ({
  id: 1,
  room_id: 'room-123',
  content: 'Test message',
  timestamp: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock socket for testing
 */
const createMockSocket = () => ({
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
const createMockIo = () => ({
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
const setupTestDatabase = () => {
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
const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.resetModules();
};

/**
 * Assert error response format
 */
const expectErrorResponse = (response, status, message) => {
  expect(response.status).toBe(status);
  expect(response.body).toHaveProperty('error');
  if (message) {
    expect(response.body.error).toBe(message);
  }
};

/**
 * Assert successful response format
 */
const expectSuccessResponse = (response, status = 200) => {
  expect(response.status).toBe(status);
  expect(response.body).toBeDefined();
};

module.exports = {
  mockDatabaseQuery,
  mockDatabaseError,
  createMockRoom,
  createMockMessage,
  createMockSocket,
  createMockIo,
  setupTestDatabase,
  cleanupMocks,
  expectErrorResponse,
  expectSuccessResponse
};

// Simple test to make this file valid for Jest
describe('Test Utils', () => {
  test('should export utility functions', () => {
    expect(typeof mockDatabaseQuery).toBe('function');
    expect(typeof createMockRoom).toBe('function');
    expect(typeof createMockMessage).toBe('function');
  });
});
