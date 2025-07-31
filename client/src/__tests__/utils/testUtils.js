// Utility functions for testing
const { api } = require('../../services/api');

/**
 * Test utilities for client-side testing
 */

/**
 * Mock fetch responses for API testing
 */
export const mockFetchResponse = (data, status = 200, ok = true) => {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(data)
  });
};

/**
 * Mock fetch error
 */
export const mockFetchError = (message) => {
  return Promise.reject(new Error(message));
};

/**
 * Create mock socket for testing
 */
export const createMockSocket = () => {
  const listeners = {};
  
  return {
    on: jest.fn((event, handler) => {
      listeners[event] = handler;
    }),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
    // Helper to trigger events in tests
    _trigger: (event, data) => {
      if (listeners[event]) {
        listeners[event](data);
      }
    }
  };
};

/**
 * Create mock room data
 */
export const createMockRoom = (overrides = {}) => ({
  id: 'room-123',
  name: 'Test Room',
  created_at: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock message data
 */
export const createMockMessage = (overrides = {}) => ({
  id: 1,
  content: 'Test message',
  timestamp: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  name: 'Test User',
  ...overrides
});

/**
 * Wait for async operations in tests
 */
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock console methods to reduce test noise
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  
  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });
  
  return originalConsole;
};

export default {
  mockFetchResponse,
  mockFetchError,
  createMockSocket,
  createMockRoom,
  createMockMessage,
  createMockUser,
  waitFor,
  mockConsole
};

// Simple test to make this file valid for Jest
describe('Test Utils', () => {
  test('should export utility functions', () => {
    expect(typeof mockFetchResponse).toBe('function');
    expect(typeof createMockSocket).toBe('function');
    expect(typeof createMockRoom).toBe('function');
  });
});
