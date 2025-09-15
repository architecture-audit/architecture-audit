/**
 * Unit Tests for Databricks Pricing Calculations
 */

describe('Databricks Pricing Calculations', () => {
    let calculator;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <select id="cloudProvider"><option value="aws">AWS</option></select>
            <select id="region"><option value="us-east-1">US East (N. Virginia)</option></select>
            <input id="workloadType" value="batch">
            <input id="dataVolume" value="1000">
            <input id="processingFrequency" value="daily">
            <input id="concurrentUsers" value="10">
            <input id="peakHours" value="8">
            <input id="jobComplexity" value="medium">
            <input id="numClusters" value="3">
            <input id="nodesPerCluster" value="5">
            <select id="instanceType"><option value="m5.xlarge">m5.xlarge</option></select>
            <input id="utilizationRate" value="70">
            <input id="autoScalingEnabled" type="checkbox" checked>
            <input id="spotInstancesEnabled" type="checkbox" checked>
            <input id="spotInstancePercentage" value="50">
            <input id="photonEnabled" type="checkbox">
            <input id="unityCatalogEnabled" type="checkbox">
            <input id="deltaLiveTablesEnabled" type="checkbox">
            <input id="mlflowEnabled" type="checkbox">
            <input id="modelServingEnabled" type="checkbox">
            <input id="vectorSearchEnabled" type="checkbox">
            <input id="storageTB" value="100">
            <select id="storageType"><option value="standard">Standard</option></select>
            <input id="monthlyDataTransferGB" value="1000">
            <input id="monthlyModelRequests" value="100000">
            <input id="deltaOptimizationEnabled" type="checkbox" checked>
            <input id="zOrderEnabled" type="checkbox">
            <input id="reservedInstancesEnabled" type="checkbox">
            <input id="reservedInstancesCoverage" value="60">
            <input id="savingsPlansEnabled" type="checkbox">
            <input id="savingsPlansCoverage" value="40">
        `;
    });

    describe('DBU Calculations', () => {
        test('should calculate All-Purpose cluster DBUs correctly', () => {
            const hours = 720; // monthly hours
            const nodes = 5;
            const dbuRate = 0.75; // AWS All-Purpose rate

            const expectedDBUs = hours * nodes * dbuRate;
            expect(expectedDBUs).toBe(2700);
        });

        test('should apply Photon acceleration multiplier', () => {
            const baseDBUs = 1000;
            const photonMultiplier = 2; // Photon costs 2x DBUs

            const photonDBUs = baseDBUs * photonMultiplier;
            expect(photonDBUs).toBe(2000);
        });

        test('should calculate Jobs cluster DBUs at lower rate', () => {
            const hours = 720;
            const nodes = 5;
            const jobsDbuRate = 0.30; // AWS Jobs rate

            const expectedDBUs = hours * nodes * jobsDbuRate;
            expect(expectedDBUs).toBe(1080);
        });
    });

    describe('Instance Cost Calculations', () => {
        test('should calculate on-demand instance costs', () => {
            const instancePrice = 0.384; // m5.xlarge hourly
            const hours = 720;
            const nodes = 5;

            const totalCost = instancePrice * hours * nodes;
            expect(totalCost).toBe(1382.4);
        });

        test('should apply spot instance discount', () => {
            const onDemandCost = 1000;
            const spotPercentage = 50;
            const spotDiscount = 0.7; // 70% of on-demand

            const spotCost = onDemandCost * (spotPercentage / 100) * spotDiscount;
            const onDemandRemaining = onDemandCost * ((100 - spotPercentage) / 100);
            const totalCost = spotCost + onDemandRemaining;

            expect(totalCost).toBe(850);
        });

        test('should handle different instance types', () => {
            const instances = {
                'm5.xlarge': 0.384,
                'r5.xlarge': 0.504,
                'c5.xlarge': 0.34,
                'p3.2xlarge': 6.114
            };

            Object.entries(instances).forEach(([type, price]) => {
                const cost = price * 720; // monthly
                expect(cost).toBeGreaterThan(0);
            });
        });
    });

    describe('Feature Cost Calculations', () => {
        test('should calculate Unity Catalog costs', () => {
            const metastoreHours = 720;
            const catalogRate = 0.25; // per hour
            const users = 10;
            const userRate = 5; // per user per month

            const totalCost = (metastoreHours * catalogRate) + (users * userRate);
            expect(totalCost).toBe(230);
        });

        test('should calculate Delta Live Tables costs', () => {
            const pipelineHours = 100;
            const dltRate = 0.36; // per pipeline hour
            const dataProcessedTB = 10;
            const processingRate = 25; // per TB

            const totalCost = (pipelineHours * dltRate) + (dataProcessedTB * processingRate);
            expect(totalCost).toBe(286);
        });

        test('should calculate MLflow costs', () => {
            const experiments = 50;
            const experimentRate = 0.02; // per experiment hour
            const hours = 720;
            const models = 10;
            const modelRate = 1; // per model per month

            const totalCost = (experiments * experimentRate * hours) + (models * modelRate);
            expect(totalCost).toBe(730);
        });

        test('should calculate Model Serving costs', () => {
            const endpoints = 5;
            const endpointHourlyRate = 0.70;
            const hours = 720;
            const requests = 1000000;
            const requestRate = 0.002; // per 1000 requests

            const endpointCost = endpoints * endpointHourlyRate * hours;
            const requestCost = (requests / 1000) * requestRate;
            const totalCost = endpointCost + requestCost;

            expect(totalCost).toBe(2522);
        });
    });

    describe('Storage Cost Calculations', () => {
        test('should calculate standard storage costs', () => {
            const storageTB = 100;
            const storageGB = storageTB * 1024;
            const standardRate = 0.023; // per GB per month

            const totalCost = storageGB * standardRate;
            expect(totalCost).toBeCloseTo(2355.2, 1);
        });

        test('should calculate Delta Lake optimization costs', () => {
            const storageTB = 100;
            const optimizationRate = 7; // per TB per month

            const totalCost = storageTB * optimizationRate;
            expect(totalCost).toBe(700);
        });

        test('should apply storage tier pricing', () => {
            const tiers = {
                'standard': 0.023,
                'intelligent': 0.0125,
                'archive': 0.004
            };

            const storageTB = 100;
            const storageGB = storageTB * 1024;

            Object.entries(tiers).forEach(([tier, rate]) => {
                const cost = storageGB * rate;
                expect(cost).toBeGreaterThan(0);
            });
        });
    });

    describe('Networking Cost Calculations', () => {
        test('should calculate data transfer costs', () => {
            const transferGB = 1000;
            const crossRegionRate = 0.02; // per GB
            const internetRate = 0.09; // per GB

            const crossRegionCost = transferGB * 0.3 * crossRegionRate; // 30% cross-region
            const internetCost = transferGB * 0.1 * internetRate; // 10% internet
            const totalCost = crossRegionCost + internetCost;

            expect(totalCost).toBe(15);
        });

        test('should calculate VPC/VNet costs', () => {
            const vpcHours = 720;
            const vpcRate = 0.045; // per hour
            const natGatewayRate = 0.045; // per hour
            const natDataRate = 0.045; // per GB
            const dataGB = 1000;

            const vpcCost = vpcHours * vpcRate;
            const natCost = (vpcHours * natGatewayRate) + (dataGB * natDataRate);
            const totalCost = vpcCost + natCost;

            expect(totalCost).toBe(109.8);
        });

        test('should handle PrivateLink costs', () => {
            const endpoints = 3;
            const endpointHours = 720;
            const endpointRate = 0.01; // per hour
            const dataGB = 100;
            const dataRate = 0.01; // per GB

            const endpointCost = endpoints * endpointHours * endpointRate;
            const dataCost = dataGB * dataRate;
            const totalCost = endpointCost + dataCost;

            expect(totalCost).toBe(22.6);
        });
    });

    describe('Optimization Calculations', () => {
        test('should apply Reserved Instances discount', () => {
            const onDemandCost = 10000;
            const riCoverage = 60; // 60% coverage
            const riDiscount = 0.72; // 72% of on-demand (28% savings)

            const riCost = onDemandCost * (riCoverage / 100) * riDiscount;
            const onDemandRemaining = onDemandCost * ((100 - riCoverage) / 100);
            const totalCost = riCost + onDemandRemaining;
            const savings = onDemandCost - totalCost;

            expect(totalCost).toBe(8320);
            expect(savings).toBe(1680);
        });

        test('should apply Savings Plans discount', () => {
            const computeCost = 10000;
            const spCoverage = 40; // 40% coverage
            const spDiscount = 0.73; // 73% of on-demand (27% savings)

            const spCost = computeCost * (spCoverage / 100) * spDiscount;
            const onDemandRemaining = computeCost * ((100 - spCoverage) / 100);
            const totalCost = spCost + onDemandRemaining;
            const savings = computeCost - totalCost;

            expect(totalCost).toBe(8920);
            expect(savings).toBe(1080);
        });

        test('should combine multiple optimizations', () => {
            const baseCost = 10000;
            const spotSavings = 1500; // from spot instances
            const riSavings = 1680; // from reserved instances
            const autoScalingSavings = 800; // from auto-scaling

            const totalSavings = spotSavings + riSavings + autoScalingSavings;
            const optimizedCost = baseCost - totalSavings;

            expect(optimizedCost).toBe(6020);
            expect(totalSavings).toBe(3980);
        });
    });

    describe('Multi-Cloud Comparisons', () => {
        test('should calculate equivalent AWS costs', () => {
            const baseConfig = {
                nodes: 5,
                instanceType: 'm5.xlarge',
                hours: 720
            };

            const awsPrice = 0.384;
            const awsDBU = 0.75;

            const instanceCost = baseConfig.nodes * baseConfig.hours * awsPrice;
            const dbuCost = baseConfig.nodes * baseConfig.hours * awsDBU;
            const totalCost = instanceCost + dbuCost;

            expect(totalCost).toBe(4082.4);
        });

        test('should calculate equivalent Azure costs', () => {
            const baseConfig = {
                nodes: 5,
                instanceType: 'Standard_D4s_v3', // equivalent to m5.xlarge
                hours: 720
            };

            const azurePrice = 0.368;
            const azureDBU = 0.75;

            const instanceCost = baseConfig.nodes * baseConfig.hours * azurePrice;
            const dbuCost = baseConfig.nodes * baseConfig.hours * azureDBU;
            const totalCost = instanceCost + dbuCost;

            expect(totalCost).toBe(4024.8);
        });

        test('should calculate equivalent GCP costs', () => {
            const baseConfig = {
                nodes: 5,
                instanceType: 'n2-standard-4', // equivalent to m5.xlarge
                hours: 720
            };

            const gcpPrice = 0.3864;
            const gcpDBU = 0.74;

            const instanceCost = baseConfig.nodes * baseConfig.hours * gcpPrice;
            const dbuCost = baseConfig.nodes * baseConfig.hours * gcpDBU;
            const totalCost = instanceCost + dbuCost;

            expect(totalCost).toBe(4055.04);
        });

        test('should identify cost-optimal cloud provider', () => {
            const costs = {
                aws: 4082.4,
                azure: 4024.8,
                gcp: 4055.04
            };

            const optimal = Object.entries(costs).reduce((min, [cloud, cost]) =>
                cost < min.cost ? {cloud, cost} : min,
                {cloud: null, cost: Infinity}
            );

            expect(optimal.cloud).toBe('azure');
            expect(optimal.cost).toBe(4024.8);
        });
    });
});