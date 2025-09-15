/**
 * End-to-End Tests for Databricks Calculator User Flows
 */

describe('Databricks Calculator E2E Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto('file:///Users/deo/migrations/architecture-audit/calculators/databricks-sizing/index.html');
    });

    afterEach(async () => {
        await page.close();
    });

    describe('Complete User Journey - Small Startup', () => {
        test('should configure basic batch processing setup', async () => {
            // Tab 1: Workload Configuration
            await page.select('#workloadType', 'batch');
            await page.type('#dataVolume', '500');
            await page.select('#processingFrequency', 'daily');
            await page.type('#concurrentUsers', '5');
            await page.type('#peakHours', '4');
            await page.select('#jobComplexity', 'simple');

            // Tab 2: Cluster Configuration
            await page.click('button[data-tab="clusters"]');
            await page.select('#cloudProvider', 'aws');
            await page.select('#region', 'us-east-1');
            await page.type('#numClusters', '1');
            await page.type('#nodesPerCluster', '3');
            await page.select('#instanceType', 'm5.large');
            await page.select('#clusterType', 'jobs');
            await page.type('#utilizationRate', '60');
            await page.click('#spotInstancesEnabled');
            await page.type('#spotInstancePercentage', '80');

            // Tab 3: Storage
            await page.click('button[data-tab="storage"]');
            await page.type('#storageTB', '10');
            await page.select('#storageType', 'standard');
            await page.click('#deltaOptimizationEnabled');

            // Tab 4: Optimization
            await page.click('button[data-tab="optimization"]');
            await page.select('#optimizationLevel', 'balanced');

            // Calculate
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);

            // Verify results
            const monthlyCost = await page.$eval('#monthlyCost', el => el.textContent);
            const costValue = parseFloat(monthlyCost.replace(/[^0-9.]/g, ''));

            expect(costValue).toBeGreaterThan(0);
            expect(costValue).toBeLessThan(5000); // Small startup should be under $5k/month
        });
    });

    describe('Complete User Journey - Enterprise', () => {
        test('should configure enterprise-grade ML platform', async () => {
            // Tab 1: Workload Configuration
            await page.select('#workloadType', 'ml_training');
            await page.type('#dataVolume', '50000');
            await page.select('#processingFrequency', 'continuous');
            await page.type('#concurrentUsers', '200');
            await page.type('#peakHours', '24');
            await page.select('#jobComplexity', 'complex');

            // Tab 2: Cluster Configuration
            await page.click('button[data-tab="clusters"]');
            await page.select('#cloudProvider', 'aws');
            await page.select('#region', 'us-east-1');
            await page.type('#numClusters', '10');
            await page.type('#nodesPerCluster', '20');
            await page.select('#instanceType', 'p3.8xlarge'); // GPU instances
            await page.select('#clusterType', 'all-purpose');
            await page.type('#utilizationRate', '85');
            await page.click('#autoScalingEnabled');
            await page.type('#minNodes', '10');
            await page.type('#maxNodes', '50');

            // Tab 3: Advanced Features
            await page.click('button[data-tab="advanced"]');
            await page.click('#photonEnabled');
            await page.click('#unityCatalogEnabled');
            await page.click('#deltaLiveTablesEnabled');
            await page.click('#deltaOptimizationEnabled');
            await page.click('#zOrderEnabled');

            // Tab 4: Storage
            await page.click('button[data-tab="storage"]');
            await page.type('#storageTB', '1000');
            await page.select('#storageType', 'premium');
            await page.type('#monthlyDataGrowthRate', '10');

            // Tab 5: Networking
            await page.click('button[data-tab="networking"]');
            await page.type('#monthlyDataTransferGB', '50000');
            await page.select('#vpcConfig', 'custom');
            await page.type('#natGateways', '3');
            await page.type('#vpcEndpoints', '5');

            // Tab 6: ML/AI Features
            await page.click('button[data-tab="mlai"]');
            await page.click('#mlflowEnabled');
            await page.type('#mlExperiments', '500');
            await page.type('#mlModels', '50');
            await page.click('#modelServingEnabled');
            await page.type('#modelEndpoints', '10');
            await page.type('#monthlyModelRequests', '10000000');
            await page.click('#vectorSearchEnabled');
            await page.type('#vectorIndexes', '20');

            // Tab 7: Governance
            await page.click('button[data-tab="governance"]');
            await page.click('#auditLoggingEnabled');
            await page.click('#encryptionEnabled');
            await page.click('#complianceMode');
            await page.select('#dataResidency', 'us');

            // Tab 8: Optimization
            await page.click('button[data-tab="optimization"]');
            await page.select('#optimizationLevel', 'performance');
            await page.click('#reservedInstancesEnabled');
            await page.type('#reservedInstancesCoverage', '70');
            await page.click('#savingsPlansEnabled');
            await page.type('#savingsPlansCoverage', '30');

            // Calculate
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);

            // Verify results
            const monthlyCost = await page.$eval('#monthlyCost', el => el.textContent);
            const costValue = parseFloat(monthlyCost.replace(/[^0-9.]/g, ''));

            expect(costValue).toBeGreaterThan(50000); // Enterprise should be significant

            // Check breakdown is populated
            const computeCost = await page.$eval('#computeCost', el => el.textContent);
            expect(computeCost).toContain('$');

            const storageCost = await page.$eval('#storageCost', el => el.textContent);
            expect(storageCost).toContain('$');

            const featureCost = await page.$eval('#additionalFeaturesCost', el => el.textContent);
            expect(featureCost).toContain('$');
        });
    });

    describe('User Flow - Cost Optimization', () => {
        test('should show cost reduction through optimizations', async () => {
            // Set base configuration
            await page.select('#cloudProvider', 'aws');
            await page.type('#numClusters', '5');
            await page.type('#nodesPerCluster', '10');
            await page.select('#instanceType', 'r5.4xlarge');
            await page.select('#clusterType', 'all-purpose');

            // Calculate base cost
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);
            const baseCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Apply optimizations one by one
            await page.click('button[data-tab="optimization"]');

            // 1. Enable Spot Instances
            await page.click('button[data-tab="clusters"]');
            await page.click('#spotInstancesEnabled');
            await page.type('#spotInstancePercentage', '60');
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);
            const spotCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            expect(spotCost).toBeLessThan(baseCost);

            // 2. Add Reserved Instances
            await page.click('button[data-tab="optimization"]');
            await page.click('#reservedInstancesEnabled');
            await page.type('#reservedInstancesCoverage', '40');
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);
            const riCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            expect(riCost).toBeLessThan(spotCost);

            // 3. Enable Auto-scaling
            await page.click('button[data-tab="clusters"]');
            await page.click('#autoScalingEnabled');
            await page.type('#minNodes', '3');
            await page.type('#maxNodes', '15');
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);
            const autoScaleCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            expect(autoScaleCost).toBeLessThan(riCost);

            // Verify total savings
            const totalSavings = baseCost - autoScaleCost;
            const savingsPercentage = (totalSavings / baseCost) * 100;
            expect(savingsPercentage).toBeGreaterThan(30); // Should save at least 30%
        });
    });

    describe('User Flow - Multi-Cloud Comparison', () => {
        test('should compare equivalent configurations across clouds', async () => {
            // Set base configuration
            await page.type('#numClusters', '3');
            await page.type('#nodesPerCluster', '8');
            await page.type('#storageTB', '50');
            await page.click('#photonEnabled');
            await page.click('#unityCatalogEnabled');

            // Calculate AWS cost
            await page.select('#cloudProvider', 'aws');
            await page.select('#region', 'us-east-1');
            await page.select('#instanceType', 'm5.2xlarge');
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);
            const awsCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Calculate Azure cost
            await page.select('#cloudProvider', 'azure');
            await page.select('#region', 'eastus');
            await page.select('#instanceType', 'Standard_D8s_v3');
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);
            const azureCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Calculate GCP cost
            await page.select('#cloudProvider', 'gcp');
            await page.select('#region', 'us-central1');
            await page.select('#instanceType', 'n2-standard-8');
            await page.click('#calculateBtn');
            await page.waitForTimeout(500);
            const gcpCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Navigate to comparison tab
            await page.click('button[data-tab="comparison"]');
            await page.click('#compareBtn');
            await page.waitForTimeout(500);

            // Verify comparison results
            const comparisonAWS = await page.$eval('#awsComparisonCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            const comparisonAzure = await page.$eval('#azureComparisonCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            const comparisonGCP = await page.$eval('#gcpComparisonCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            expect(comparisonAWS).toBeCloseTo(awsCost, 100);
            expect(comparisonAzure).toBeCloseTo(azureCost, 100);
            expect(comparisonGCP).toBeCloseTo(gcpCost, 100);

            // Check optimal provider is highlighted
            const optimalProvider = await page.$eval('#optimalProvider', el => el.textContent);
            expect(['AWS', 'Azure', 'GCP']).toContain(optimalProvider);
        });
    });

    describe('User Flow - Form Validation', () => {
        test('should validate required fields', async () => {
            // Try to calculate without filling required fields
            await page.click('#calculateBtn');

            // Check for validation messages
            const validationMessage = await page.$eval('#validationMessage', el => el.textContent);
            expect(validationMessage).toContain('required');
        });

        test('should validate numeric inputs', async () => {
            // Enter invalid values
            await page.type('#numClusters', '-5');
            await page.type('#nodesPerCluster', 'abc');
            await page.type('#utilizationRate', '150');

            await page.click('#calculateBtn');

            // Check values are corrected
            const numClusters = await page.$eval('#numClusters', el => el.value);
            expect(parseInt(numClusters)).toBeGreaterThanOrEqual(1);

            const nodesPerCluster = await page.$eval('#nodesPerCluster', el => el.value);
            expect(parseInt(nodesPerCluster)).toBeGreaterThanOrEqual(1);

            const utilizationRate = await page.$eval('#utilizationRate', el => el.value);
            expect(parseInt(utilizationRate)).toBeLessThanOrEqual(100);
        });

        test('should validate dependent fields', async () => {
            // Enable auto-scaling without setting min/max
            await page.click('#autoScalingEnabled');
            await page.click('#calculateBtn');

            // Check that min/max are required when auto-scaling is enabled
            const minNodesRequired = await page.$eval('#minNodes', el => el.hasAttribute('required'));
            const maxNodesRequired = await page.$eval('#maxNodes', el => el.hasAttribute('required'));

            expect(minNodesRequired).toBe(true);
            expect(maxNodesRequired).toBe(true);
        });
    });

    describe('User Flow - Export and Import', () => {
        test('should export and re-import configuration', async () => {
            // Configure calculator
            const config = {
                cloudProvider: 'azure',
                region: 'westus2',
                numClusters: '4',
                nodesPerCluster: '12',
                instanceType: 'Standard_E8s_v3',
                photonEnabled: true,
                unityCatalogEnabled: true,
                storageTB: '75'
            };

            // Set configuration
            await page.select('#cloudProvider', config.cloudProvider);
            await page.waitForTimeout(500); // Wait for regions to update
            await page.select('#region', config.region);
            await page.type('#numClusters', config.numClusters);
            await page.type('#nodesPerCluster', config.nodesPerCluster);
            await page.waitForTimeout(500); // Wait for instances to update
            await page.select('#instanceType', config.instanceType);
            await page.click('#photonEnabled');
            await page.click('#unityCatalogEnabled');
            await page.type('#storageTB', config.storageTB);

            // Export configuration
            await page.click('#exportBtn');

            // Simulate clearing form
            await page.reload();

            // Import configuration
            const importConfig = JSON.stringify(config);
            await page.evaluate(config => {
                const importBtn = document.getElementById('importBtn');
                const event = new Event('change');
                const file = new File([config], 'config.json', { type: 'application/json' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                importBtn.files = dataTransfer.files;
                importBtn.dispatchEvent(event);
            }, importConfig);

            await page.waitForTimeout(500);

            // Verify imported values
            const cloudProvider = await page.$eval('#cloudProvider', el => el.value);
            const numClusters = await page.$eval('#numClusters', el => el.value);
            const photonEnabled = await page.$eval('#photonEnabled', el => el.checked);

            expect(cloudProvider).toBe(config.cloudProvider);
            expect(numClusters).toBe(config.numClusters);
            expect(photonEnabled).toBe(config.photonEnabled);
        });
    });

    describe('User Flow - Responsive Design', () => {
        test('should work on mobile viewport', async () => {
            // Set mobile viewport
            await page.setViewport({ width: 375, height: 667 });

            // Check navigation menu is collapsible
            const menuToggle = await page.$('#menuToggle');
            expect(menuToggle).toBeTruthy();

            // Toggle menu
            await page.click('#menuToggle');
            const menuVisible = await page.$eval('#siteMenu', el =>
                window.getComputedStyle(el).display !== 'none'
            );
            expect(menuVisible).toBe(true);

            // Navigate through tabs on mobile
            await page.click('button[data-tab="clusters"]');
            const clustersTabActive = await page.$eval('button[data-tab="clusters"]', el =>
                el.classList.contains('active')
            );
            expect(clustersTabActive).toBe(true);

            // Verify form inputs are accessible
            await page.type('#numClusters', '2');
            const value = await page.$eval('#numClusters', el => el.value);
            expect(value).toBe('2');
        });

        test('should work on tablet viewport', async () => {
            // Set tablet viewport
            await page.setViewport({ width: 768, height: 1024 });

            // Verify layout adjusts properly
            const containerWidth = await page.$eval('.calculator-container', el =>
                el.getBoundingClientRect().width
            );
            expect(containerWidth).toBeLessThanOrEqual(768);
            expect(containerWidth).toBeGreaterThan(700);

            // Verify tabs are still functional
            await page.click('button[data-tab="advanced"]');
            const advancedContent = await page.$eval('#advancedTab', el =>
                window.getComputedStyle(el).display !== 'none'
            );
            expect(advancedContent).toBe(true);
        });
    });
});