# Databricks Sizing Calculator Tests

Comprehensive test suite for the Databricks Sizing Calculator, including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/databricks-sizing/
├── unit/                    # Unit tests for individual functions
│   └── pricing.test.js      # Tests for pricing calculations
├── integration/             # Integration tests for multi-component features
│   └── multicloud.test.js   # Tests for multi-cloud functionality
├── e2e/                     # End-to-end tests for complete user flows
│   └── calculator-flow.test.js  # Tests for calculator user journeys
├── jest.config.js           # Jest configuration
├── jest.setup.js            # Test setup and custom matchers
├── jest-puppeteer.config.js # Puppeteer configuration for E2E tests
├── integration.setup.js     # Integration test setup
├── integration.teardown.js  # Integration test cleanup
└── package.json             # Test dependencies and scripts
```

## Installation

```bash
cd tests/databricks-sizing
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:e2e          # Run E2E tests only
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run tests in CI environment
```bash
npm run test:ci
```

## Test Coverage Areas

### Unit Tests
- DBU calculations for different cluster types
- Instance cost calculations with spot/on-demand pricing
- Feature costs (Unity Catalog, DLT, MLflow, etc.)
- Storage cost calculations with different tiers
- Networking cost calculations
- Optimization calculations (Reserved Instances, Savings Plans)
- Multi-cloud price comparisons

### Integration Tests
- Cloud provider switching and region updates
- Instance type updates based on cloud selection
- Feature integration (Photon, Unity Catalog, etc.)
- Optimization feature combinations
- Multi-cloud comparison functionality
- Export/import configuration
- Save/load functionality

### E2E Tests
- Complete user journey for small startup configuration
- Complete user journey for enterprise ML platform
- Cost optimization workflow
- Multi-cloud comparison workflow
- Form validation and error handling
- Export and import configuration flow
- Responsive design testing (mobile, tablet)

## Custom Jest Matchers

The test suite includes custom matchers for better assertions:

### `toBeWithinRange(floor, ceiling)`
Checks if a number is within a specified range.
```javascript
expect(cost).toBeWithinRange(1000, 5000);
```

### `toBeValidCurrency()`
Validates currency format (e.g., $1,234.56).
```javascript
expect(priceString).toBeValidCurrency();
```

## Environment Variables

- `SLOWMO`: Slow down Puppeteer operations (in milliseconds) for debugging
- `DEVTOOLS`: Set to 'true' to open Chrome DevTools during E2E tests
- `TEST_ENV`: Automatically set during integration tests
- `CALCULATOR_BASE_URL`: Base URL for the calculator during tests

## Debugging Tests

### Debug E2E tests visually
```bash
SLOWMO=250 DEVTOOLS=true npm run test:e2e
```

### Debug specific test file
```bash
npx jest --runInBand unit/pricing.test.js
```

### View test coverage report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Test Data

Test data includes various scenarios:
- **Small Startup**: 1 cluster, 3 nodes, basic features
- **Medium Business**: 3-5 clusters, mixed workloads, some optimizations
- **Enterprise**: 10+ clusters, GPU instances, full feature set
- **Cost Optimization**: Progressive optimization scenarios

## Continuous Integration

The test suite is designed to run in CI environments with:
- Headless browser support
- Parallel test execution
- Coverage reporting
- Failure screenshots (for E2E tests)

## Troubleshooting

### Tests failing with "Cannot find module"
```bash
npm install  # Reinstall dependencies
```

### E2E tests timing out
- Increase timeout in jest.config.js
- Check if the calculator HTML file path is correct
- Ensure Puppeteer can access local files

### Integration tests not finding calculator modules
- Verify that databricks-comprehensive.js and databricks-multicloud.js exist
- Check file paths in integration.setup.js

## Contributing

When adding new features to the calculator:
1. Add corresponding unit tests for calculations
2. Add integration tests for feature interactions
3. Update E2E tests if user flow changes
4. Maintain test coverage above 80%