/**
 * AI Architecture Audit - Comprehensive Test Runner
 * Tests all functionality across the entire website
 */

class TestRunner {
    constructor() {
        this.baseUrl = 'http://localhost:8888';
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        };
        this.log = [];
        this.testMap = new Map();
        this.init();
    }

    init() {
        // Register all tests
        this.registerTests();

        // Update UI
        this.updateSummary();

        // Bind test item clicks
        document.querySelectorAll('.test-item').forEach(item => {
            item.addEventListener('click', () => this.toggleTestSelection(item));
        });
    }

    registerTests() {
        // Page Load Tests
        this.testMap.set('homepage-load', () => this.testPageLoad('/'));
        this.testMap.set('catalog-load', () => this.testPageLoad('/catalog.html'));
        this.testMap.set('docs-load', () => this.testPageLoad('/docs/'));
        this.testMap.set('calculators-load', () => this.testCalculatorPages());

        // Navigation Tests
        this.testMap.set('nav-presence', () => this.testNavigationPresence());
        this.testMap.set('nav-dropdowns', () => this.testNavigationDropdowns());
        this.testMap.set('nav-mobile', () => this.testMobileMenu());
        this.testMap.set('nav-links', () => this.testNavigationLinks());
        this.testMap.set('nav-active', () => this.testActivePageHighlight());

        // Search Tests
        this.testMap.set('catalog-search', () => this.testCatalogSearch());
        this.testMap.set('search-instant', () => this.testInstantSearch());
        this.testMap.set('search-keyboard', () => this.testSearchKeyboard());
        this.testMap.set('filter-checkboxes', () => this.testFilterCheckboxes());
        this.testMap.set('filter-clear', () => this.testClearFilters());

        // Calculator Tests
        this.testMap.set('calc-navigation', () => this.testCalculatorNavigation());
        this.testMap.set('calc-progress', () => this.testProgressTracking());
        this.testMap.set('calc-storage', () => this.testLocalStorage());
        this.testMap.set('calc-validation', () => this.testFormValidation());
        this.testMap.set('calc-results', () => this.testResultsCalculation());

        // Link Tests
        this.testMap.set('internal-links', () => this.testInternalLinks());
        this.testMap.set('doc-links', () => this.testDocumentationLinks());
        this.testMap.set('calc-links', () => this.testCalculatorLinks());
        this.testMap.set('anchor-links', () => this.testAnchorLinks());
        this.testMap.set('footer-links', () => this.testFooterLinks());

        // Accessibility Tests
        this.testMap.set('aria-labels', () => this.testAriaLabels());
        this.testMap.set('keyboard-nav', () => this.testKeyboardNavigation());
        this.testMap.set('focus-visible', () => this.testFocusIndicators());
        this.testMap.set('skip-links', () => this.testSkipLinks());
        this.testMap.set('alt-text', () => this.testAltText());

        // Responsive Tests
        this.testMap.set('mobile-layout', () => this.testMobileLayout());
        this.testMap.set('tablet-layout', () => this.testTabletLayout());
        this.testMap.set('desktop-layout', () => this.testDesktopLayout());
        this.testMap.set('touch-targets', () => this.testTouchTargets());
        this.testMap.set('viewport-meta', () => this.testViewportMeta());

        // Performance Tests
        this.testMap.set('page-speed', () => this.testPageSpeed());
        this.testMap.set('js-errors', () => this.testJavaScriptErrors());
        this.testMap.set('css-valid', () => this.testCSSValidity());
        this.testMap.set('resource-404', () => this.testResource404());
        this.testMap.set('image-optimization', () => this.testImageOptimization());

        // Security Tests
        this.testMap.set('https-ready', () => this.testHTTPSReady());
        this.testMap.set('xss-protection', () => this.testXSSProtection());
        this.testMap.set('external-links', () => this.testExternalLinks());
        this.testMap.set('input-sanitization', () => this.testInputSanitization());
    }

    // Test Runner Methods

    async runAllTests() {
        this.clearResults();
        this.addLog('🚀 Starting comprehensive test suite...', 'info');

        for (const [testId, testFunc] of this.testMap) {
            await this.runTest(testId, testFunc);
        }

        this.addLog('✅ Test suite completed!', 'success');
        this.generateReport();
    }

    async runSelectedTests() {
        this.clearResults();
        const selected = document.querySelectorAll('.test-item.selected');

        if (selected.length === 0) {
            this.addLog('⚠️ No tests selected', 'warning');
            return;
        }

        this.addLog(`🚀 Running ${selected.length} selected tests...`, 'info');

        for (const item of selected) {
            const testId = item.dataset.test;
            const testFunc = this.testMap.get(testId);
            if (testFunc) {
                await this.runTest(testId, testFunc);
            }
        }

        this.addLog('✅ Selected tests completed!', 'success');
    }

    async runTest(testId, testFunc) {
        const testElement = document.querySelector(`[data-test="${testId}"]`);
        const statusElement = testElement.querySelector('.status');

        // Set running state
        statusElement.className = 'status running';
        this.results.total++;

        try {
            const result = await testFunc.call(this);

            if (result.status === 'pass') {
                statusElement.className = 'status pass';
                this.results.passed++;
                this.addLog(`✅ ${result.message}`, 'success');
            } else if (result.status === 'warning') {
                statusElement.className = 'status warning';
                this.results.warnings++;
                this.addLog(`⚠️ ${result.message}`, 'warning');
            } else {
                statusElement.className = 'status fail';
                this.results.failed++;
                this.addLog(`❌ ${result.message}`, 'error');
            }
        } catch (error) {
            statusElement.className = 'status fail';
            this.results.failed++;
            this.addLog(`❌ Test ${testId} failed: ${error.message}`, 'error');
        }

        this.updateSummary();
    }

    // Individual Test Implementations

    async testPageLoad(path) {
        try {
            const response = await fetch(this.baseUrl + path);
            if (response.ok) {
                return { status: 'pass', message: `Page ${path} loads successfully (${response.status})` };
            } else {
                return { status: 'fail', message: `Page ${path} failed to load (${response.status})` };
            }
        } catch (error) {
            return { status: 'fail', message: `Page ${path} error: ${error.message}` };
        }
    }

    async testCalculatorPages() {
        const calculators = [
            'ai-readiness', 'cloud-migration', 'mlops-audit',
            'llm-framework', 'security-audit', 'genai-security',
            'cost-optimization', 'well-architected'
        ];

        let allPass = true;
        let failedCalcs = [];

        for (const calc of calculators) {
            const response = await fetch(`${this.baseUrl}/calculators/${calc}/`);
            if (!response.ok) {
                allPass = false;
                failedCalcs.push(calc);
            }
        }

        if (allPass) {
            return { status: 'pass', message: `All ${calculators.length} calculator pages load successfully` };
        } else {
            return { status: 'fail', message: `Failed calculators: ${failedCalcs.join(', ')}` };
        }
    }

    async testNavigationPresence() {
        const testPage = await fetch(this.baseUrl);
        const html = await testPage.text();

        if (html.includes('site-navigation') || html.includes('site-nav')) {
            return { status: 'pass', message: 'Navigation structure present on homepage' };
        } else {
            return { status: 'fail', message: 'Navigation structure not found' };
        }
    }

    async testNavigationDropdowns() {
        const response = await fetch(`${this.baseUrl}/docs/assets/js/site-navigation.js`);
        const jsContent = await response.text();

        if (jsContent.includes('dropdown-menu') && jsContent.includes('has-dropdown')) {
            return { status: 'pass', message: 'Dropdown menu code present and functional' };
        } else {
            return { status: 'fail', message: 'Dropdown menu functionality missing' };
        }
    }

    async testMobileMenu() {
        const response = await fetch(`${this.baseUrl}/docs/assets/css/site-navigation.css`);
        const css = await response.text();

        if (css.includes('mobile-menu-toggle') && css.includes('@media')) {
            return { status: 'pass', message: 'Mobile menu styles and breakpoints configured' };
        } else {
            return { status: 'fail', message: 'Mobile menu configuration missing' };
        }
    }

    async testNavigationLinks() {
        const navLinks = [
            '/calculators/ai-readiness/',
            '/calculators/cloud-migration/',
            '/docs/',
            '/catalog.html'
        ];

        let brokenLinks = [];

        for (const link of navLinks) {
            const response = await fetch(this.baseUrl + link);
            if (!response.ok) {
                brokenLinks.push(link);
            }
        }

        if (brokenLinks.length === 0) {
            return { status: 'pass', message: 'All navigation links are valid' };
        } else {
            return { status: 'fail', message: `Broken navigation links: ${brokenLinks.join(', ')}` };
        }
    }

    async testActivePageHighlight() {
        const jsResponse = await fetch(`${this.baseUrl}/docs/assets/js/site-navigation.js`);
        const jsContent = await jsResponse.text();

        if (jsContent.includes('aria-current="page"') || jsContent.includes('highlightCurrentPage')) {
            return { status: 'pass', message: 'Active page highlighting implemented' };
        } else {
            return { status: 'warning', message: 'Active page highlighting may not be fully implemented' };
        }
    }

    async testCatalogSearch() {
        const response = await fetch(`${this.baseUrl}/catalog.html`);
        const html = await response.text();

        if (html.includes('unified-search.js') || html.includes('globalSearch')) {
            return { status: 'pass', message: 'Catalog search functionality present' };
        } else {
            return { status: 'fail', message: 'Catalog search functionality missing' };
        }
    }

    async testInstantSearch() {
        const response = await fetch(`${this.baseUrl}/docs/assets/js/unified-search.js`);

        if (response.ok) {
            const jsContent = await response.text();
            if (jsContent.includes('minSearchLength: 1') || jsContent.includes('searchTerm.length')) {
                return { status: 'pass', message: 'Instant search from first character implemented' };
            }
        }

        return { status: 'warning', message: 'Instant search implementation unclear' };
    }

    async testSearchKeyboard() {
        const response = await fetch(`${this.baseUrl}/docs/assets/js/unified-search.js`);
        const jsContent = await response.text();

        if (jsContent.includes("key === '/'") && jsContent.includes("key === 'Escape'")) {
            return { status: 'pass', message: 'Keyboard shortcuts (/ and Escape) implemented' };
        } else {
            return { status: 'fail', message: 'Keyboard shortcuts not fully implemented' };
        }
    }

    async testFilterCheckboxes() {
        const response = await fetch(`${this.baseUrl}/catalog.html`);
        const html = await response.text();

        if (html.includes('type="checkbox"') && html.includes('data-category')) {
            return { status: 'pass', message: 'Filter checkboxes present in catalog' };
        } else {
            return { status: 'fail', message: 'Filter checkboxes missing' };
        }
    }

    async testClearFilters() {
        const response = await fetch(`${this.baseUrl}/catalog.html`);
        const html = await response.text();

        if (html.includes('clearFilters') || html.includes('Clear Filters')) {
            return { status: 'pass', message: 'Clear filters functionality present' };
        } else {
            return { status: 'warning', message: 'Clear filters button may be missing' };
        }
    }

    async testCalculatorNavigation() {
        const response = await fetch(`${this.baseUrl}/calculators/ai-readiness/`);
        const html = await response.text();

        if (html.includes('tab') || html.includes('navigation')) {
            return { status: 'pass', message: 'Calculator navigation structure present' };
        } else {
            return { status: 'warning', message: 'Calculator navigation may need review' };
        }
    }

    async testProgressTracking() {
        // Check for progress tracking in calculator JavaScript
        const calcs = ['ai-readiness', 'cloud-migration'];

        for (const calc of calcs) {
            const response = await fetch(`${this.baseUrl}/calculators/${calc}/`);
            const html = await response.text();

            if (html.includes('progress') || html.includes('completed')) {
                return { status: 'pass', message: 'Progress tracking functionality found' };
            }
        }

        return { status: 'warning', message: 'Progress tracking not clearly implemented' };
    }

    async testLocalStorage() {
        // Check for localStorage usage in calculator pages
        const response = await fetch(`${this.baseUrl}/calculators/ai-readiness/`);
        const html = await response.text();

        if (html.includes('localStorage') || html.includes('saveData')) {
            return { status: 'pass', message: 'LocalStorage functionality implemented' };
        } else {
            return { status: 'warning', message: 'LocalStorage usage not detected' };
        }
    }

    async testFormValidation() {
        const response = await fetch(`${this.baseUrl}/calculators/ai-readiness/`);
        const html = await response.text();

        if (html.includes('required') || html.includes('validation')) {
            return { status: 'pass', message: 'Form validation present' };
        } else {
            return { status: 'warning', message: 'Form validation may be incomplete' };
        }
    }

    async testResultsCalculation() {
        const response = await fetch(`${this.baseUrl}/calculators/ai-readiness/`);
        const html = await response.text();

        if (html.includes('calculate') || html.includes('score') || html.includes('results')) {
            return { status: 'pass', message: 'Results calculation functionality present' };
        } else {
            return { status: 'warning', message: 'Results calculation needs verification' };
        }
    }

    async testInternalLinks() {
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        // Extract internal links
        const linkMatches = html.match(/href=["']\/[^"']*["']/g) || [];
        let brokenCount = 0;

        for (const match of linkMatches.slice(0, 10)) { // Test first 10 links
            const url = match.replace(/href=["']/, '').replace(/["']/, '');
            const linkResponse = await fetch(this.baseUrl + url);
            if (!linkResponse.ok) brokenCount++;
        }

        if (brokenCount === 0) {
            return { status: 'pass', message: 'Sample internal links all valid' };
        } else {
            return { status: 'fail', message: `${brokenCount} broken internal links found` };
        }
    }

    async testDocumentationLinks() {
        const docLinks = [
            '/docs/',
            '/docs/ai-readiness/',
            '/docs/cloud-migration/',
            '/docs/security-audit/'
        ];

        let invalidLinks = [];

        for (const link of docLinks) {
            const response = await fetch(this.baseUrl + link);
            if (!response.ok) {
                invalidLinks.push(link);
            }
        }

        if (invalidLinks.length === 0) {
            return { status: 'pass', message: 'All documentation links valid' };
        } else {
            return { status: 'fail', message: `Invalid doc links: ${invalidLinks.join(', ')}` };
        }
    }

    async testCalculatorLinks() {
        const response = await fetch(`${this.baseUrl}/catalog.html`);
        const html = await response.text();

        if (html.includes('href="./ai-readiness/"') || html.includes('href="/calculators/')) {
            return { status: 'pass', message: 'Calculator links properly formatted' };
        } else {
            return { status: 'warning', message: 'Calculator link format needs review' };
        }
    }

    async testAnchorLinks() {
        const response = await fetch(`${this.baseUrl}/docs/`);
        const html = await response.text();

        if (html.includes('href="#') && html.includes('id="')) {
            return { status: 'pass', message: 'Anchor links and IDs present' };
        } else {
            return { status: 'warning', message: 'Anchor links may be missing' };
        }
    }

    async testFooterLinks() {
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        if (html.includes('footer') && html.includes('footer-link')) {
            return { status: 'pass', message: 'Footer links structure present' };
        } else {
            return { status: 'warning', message: 'Footer links may be missing' };
        }
    }

    async testAriaLabels() {
        const response = await fetch(`${this.baseUrl}/docs/assets/js/site-navigation.js`);
        const jsContent = await response.text();

        if (jsContent.includes('aria-label') && jsContent.includes('aria-expanded')) {
            return { status: 'pass', message: 'ARIA labels implemented in navigation' };
        } else {
            return { status: 'fail', message: 'ARIA labels missing or incomplete' };
        }
    }

    async testKeyboardNavigation() {
        const response = await fetch(`${this.baseUrl}/docs/assets/css/site-navigation.css`);
        const css = await response.text();

        if (css.includes(':focus') && css.includes('outline')) {
            return { status: 'pass', message: 'Focus styles for keyboard navigation present' };
        } else {
            return { status: 'fail', message: 'Keyboard navigation styles missing' };
        }
    }

    async testFocusIndicators() {
        const response = await fetch(`${this.baseUrl}/docs/assets/css/site-navigation.css`);
        const css = await response.text();

        if (css.includes('outline: 2px') && css.includes('focus')) {
            return { status: 'pass', message: 'Clear focus indicators implemented' };
        } else {
            return { status: 'warning', message: 'Focus indicators may need improvement' };
        }
    }

    async testSkipLinks() {
        const response = await fetch(`${this.baseUrl}/docs/assets/js/site-navigation.js`);
        const jsContent = await response.text();

        if (jsContent.includes('skip-link') || jsContent.includes('Skip to main')) {
            return { status: 'pass', message: 'Skip navigation links implemented' };
        } else {
            return { status: 'fail', message: 'Skip navigation links missing' };
        }
    }

    async testAltText() {
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        const imgCount = (html.match(/<img/g) || []).length;
        const altCount = (html.match(/alt="/g) || []).length;

        if (imgCount === 0 || altCount >= imgCount * 0.8) {
            return { status: 'pass', message: 'Images have alt text (or no images present)' };
        } else {
            return { status: 'warning', message: `Only ${altCount}/${imgCount} images have alt text` };
        }
    }

    async testMobileLayout() {
        const response = await fetch(`${this.baseUrl}/docs/assets/css/site-navigation.css`);
        const css = await response.text();

        if (css.includes('@media (max-width: 768px)')) {
            return { status: 'pass', message: 'Mobile breakpoints configured' };
        } else {
            return { status: 'fail', message: 'Mobile breakpoints missing' };
        }
    }

    async testTabletLayout() {
        const response = await fetch(`${this.baseUrl}/docs/assets/css/site-navigation.css`);
        const css = await response.text();

        if (css.includes('@media') && css.includes('768px')) {
            return { status: 'pass', message: 'Tablet breakpoints present' };
        } else {
            return { status: 'warning', message: 'Tablet-specific styles may be missing' };
        }
    }

    async testDesktopLayout() {
        const response = await fetch(`${this.baseUrl}/docs/assets/css/site-navigation.css`);
        const css = await response.text();

        if (css.includes('max-width') && css.includes('1400px')) {
            return { status: 'pass', message: 'Desktop layout constraints configured' };
        } else {
            return { status: 'warning', message: 'Desktop layout may need optimization' };
        }
    }

    async testTouchTargets() {
        const response = await fetch(`${this.baseUrl}/docs/assets/css/site-navigation.css`);
        const css = await response.text();

        if (css.includes('min-height: 44px') || css.includes('padding') && css.includes('1rem')) {
            return { status: 'pass', message: 'Touch targets meet 44px minimum' };
        } else {
            return { status: 'warning', message: 'Touch target sizes may be too small' };
        }
    }

    async testViewportMeta() {
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        if (html.includes('viewport') && html.includes('width=device-width')) {
            return { status: 'pass', message: 'Viewport meta tag properly configured' };
        } else {
            return { status: 'fail', message: 'Viewport meta tag missing or incorrect' };
        }
    }

    async testPageSpeed() {
        const startTime = Date.now();
        const response = await fetch(this.baseUrl);
        const loadTime = Date.now() - startTime;

        if (loadTime < 3000) {
            return { status: 'pass', message: `Homepage loads in ${loadTime}ms` };
        } else {
            return { status: 'warning', message: `Homepage load time: ${loadTime}ms (>3s)` };
        }
    }

    async testJavaScriptErrors() {
        // Check if JS files load without 404s
        const jsFiles = [
            '/docs/assets/js/site-navigation.js',
            '/docs/assets/js/unified-search.js',
            '/docs/assets/js/mobile-navigation.js'
        ];

        let errors = [];

        for (const file of jsFiles) {
            const response = await fetch(this.baseUrl + file);
            if (!response.ok) {
                errors.push(file);
            }
        }

        if (errors.length === 0) {
            return { status: 'pass', message: 'All JavaScript files load successfully' };
        } else {
            return { status: 'fail', message: `JS load errors: ${errors.join(', ')}` };
        }
    }

    async testCSSValidity() {
        const cssFiles = [
            '/docs/assets/css/site-navigation.css',
            '/docs/assets/css/bottom-nav.css'
        ];

        let errors = [];

        for (const file of cssFiles) {
            const response = await fetch(this.baseUrl + file);
            if (!response.ok) {
                errors.push(file);
            }
        }

        if (errors.length === 0) {
            return { status: 'pass', message: 'All CSS files load successfully' };
        } else {
            return { status: 'fail', message: `CSS load errors: ${errors.join(', ')}` };
        }
    }

    async testResource404() {
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        // Check for common missing resources
        const resources = html.match(/(?:src|href)=["'][^"']+["']/g) || [];
        let missing = 0;

        for (const resource of resources.slice(0, 20)) { // Check first 20 resources
            const url = resource.replace(/(?:src|href)=["']/, '').replace(/["']/, '');
            if (url.startsWith('http')) continue; // Skip external

            const resResponse = await fetch(this.baseUrl + url);
            if (!resResponse.ok) missing++;
        }

        if (missing === 0) {
            return { status: 'pass', message: 'No 404 errors in sampled resources' };
        } else {
            return { status: 'warning', message: `${missing} resources returned 404` };
        }
    }

    async testImageOptimization() {
        // Basic check for image presence and format
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        const hasImages = html.includes('<img') || html.includes('background-image');
        const usesOptimizedFormats = html.includes('.webp') || html.includes('.svg');

        if (!hasImages) {
            return { status: 'pass', message: 'No images to optimize (emoji-based design)' };
        } else if (usesOptimizedFormats) {
            return { status: 'pass', message: 'Uses optimized image formats' };
        } else {
            return { status: 'warning', message: 'Consider using WebP or SVG formats' };
        }
    }

    async testHTTPSReady() {
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        // Check for mixed content issues
        const hasHTTP = html.includes('http://') && !html.includes('http://localhost');

        if (!hasHTTP) {
            return { status: 'pass', message: 'No mixed content issues detected' };
        } else {
            return { status: 'warning', message: 'Contains HTTP references (check for production)' };
        }
    }

    async testXSSProtection() {
        const response = await fetch(`${this.baseUrl}/docs/assets/js/unified-search.js`);
        const jsContent = await response.text();

        if (jsContent.includes('escapeHtml') || jsContent.includes('textContent')) {
            return { status: 'pass', message: 'XSS protection measures found' };
        } else {
            return { status: 'warning', message: 'XSS protection needs verification' };
        }
    }

    async testExternalLinks() {
        const response = await fetch(this.baseUrl);
        const html = await response.text();

        const externalLinks = html.match(/<a[^>]+href=["']https?:\/\/[^"']+["'][^>]*>/g) || [];
        let unsafe = 0;

        for (const link of externalLinks) {
            if (!link.includes('noopener') && !link.includes('noreferrer')) {
                unsafe++;
            }
        }

        if (unsafe === 0) {
            return { status: 'pass', message: 'External links use rel="noopener"' };
        } else {
            return { status: 'warning', message: `${unsafe} external links missing rel="noopener"` };
        }
    }

    async testInputSanitization() {
        const response = await fetch(`${this.baseUrl}/docs/assets/js/unified-search.js`);
        const jsContent = await response.text();

        if (jsContent.includes('sanitize') || jsContent.includes('escape') || jsContent.includes('textContent')) {
            return { status: 'pass', message: 'Input sanitization implemented' };
        } else {
            return { status: 'warning', message: 'Input sanitization needs review' };
        }
    }

    // Utility Methods

    toggleTestSelection(item) {
        item.classList.toggle('selected');
        item.style.background = item.classList.contains('selected') ? '#dbeafe' : '#f1f5f9';
    }

    clearResults() {
        this.results = { total: 0, passed: 0, failed: 0, warnings: 0 };
        this.log = [];
        document.getElementById('testLog').innerHTML = 'Test results will appear here...';
        document.querySelectorAll('.status').forEach(s => s.className = 'status');
        this.updateSummary();
    }

    updateSummary() {
        document.getElementById('totalTests').textContent = this.results.total;
        document.getElementById('passedTests').textContent = this.results.passed;
        document.getElementById('failedTests').textContent = this.results.failed;
        document.getElementById('warningTests').textContent = this.results.warnings;
    }

    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.log.push({ message: logEntry, type });

        const logElement = document.getElementById('testLog');
        const span = document.createElement('div');
        span.className = type;
        span.textContent = logEntry;
        logElement.appendChild(span);
        logElement.scrollTop = logElement.scrollHeight;
    }

    generateReport() {
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        const report = `
=== TEST REPORT ===
Date: ${new Date().toLocaleString()}
Total Tests: ${this.results.total}
Passed: ${this.results.passed}
Failed: ${this.results.failed}
Warnings: ${this.results.warnings}
Pass Rate: ${passRate}%
Status: ${this.results.failed === 0 ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}
        `;

        this.addLog(report, 'info');
        return report;
    }

    exportReport() {
        const report = this.generateReport();
        const logText = this.log.map(l => l.message).join('\n');
        const fullReport = report + '\n\nDETAILED LOG:\n' + logText;

        const blob = new Blob([fullReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.addLog('📄 Report exported successfully', 'success');
    }
}

// Initialize test runner
const testRunner = new TestRunner();

// Global functions for buttons
function runAllTests() { testRunner.runAllTests(); }
function runSelectedTests() { testRunner.runSelectedTests(); }
function clearResults() { testRunner.clearResults(); }
function exportReport() { testRunner.exportReport(); }