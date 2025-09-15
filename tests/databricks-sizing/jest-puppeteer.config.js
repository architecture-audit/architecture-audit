/**
 * Puppeteer Configuration for E2E Tests
 */

module.exports = {
    launch: {
        headless: true,
        slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
        devtools: process.env.DEVTOOLS === 'true',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    },
    browserContext: 'default',
    exitOnPageError: false
};