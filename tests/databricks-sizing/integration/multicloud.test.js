/**
 * Integration Tests for Multi-Cloud Databricks Functionality
 */

describe('Multi-Cloud Integration Tests', () => {
    let page;

    beforeEach(async () => {
        // Load the calculator page
        await page.goto('file:///Users/deo/migrations/architecture-audit/calculators/databricks-sizing/index.html');
        await page.waitForSelector('#cloudProvider');
    });

    describe('Cloud Provider Switching', () => {
        test('should update regions when switching to AWS', async () => {
            await page.select('#cloudProvider', 'aws');
            const regions = await page.$$eval('#region option', options =>
                options.map(option => option.value)
            );

            expect(regions).toContain('us-east-1');
            expect(regions).toContain('us-west-2');
            expect(regions).toContain('eu-west-1');
            expect(regions).toContain('ap-southeast-1');
        });

        test('should update regions when switching to Azure', async () => {
            await page.select('#cloudProvider', 'azure');
            const regions = await page.$$eval('#region option', options =>
                options.map(option => option.value)
            );

            expect(regions).toContain('eastus');
            expect(regions).toContain('westus2');
            expect(regions).toContain('westeurope');
            expect(regions).toContain('southeastasia');
        });

        test('should update regions when switching to GCP', async () => {
            await page.select('#cloudProvider', 'gcp');
            const regions = await page.$$eval('#region option', options =>
                options.map(option => option.value)
            );

            expect(regions).toContain('us-central1');
            expect(regions).toContain('us-west1');
            expect(regions).toContain('europe-west1');
            expect(regions).toContain('asia-southeast1');
        });

        test('should update instance types for AWS', async () => {
            await page.select('#cloudProvider', 'aws');
            const instances = await page.$$eval('#instanceType option', options =>
                options.map(option => option.value)
            );

            expect(instances).toContain('m5.xlarge');
            expect(instances).toContain('r5.xlarge');
            expect(instances).toContain('c5.xlarge');
            expect(instances).toContain('p3.2xlarge');
        });

        test('should update instance types for Azure', async () => {
            await page.select('#cloudProvider', 'azure');
            const instances = await page.$$eval('#instanceType option', options =>
                options.map(option => option.value)
            );

            expect(instances).toContain('Standard_D4s_v3');
            expect(instances).toContain('Standard_E4s_v3');
            expect(instances).toContain('Standard_F4s_v2');
            expect(instances).toContain('Standard_NC6s_v3');
        });

        test('should update instance types for GCP', async () => {
            await page.select('#cloudProvider', 'gcp');
            const instances = await page.$$eval('#instanceType option', options =>
                options.map(option => option.value)
            );

            expect(instances).toContain('n2-standard-4');
            expect(instances).toContain('n2-highmem-4');
            expect(instances).toContain('c2-standard-4');
            expect(instances).toContain('a2-highgpu-1g');
        });
    });

    describe('Cross-Cloud Price Calculations', () => {
        test('should calculate AWS pricing correctly', async () => {
            await page.select('#cloudProvider', 'aws');
            await page.select('#region', 'us-east-1');
            await page.fill('#numClusters', '3');
            await page.fill('#nodesPerCluster', '5');
            await page.select('#instanceType', 'm5.xlarge');
            await page.click('#calculateBtn');

            const monthlyCost = await page.$eval('#monthlyCost', el => el.textContent);
            expect(parseFloat(monthlyCost.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
        });

        test('should calculate Azure pricing correctly', async () => {
            await page.select('#cloudProvider', 'azure');
            await page.select('#region', 'eastus');
            await page.fill('#numClusters', '3');
            await page.fill('#nodesPerCluster', '5');
            await page.select('#instanceType', 'Standard_D4s_v3');
            await page.click('#calculateBtn');

            const monthlyCost = await page.$eval('#monthlyCost', el => el.textContent);
            expect(parseFloat(monthlyCost.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
        });

        test('should calculate GCP pricing correctly', async () => {
            await page.select('#cloudProvider', 'gcp');
            await page.select('#region', 'us-central1');
            await page.fill('#numClusters', '3');
            await page.fill('#nodesPerCluster', '5');
            await page.select('#instanceType', 'n2-standard-4');
            await page.click('#calculateBtn');

            const monthlyCost = await page.$eval('#monthlyCost', el => el.textContent);
            expect(parseFloat(monthlyCost.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
        });
    });

    describe('Feature Integration', () => {
        test('should apply Photon acceleration costs', async () => {
            await page.select('#cloudProvider', 'aws');
            await page.fill('#numClusters', '1');
            await page.fill('#nodesPerCluster', '5');

            // Calculate without Photon
            await page.click('#calculateBtn');
            const baseCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Enable Photon
            await page.check('#photonEnabled');
            await page.click('#calculateBtn');
            const photonCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Photon should increase DBU costs
            expect(photonCost).toBeGreaterThan(baseCost);
        });

        test('should apply Unity Catalog costs', async () => {
            await page.select('#cloudProvider', 'aws');
            await page.fill('#numClusters', '1');
            await page.fill('#nodesPerCluster', '5');

            // Calculate without Unity Catalog
            await page.click('#calculateBtn');
            const baseCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Enable Unity Catalog
            await page.check('#unityCatalogEnabled');
            await page.fill('#concurrentUsers', '10');
            await page.click('#calculateBtn');
            const unityCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            expect(unityCost).toBeGreaterThan(baseCost);
        });

        test('should apply Delta Live Tables costs', async () => {
            await page.select('#cloudProvider', 'aws');
            await page.fill('#numClusters', '1');
            await page.fill('#nodesPerCluster', '5');

            // Calculate without DLT
            await page.click('#calculateBtn');
            const baseCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Enable Delta Live Tables
            await page.check('#deltaLiveTablesEnabled');
            await page.click('#calculateBtn');
            const dltCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            expect(dltCost).toBeGreaterThan(baseCost);
        });
    });

    describe('Optimization Features', () => {
        test('should apply spot instance discounts', async () => {
            await page.select('#cloudProvider', 'aws');
            await page.fill('#numClusters', '1');
            await page.fill('#nodesPerCluster', '10');

            // Calculate without spot instances
            await page.uncheck('#spotInstancesEnabled');
            await page.click('#calculateBtn');
            const onDemandCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Enable spot instances
            await page.check('#spotInstancesEnabled');
            await page.fill('#spotInstancePercentage', '70');
            await page.click('#calculateBtn');
            const spotCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Spot instances should reduce costs
            expect(spotCost).toBeLessThan(onDemandCost);
        });

        test('should apply reserved instance discounts', async () => {
            await page.select('#cloudProvider', 'aws');
            await page.fill('#numClusters', '3');
            await page.fill('#nodesPerCluster', '10');

            // Calculate without reserved instances
            await page.uncheck('#reservedInstancesEnabled');
            await page.click('#calculateBtn');
            const onDemandCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Enable reserved instances
            await page.check('#reservedInstancesEnabled');
            await page.fill('#reservedInstancesCoverage', '60');
            await page.click('#calculateBtn');
            const riCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Reserved instances should reduce costs
            expect(riCost).toBeLessThan(onDemandCost);
        });

        test('should combine multiple optimizations', async () => {
            await page.select('#cloudProvider', 'aws');
            await page.fill('#numClusters', '5');
            await page.fill('#nodesPerCluster', '20');

            // Calculate base cost
            await page.uncheck('#spotInstancesEnabled');
            await page.uncheck('#reservedInstancesEnabled');
            await page.uncheck('#autoScalingEnabled');
            await page.click('#calculateBtn');
            const baseCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Enable all optimizations
            await page.check('#spotInstancesEnabled');
            await page.fill('#spotInstancePercentage', '50');
            await page.check('#reservedInstancesEnabled');
            await page.fill('#reservedInstancesCoverage', '40');
            await page.check('#autoScalingEnabled');
            await page.click('#calculateBtn');
            const optimizedCost = await page.$eval('#monthlyCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );

            // Combined optimizations should significantly reduce costs
            expect(optimizedCost).toBeLessThan(baseCost * 0.7); // At least 30% savings
        });
    });

    describe('Comparison Tab Functionality', () => {
        test('should show comparison across all clouds', async () => {
            // Set base configuration
            await page.fill('#numClusters', '3');
            await page.fill('#nodesPerCluster', '10');
            await page.fill('#storageTB', '100');

            // Navigate to comparison tab
            await page.click('button[data-tab="comparison"]');
            await page.click('#compareBtn');

            // Check AWS comparison results
            const awsCost = await page.$eval('#awsComparisonCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            expect(awsCost).toBeGreaterThan(0);

            // Check Azure comparison results
            const azureCost = await page.$eval('#azureComparisonCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            expect(azureCost).toBeGreaterThan(0);

            // Check GCP comparison results
            const gcpCost = await page.$eval('#gcpComparisonCost', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            expect(gcpCost).toBeGreaterThan(0);
        });

        test('should identify cost-optimal provider', async () => {
            await page.fill('#numClusters', '5');
            await page.fill('#nodesPerCluster', '20');
            await page.click('button[data-tab="comparison"]');
            await page.click('#compareBtn');

            const optimalProvider = await page.$eval('#optimalProvider', el => el.textContent);
            expect(['AWS', 'Azure', 'GCP']).toContain(optimalProvider);

            const savingsAmount = await page.$eval('#optimalSavings', el =>
                parseFloat(el.textContent.replace(/[^0-9.]/g, ''))
            );
            expect(savingsAmount).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Export and Save Functionality', () => {
        test('should export configuration as JSON', async () => {
            // Set configuration
            await page.select('#cloudProvider', 'aws');
            await page.fill('#numClusters', '3');
            await page.fill('#nodesPerCluster', '10');
            await page.check('#photonEnabled');

            // Export configuration
            await page.click('#exportBtn');

            // Check download was triggered
            const downloadData = await page.evaluate(() => {
                const link = document.querySelector('a[download]');
                return link ? link.getAttribute('download') : null;
            });

            expect(downloadData).toContain('databricks-sizing');
            expect(downloadData).toContain('.json');
        });

        test('should save configuration to localStorage', async () => {
            // Set configuration
            await page.select('#cloudProvider', 'azure');
            await page.fill('#numClusters', '5');
            await page.fill('#nodesPerCluster', '15');

            // Save configuration
            await page.click('#saveBtn');

            // Check localStorage
            const savedConfig = await page.evaluate(() => {
                return localStorage.getItem('databricksConfig');
            });

            expect(savedConfig).toBeTruthy();
            const config = JSON.parse(savedConfig);
            expect(config.cloudProvider).toBe('azure');
            expect(config.numClusters).toBe('5');
            expect(config.nodesPerCluster).toBe('15');
        });

        test('should load saved configuration', async () => {
            // Save a configuration
            const testConfig = {
                cloudProvider: 'gcp',
                numClusters: '7',
                nodesPerCluster: '25',
                photonEnabled: true
            };

            await page.evaluate(config => {
                localStorage.setItem('databricksConfig', JSON.stringify(config));
            }, testConfig);

            // Load configuration
            await page.click('#loadBtn');

            // Verify loaded values
            const cloudProvider = await page.$eval('#cloudProvider', el => el.value);
            const numClusters = await page.$eval('#numClusters', el => el.value);
            const nodesPerCluster = await page.$eval('#nodesPerCluster', el => el.value);
            const photonEnabled = await page.$eval('#photonEnabled', el => el.checked);

            expect(cloudProvider).toBe('gcp');
            expect(numClusters).toBe('7');
            expect(nodesPerCluster).toBe('25');
            expect(photonEnabled).toBe(true);
        });
    });
});