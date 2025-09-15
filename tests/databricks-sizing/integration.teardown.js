/**
 * Global Teardown for Integration Tests
 */

module.exports = async () => {
    // Clean up test environment
    delete process.env.TEST_ENV;
    delete process.env.CALCULATOR_BASE_URL;

    console.log('Integration test environment cleanup complete');
};