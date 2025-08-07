// Utility functions for testing
import { vi } from 'vitest';

/**
 * Test utilities for client-side testing
 */

export interface MockRoom {
  id: string;
  name: string;
  created_at: string;
}

export interface MockMessage {
  id: number;
  content: string;
  timestamp: string;
}

export interface MockUser {
  id: string;
  name: string;
}

export interface MockSocket {
  on: jest.MockedFunction<any>;
  off: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  connected: boolean;
  _trigger: (event: string, data?: any) => void;
}

export interface MockFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
}

/**
 * Mock fetch responses for API testing
 */
export const mockFetchResponse = (data: any, status: number = 200, ok: boolean = true): Promise<Partial<Response>> => {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(data)
  } as Partial<Response>);
};

/**
 * Mock fetch error
 */
export const mockFetchError = (message: string): Promise<never> => {
  return Promise.reject(new Error(message));
};

/**
 * Create mock socket for testing
 */
export const createMockSocket = (): MockSocket => {
  const listeners: Record<string, (data?: any) => void> = {};
  
  return {
    on: vi.fn((event: string, handler: (data?: any) => void) => {
      listeners[event] = handler;
    }),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    // Helper to trigger events in tests
    _trigger: (event: string, data?: any) => {
      if (listeners[event]) {
        listeners[event](data);
      }
    }
  };
};

/**
 * Create mock room data
 */
export const createMockRoom = (overrides: Partial<MockRoom> = {}): MockRoom => ({
  id: 'room-123',
  name: 'Test Room',
  created_at: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock message data
 */
export const createMockMessage = (overrides: Partial<MockMessage> = {}): MockMessage => ({
  id: 1,
  content: 'Test message',
  timestamp: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock user data
 */
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user-123',
  name: 'Test User',
  ...overrides
});

/**
 * Wait for async operations in tests
 */
export const waitFor = (ms: number = 0): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock console methods to reduce test noise
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
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

// Simple test to make this file valid for Vitest
describe('Test Utils', () => {
  test('should export utility functions', () => {
    expect(typeof mockFetchResponse).toBe('function');
    expect(typeof createMockSocket).toBe('function');
    expect(typeof createMockRoom).toBe('function');
  });
});
