/**
 * Jest Setup File for Databricks Calculator Tests
 */

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock fetch for API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
        status: 200
    })
);

// Mock console methods to reduce noise
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn()
};

// Add custom matchers
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true
            };
        } else {
            return {
                message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false
            };
        }
    },
    toBeValidCurrency(received) {
        const currencyRegex = /^\$[\d,]+(\.\d{2})?$/;
        const pass = currencyRegex.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be valid currency format`,
                pass: true
            };
        } else {
            return {
                message: () => `expected ${received} to be valid currency format (e.g., $1,234.56)`,
                pass: false
            };
        }
    }
});

// Setup DOM environment
beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
});

// Cleanup after tests
afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
});