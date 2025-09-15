/**
 * Jest Configuration for Databricks Sizing Calculator Tests
 */

module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: [
        '**/unit/**/*.test.js',
        '**/integration/**/*.test.js',
        '**/e2e/**/*.test.js'
    ],
    collectCoverageFrom: [
        '../../calculators/databricks-sizing/**/*.js',
        '!../../calculators/databricks-sizing/**/*.test.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: './coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    testTimeout: 30000,
    verbose: true,
    projects: [
        {
            displayName: 'Unit Tests',
            testMatch: ['<rootDir>/unit/**/*.test.js'],
            testEnvironment: 'jsdom'
        },
        {
            displayName: 'Integration Tests',
            testMatch: ['<rootDir>/integration/**/*.test.js'],
            testEnvironment: 'jsdom',
            globalSetup: '<rootDir>/integration.setup.js',
            globalTeardown: '<rootDir>/integration.teardown.js'
        },
        {
            displayName: 'E2E Tests',
            testMatch: ['<rootDir>/e2e/**/*.test.js'],
            preset: 'jest-puppeteer',
            testEnvironment: 'jest-environment-puppeteer'
        }
    ]
};