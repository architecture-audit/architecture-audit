// Databricks Intelligent Sizing Recommendation Engine
const DatabricksRecommendationEngine = {
    // Configuration scoring weights
    weights: {
        cost: 0.35,
        performance: 0.30,
        scalability: 0.20,
        reliability: 0.15
    },

    optimizedCache: null,

    // Initialize the engine
    init: async function() {
        this.templates = WorkloadTemplates.templates;

        // Try to load optimized cache
        if (typeof DatabricksOptimizedCache !== 'undefined') {
            this.optimizedCache = new DatabricksOptimizedCache();
            const cacheLoaded = await this.optimizedCache.init();
            if (cacheLoaded) {
                console.log('Optimization cache loaded successfully');
            } else {
                console.log('Using template-based recommendations');
            }
        }
    },

    // Main recommendation function
    recommend: async function(userInputs) {
        console.log('Starting recommendation process for:', userInputs);

        // Try optimized cache first
        if (this.optimizedCache) {
            const cachedRecommendation = this.optimizedCache.getRecommendation(userInputs);
            if (cachedRecommendation) {
                console.log('Using optimized recommendation');

                // Generate alternatives based on cached recommendation
                const alternatives = this.generateAlternatives(cachedRecommendation, userInputs);

                // Ensure alternatives have proper structure with tradeoffs
                const formattedAlternatives = alternatives.map(alt => ({
                    ...alt,
                    explanation: alt.explanation || this.explainAlternative(alt, cachedRecommendation, userInputs),
                    tradeoffs: alt.tradeoffs || this.compareTradeoffs(alt, cachedRecommendation)
                }));

                // Format for compatibility with existing system
                return {
                    primary: cachedRecommendation,
                    alternatives: formattedAlternatives,
                    insights: cachedRecommendation.insights || this.generateInsights(cachedRecommendation, userInputs),
                    source: 'optimized-cache'
                };
            }
        }

        // Fallback to template-based recommendation
        console.log('Using template-based recommendation');

        // Step 1: Find base template
        const baseTemplate = this.findBestTemplate(userInputs);

        // Step 2: Adjust for specific requirements
        const adjustedConfig = this.adjustConfiguration(baseTemplate.template, userInputs);

        // Step 3: Optimize for constraints
        const optimizedConfig = this.optimizeForConstraints(adjustedConfig, userInputs);

        // Step 4: Generate alternatives
        const alternatives = this.generateAlternatives(optimizedConfig, userInputs);

        // Step 5: Add explanations
        const recommendations = this.addExplanations(optimizedConfig, alternatives, userInputs);

        return recommendations;
    },

    // Find the best matching template
    findBestTemplate: function(inputs) {
        const workloadMap = {
            'streaming': ['streaming_small', 'streaming_medium'],
            'batch_processing': ['batch_etl_small', 'batch_etl_medium'],
            'machine_learning': ['ml_training_small', 'ml_training_large'],
            'data_science': ['datascience_small'],
            'business_intelligence': ['bi_reporting']
        };

        const candidateIds = workloadMap[inputs.workloadType] || Object.keys(this.templates);
        let bestMatch = null;
        let bestScore = -1;

        for (const id of candidateIds) {
            const template = this.templates[id];
            const score = this.calculateTemplateScore(template, inputs);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = template;
            }
        }

        return { template: bestMatch, score: bestScore };
    },

    // Calculate how well a template matches user requirements
    calculateTemplateScore: function(template, inputs) {
        let score = 0;

        // Data volume match (0-10 points)
        const volumeRatio = inputs.dataVolume / template.characteristics.dataVolume;
        if (volumeRatio >= 0.5 && volumeRatio <= 2) {
            score += 10 * (1 - Math.abs(1 - volumeRatio));
        }

        // User count match (0-5 points)
        const userRatio = inputs.userCount / template.characteristics.userCount;
        if (userRatio >= 0.5 && userRatio <= 2) {
            score += 5 * (1 - Math.abs(1 - userRatio));
        }

        // Budget match (0-8 points)
        if (inputs.budget) {
            const costRatio = template.estimatedCost.monthly[inputs.cloudProvider] / inputs.budget;
            if (costRatio <= 1) {
                score += 8 * (1 - costRatio);
            }
        }

        // SLA match (0-3 points)
        if (inputs.slaRequirement === 'critical' && template.characteristics.availabilityTarget >= 99.9) {
            score += 3;
        } else if (inputs.slaRequirement === 'standard' && template.characteristics.availabilityTarget >= 99.5) {
            score += 2;
        } else if (inputs.slaRequirement === 'basic') {
            score += 1;
        }

        return score;
    },

    // Adjust configuration based on specific inputs
    adjustConfiguration: function(template, inputs) {
        const config = JSON.parse(JSON.stringify(template)); // Deep clone

        // Map instance type to cloud provider
        config.configuration.instanceType = this.mapInstanceToCloud(
            template.configuration.instanceType,
            inputs.cloudProvider
        );

        // IMPROVED SCALING RULES

        // 1. DATA VOLUME SCALING
        // Realistic scaling: ~500GB per node for batch, ~250GB per node for interactive
        let dataNodes = 2; // Start with minimum 2 nodes

        if (inputs.dataVolume < 100) {
            // Small data: can use serverless or minimal nodes
            dataNodes = 1;
            if (inputs.priority === 'cost') {
                config.configuration.clusterType = 'serverless-sql';
            }
        } else if (inputs.dataVolume < 1000) {
            // Medium data (100GB - 1TB)
            dataNodes = Math.ceil(inputs.dataVolume / 500); // ~500GB per node
        } else if (inputs.dataVolume < 10000) {
            // Large data (1TB - 10TB)
            dataNodes = Math.ceil(inputs.dataVolume / 750); // ~750GB per node
        } else {
            // Very large data (>10TB)
            dataNodes = Math.ceil(inputs.dataVolume / 1000); // ~1TB per node
            // Cap at reasonable maximum
            dataNodes = Math.min(dataNodes, 100);
        }

        // 2. USER CONCURRENCY SCALING
        // Rule: 1 node per 25 concurrent users for interactive workloads
        // Rule: 1 node per 50 users for batch workloads
        let userNodes = 1;
        if (inputs.workloadType === 'business_intelligence' || inputs.workloadType === 'data_science') {
            userNodes = Math.ceil(inputs.userCount / 25);
        } else if (inputs.workloadType === 'streaming' || inputs.workloadType === 'batch_processing') {
            userNodes = Math.ceil(inputs.userCount / 50);
        } else if (inputs.workloadType === 'machine_learning') {
            userNodes = Math.ceil(inputs.userCount / 30);
        }

        // 3. COMBINE DATA AND USER REQUIREMENTS
        // Take the maximum of data-driven and user-driven node counts
        let finalNodeCount = Math.max(dataNodes, userNodes);

        // Apply reasonable limits based on workload type
        if (inputs.workloadType === 'streaming') {
            finalNodeCount = Math.min(finalNodeCount, 50); // Cap streaming at 50 nodes
        } else if (inputs.workloadType === 'batch_processing') {
            finalNodeCount = Math.min(finalNodeCount, 100); // Cap batch at 100 nodes
        } else {
            finalNodeCount = Math.min(finalNodeCount, 30); // Cap interactive at 30 nodes
        }

        // Ensure minimum nodes for reliability
        if (inputs.slaRequirement === 'critical') {
            finalNodeCount = Math.max(finalNodeCount, 3);
        } else {
            finalNodeCount = Math.max(finalNodeCount, 2);
        }

        config.configuration.nodeCount = finalNodeCount;
        config.configuration.minNodes = Math.max(2, Math.floor(config.configuration.nodeCount * 0.5));
        config.configuration.maxNodes = Math.min(100, Math.ceil(config.configuration.nodeCount * 1.5));

        // 4. CLUSTER TYPE SELECTION based on workload and user count
        if (inputs.dataVolume < 100 && inputs.userCount < 10) {
            // Serverless SQL Warehouse for small interactive workloads
            config.configuration.clusterType = 'serverless-sql';
            config.configuration.serverless = true;
        } else if (inputs.userCount > 50) {
            // High concurrency for many users
            config.configuration.clusterType = 'highconcurrency';
        } else if (inputs.workloadType === 'machine_learning') {
            // ML-specific cluster
            config.configuration.clusterType = 'ml';
        } else if (inputs.workloadType === 'streaming') {
            // Streaming-optimized cluster
            config.configuration.clusterType = 'streaming';
        } else if (inputs.workloadType === 'batch_processing' && inputs.dataVolume > 5000) {
            // Job cluster for large batch
            config.configuration.clusterType = 'job';
        }

        // 5. INSTANCE TYPE SELECTION based on workload characteristics
        // Select appropriate instance type based on workload and size
        if (inputs.workloadType === 'machine_learning') {
            // ML: GPU instances
            config.configuration.instanceType = this.getGPUInstance(inputs.cloudProvider);
        } else if (inputs.dataVolume > 10000 && inputs.priority !== 'cost') {
            // Very large data: use larger storage-optimized instances
            config.configuration.instanceType = this.getStorageOptimizedInstance(inputs.cloudProvider);
        } else if (inputs.userCount > 100 && inputs.priority === 'performance') {
            // Many users with performance priority: memory-optimized for caching
            config.configuration.instanceType = this.getMemoryOptimizedInstance(inputs.cloudProvider);
        } else {
            // Standard selection based on priority and data size
            if (inputs.priority === 'cost') {
                config.configuration.instanceType = inputs.dataVolume < 1000 ? 'i3.xlarge' : 'i3.2xlarge';
            } else if (inputs.priority === 'performance') {
                config.configuration.instanceType = inputs.dataVolume < 5000 ? 'i3.4xlarge' : 'i3.8xlarge';
            } else {
                // Balanced
                config.configuration.instanceType = inputs.dataVolume < 2000 ? 'i3.2xlarge' : 'i3.4xlarge';
            }
        }

        // 6. STORAGE CALCULATION
        // More sophisticated storage calculation
        if (inputs.workloadType === 'streaming') {
            config.configuration.storage.deltaStorage = Math.ceil(inputs.dataVolume * 5); // 5x for streaming checkpoints
        } else {
            config.configuration.storage.deltaStorage = Math.ceil(inputs.dataVolume * 3); // 3x for versioning
        }
        config.configuration.storage.checkpointStorage = Math.ceil(inputs.dataVolume * 0.2);

        // Final instance type mapping to ensure cloud-specific instances
        config.configuration.instanceType = this.mapInstanceToCloud(
            config.configuration.instanceType,
            inputs.cloudProvider
        );

        // Update cost estimate with the correct cloud-specific instance
        config.estimatedCost = this.calculateCost(config.configuration, inputs.cloudProvider);

        return config;
    },

    // Optimize for specific constraints (budget, performance, etc.)
    optimizeForConstraints: function(config, inputs) {
        const optimized = JSON.parse(JSON.stringify(config));

        // Budget optimization
        if (inputs.budget && config.estimatedCost.monthly[inputs.cloudProvider] > inputs.budget) {
            optimized.configuration = this.reduceCostToFitBudget(config.configuration, inputs.budget, inputs.cloudProvider);
        }

        // Performance optimization
        if (inputs.optimizationMode === 'performance' || inputs.priority === 'performance') {
            optimized.configuration.spotInstancePercent = 0;
            optimized.configuration.features.photon = true;
            optimized.configuration.instanceType = this.upgradeInstanceType(
                config.configuration.instanceType,
                inputs.cloudProvider
            );
        }

        // Cost optimization - SIGNIFICANT REDUCTIONS
        if (inputs.optimizationMode === 'cost' || inputs.priority === 'cost') {
            optimized.configuration.spotInstancePercent = 70;
            optimized.configuration.reservedInstancePercent = 0;
            optimized.configuration.features.photon = false;
            // Reduce node count for cost optimization
            optimized.configuration.nodeCount = Math.max(2, Math.floor(config.configuration.nodeCount * 0.6));
            optimized.configuration.maxNodes = Math.max(4, Math.floor(config.configuration.maxNodes * 0.6));
            // Use smaller instance type for cost
            optimized.configuration.instanceType = this.downgradeInstanceType(
                config.configuration.instanceType,
                inputs.cloudProvider
            );
        }

        // Reliability optimization
        if (inputs.slaRequirement === 'critical') {
            optimized.configuration.spotInstancePercent = 0;
            optimized.configuration.reservedInstancePercent = 100;
            optimized.configuration.minNodes = Math.max(2, config.configuration.minNodes);
        }

        return optimized;
    },

    // Generate alternative configurations
    generateAlternatives: function(primaryConfig, inputs) {
        const alternatives = [];

        // Conservative option (higher reliability, higher cost)
        const conservative = JSON.parse(JSON.stringify(primaryConfig));
        conservative.name = 'Conservative';
        conservative.configuration.spotInstancePercent = 0;
        conservative.configuration.reservedInstancePercent = 100;
        conservative.configuration.nodeCount = Math.ceil(primaryConfig.configuration.nodeCount * 1.2);
        conservative.estimatedCost = this.calculateCost(conservative.configuration, inputs.cloudProvider);
        alternatives.push(conservative);

        // Aggressive option (lower cost, some risk)
        const aggressive = JSON.parse(JSON.stringify(primaryConfig));
        aggressive.name = 'Cost-Optimized';
        aggressive.configuration.spotInstancePercent = 70;
        aggressive.configuration.reservedInstancePercent = 0;
        aggressive.configuration.features.photon = false;
        aggressive.configuration.nodeCount = Math.max(1, Math.floor(primaryConfig.configuration.nodeCount * 0.8));
        aggressive.estimatedCost = this.calculateCost(aggressive.configuration, inputs.cloudProvider);
        alternatives.push(aggressive);

        // Performance option (max performance, higher cost)
        const performance = JSON.parse(JSON.stringify(primaryConfig));
        performance.name = 'Performance-Optimized';
        performance.configuration.instanceType = this.upgradeInstanceType(
            primaryConfig.configuration.instanceType,
            inputs.cloudProvider
        );
        performance.configuration.features.photon = true;
        performance.configuration.nodeCount = Math.ceil(primaryConfig.configuration.nodeCount * 1.5);
        performance.estimatedCost = this.calculateCost(performance.configuration, inputs.cloudProvider);
        alternatives.push(performance);

        return alternatives;
    },

    // Add explanations to recommendations
    addExplanations: function(primary, alternatives, inputs) {
        const result = {
            primary: {
                configuration: primary.configuration,
                estimatedCost: primary.estimatedCost,
                confidence: this.calculateConfidence(primary, inputs),
                explanation: this.generateExplanation(primary, inputs),
                pros: this.generatePros(primary, inputs),
                cons: this.generateCons(primary, inputs)
            },
            alternatives: alternatives.map(alt => ({
                name: alt.name,
                configuration: alt.configuration,
                estimatedCost: alt.estimatedCost,
                explanation: this.explainAlternative(alt, primary, inputs),
                tradeoffs: this.compareTradeoffs(alt, primary)
            })),
            insights: this.generateInsights(primary, inputs)
        };

        return result;
    },

    // Helper function to upgrade instance type
    // Get storage-optimized instance for cloud provider
    getStorageOptimizedInstance: function(cloudProvider) {
        const instances = {
            aws: 'i3.4xlarge',    // Storage optimized with NVMe SSD
            azure: 'Standard_L16s_v2', // Storage optimized with NVMe
            gcp: 'n1-standard-16' // With local SSD
        };
        return instances[cloudProvider] || 'i3.4xlarge';
    },

    // Get memory-optimized instance for cloud provider
    getMemoryOptimizedInstance: function(cloudProvider) {
        const instances = {
            aws: 'r5.4xlarge',     // 16 vCPU, 128 GB RAM
            azure: 'Standard_E16s_v3', // 16 vCPU, 128 GB RAM
            gcp: 'n2-highmem-16'   // 16 vCPU, 128 GB RAM
        };
        return instances[cloudProvider] || 'r5.4xlarge';
    },

    // Get GPU instance for ML workloads
    getGPUInstance: function(cloudProvider) {
        const instances = {
            aws: 'g4dn.2xlarge',   // 1 GPU, good for ML
            azure: 'Standard_NC6s_v3', // 1 V100 GPU
            gcp: 'a2-highgpu-1g'   // 1 A100 GPU
        };
        return instances[cloudProvider] || 'g4dn.2xlarge';
    },

    // Map instance type to cloud provider equivalent
    mapInstanceToCloud: function(instanceType, cloudProvider) {
        const instanceMapping = {
            aws: {
                'i3.xlarge': 'i3.xlarge',
                'i3.2xlarge': 'i3.2xlarge',
                'i3.4xlarge': 'i3.4xlarge',
                'i3.8xlarge': 'i3.8xlarge',
                'r5.xlarge': 'r5.xlarge',
                'r5.2xlarge': 'r5.2xlarge',
                'r5.4xlarge': 'r5.4xlarge',
                'm5.large': 'm5.large',
                'm5.xlarge': 'm5.xlarge',
                'm5.2xlarge': 'm5.2xlarge',
                'm5.4xlarge': 'm5.4xlarge',
                'm5.8xlarge': 'm5.8xlarge',
                'm5.12xlarge': 'm5.12xlarge',
                'm5.16xlarge': 'm5.16xlarge',
                'm5.24xlarge': 'm5.24xlarge',
                'c5.large': 'c5.large',
                'c5.xlarge': 'c5.xlarge',
                'c5.2xlarge': 'c5.2xlarge',
                'c5.4xlarge': 'c5.4xlarge',
                'c5.9xlarge': 'c5.9xlarge',
                'g4dn.xlarge': 'g4dn.xlarge',
                'g4dn.2xlarge': 'g4dn.2xlarge',
                'p3.2xlarge': 'p3.2xlarge'
            },
            azure: {
                'i3.xlarge': 'Standard_L4s_v2',
                'i3.2xlarge': 'Standard_L8s_v2',
                'i3.4xlarge': 'Standard_L16s_v2',
                'i3.8xlarge': 'Standard_L32s_v2',
                'r5.xlarge': 'Standard_E4s_v3',
                'r5.2xlarge': 'Standard_E8s_v3',
                'r5.4xlarge': 'Standard_E16s_v3',
                'm5.xlarge': 'Standard_D4s_v3',
                'm5.2xlarge': 'Standard_D8s_v3',
                'm5.4xlarge': 'Standard_D16s_v3',
                'c5.xlarge': 'Standard_F4s_v2',
                'c5.2xlarge': 'Standard_F8s_v2'
            },
            gcp: {
                'i3.xlarge': 'n1-standard-4',
                'i3.2xlarge': 'n1-standard-8',
                'i3.4xlarge': 'n1-standard-16',
                'i3.8xlarge': 'n1-standard-32',
                'r5.xlarge': 'n2-highmem-4',
                'r5.2xlarge': 'n2-highmem-8',
                'r5.4xlarge': 'n2-highmem-16',
                'm5.xlarge': 'n2-standard-4',
                'm5.2xlarge': 'n2-standard-8',
                'm5.4xlarge': 'n2-standard-16',
                'c5.xlarge': 'n2-highcpu-4',
                'c5.2xlarge': 'n2-highcpu-8'
            }
        };

        const mapping = instanceMapping[cloudProvider];
        if (!mapping) return instanceType; // Default to original if no provider

        // Try to find direct mapping
        if (mapping[instanceType]) {
            return mapping[instanceType];
        }

        // Try to find the cloud-specific instance in reverse mapping
        for (const [awsInstance, cloudInstance] of Object.entries(mapping)) {
            if (cloudInstance === instanceType) {
                return cloudInstance; // Already correct for this cloud
            }
        }

        // Default fallback based on cloud provider
        if (cloudProvider === 'azure') return 'Standard_D8s_v3';
        if (cloudProvider === 'gcp') return 'n2-standard-8';
        return 'm5.2xlarge';
    },

    upgradeInstanceType: function(currentType, cloudProvider) {
        const upgradePath = {
            aws: {
                'm5.xlarge': 'm5.2xlarge',
                'm5.2xlarge': 'm5.4xlarge',
                'm5.4xlarge': 'm5.8xlarge',
                'i3.xlarge': 'i3.2xlarge',
                'i3.2xlarge': 'i3.4xlarge',
                'i3.4xlarge': 'i3.8xlarge',
                'r5.xlarge': 'r5.2xlarge',
                'r5.2xlarge': 'r5.4xlarge',
                'c5.xlarge': 'c5.2xlarge',
                'c5.2xlarge': 'c5.4xlarge'
            },
            azure: {
                'Standard_D4s_v3': 'Standard_D8s_v3',
                'Standard_D8s_v3': 'Standard_D16s_v3',
                'Standard_D16s_v3': 'Standard_D32s_v3',
                'Standard_L4s_v2': 'Standard_L8s_v2',
                'Standard_L8s_v2': 'Standard_L16s_v2',
                'Standard_L16s_v2': 'Standard_L32s_v2',
                'Standard_E4s_v3': 'Standard_E8s_v3',
                'Standard_E8s_v3': 'Standard_E16s_v3',
                'Standard_F4s_v2': 'Standard_F8s_v2',
                'Standard_F8s_v2': 'Standard_F16s_v2'
            },
            gcp: {
                'n2-standard-4': 'n2-standard-8',
                'n2-standard-8': 'n2-standard-16',
                'n2-standard-16': 'n2-standard-32',
                'n1-standard-4': 'n1-standard-8',
                'n1-standard-8': 'n1-standard-16',
                'n1-standard-16': 'n1-standard-32',
                'n2-highmem-4': 'n2-highmem-8',
                'n2-highmem-8': 'n2-highmem-16',
                'n2-highcpu-4': 'n2-highcpu-8',
                'n2-highcpu-8': 'n2-highcpu-16'
            }
        };

        const cloudPath = upgradePath[cloudProvider] || upgradePath.aws;
        return cloudPath[currentType] || currentType;
    },

    downgradeInstanceType: function(currentType, cloudProvider) {
        const downgradePath = {
            aws: {
                'm5.8xlarge': 'm5.4xlarge',
                'm5.4xlarge': 'm5.2xlarge',
                'm5.2xlarge': 'm5.xlarge',
                'i3.8xlarge': 'i3.4xlarge',
                'i3.4xlarge': 'i3.2xlarge',
                'i3.2xlarge': 'i3.xlarge',
                'r5.4xlarge': 'r5.2xlarge',
                'r5.2xlarge': 'r5.xlarge',
                'c5.4xlarge': 'c5.2xlarge',
                'c5.2xlarge': 'c5.xlarge'
            },
            azure: {
                'Standard_D32s_v3': 'Standard_D16s_v3',
                'Standard_D16s_v3': 'Standard_D8s_v3',
                'Standard_D8s_v3': 'Standard_D4s_v3',
                'Standard_L32s_v2': 'Standard_L16s_v2',
                'Standard_L16s_v2': 'Standard_L8s_v2',
                'Standard_L8s_v2': 'Standard_L4s_v2',
                'Standard_E16s_v3': 'Standard_E8s_v3',
                'Standard_E8s_v3': 'Standard_E4s_v3',
                'Standard_F16s_v2': 'Standard_F8s_v2',
                'Standard_F8s_v2': 'Standard_F4s_v2'
            },
            gcp: {
                'n2-standard-32': 'n2-standard-16',
                'n2-standard-16': 'n2-standard-8',
                'n2-standard-8': 'n2-standard-4',
                'n1-standard-32': 'n1-standard-16',
                'n1-standard-16': 'n1-standard-8',
                'n1-standard-8': 'n1-standard-4',
                'n2-highmem-16': 'n2-highmem-8',
                'n2-highmem-8': 'n2-highmem-4',
                'n2-highcpu-16': 'n2-highcpu-8',
                'n2-highcpu-8': 'n2-highcpu-4'
            }
        };

        const cloudPath = downgradePath[cloudProvider] || downgradePath.aws;
        return cloudPath[currentType] || currentType;
    },


    // Reduce cost to fit budget
    reduceCostToFitBudget: function(config, budget, cloudProvider) {
        const adjusted = JSON.parse(JSON.stringify(config));
        let currentCost = this.calculateCost(adjusted, cloudProvider).monthly[cloudProvider];

        // Step 1: Increase spot instances
        if (currentCost > budget && adjusted.spotInstancePercent < 70) {
            adjusted.spotInstancePercent = Math.min(70, adjusted.spotInstancePercent + 30);
            currentCost = this.calculateCost(adjusted, cloudProvider).monthly[cloudProvider];
        }

        // Step 2: Disable expensive features
        if (currentCost > budget && adjusted.features.photon) {
            adjusted.features.photon = false;
            currentCost = this.calculateCost(adjusted, cloudProvider).monthly[cloudProvider];
        }

        // Step 3: Reduce node count
        while (currentCost > budget && adjusted.nodeCount > 1) {
            adjusted.nodeCount--;
            adjusted.maxNodes = Math.max(adjusted.nodeCount + 2, adjusted.maxNodes - 1);
            currentCost = this.calculateCost(adjusted, cloudProvider).monthly[cloudProvider];
        }

        // Step 4: Downgrade instance type
        if (currentCost > budget) {
            adjusted.instanceType = this.downgradeInstanceType(adjusted.instanceType);
            currentCost = this.calculateCost(adjusted, cloudProvider).monthly[cloudProvider];
        }

        return adjusted;
    },

    // Calculate cost for a configuration
    calculateCost: function(config, cloudProvider) {
        // Comprehensive pricing data for AWS, Azure, GCP instances
        const instancePricing = {
            // AWS instances
            'i3.xlarge': { aws: 0.31, azure: null, gcp: null },
            'i3.2xlarge': { aws: 0.62, azure: null, gcp: null },
            'i3.4xlarge': { aws: 1.24, azure: null, gcp: null },
            'i3.8xlarge': { aws: 2.48, azure: null, gcp: null },
            'r5.xlarge': { aws: 0.25, azure: null, gcp: null },
            'r5.2xlarge': { aws: 0.50, azure: null, gcp: null },
            'r5.4xlarge': { aws: 1.00, azure: null, gcp: null },
            'r5.8xlarge': { aws: 2.00, azure: null, gcp: null },
            'c5.xlarge': { aws: 0.17, azure: null, gcp: null },
            'c5.2xlarge': { aws: 0.34, azure: null, gcp: null },
            'm5.xlarge': { aws: 0.19, azure: null, gcp: null },
            'm5.2xlarge': { aws: 0.38, azure: null, gcp: null },
            'p3.2xlarge': { aws: 3.06, azure: null, gcp: null },
            'p3.8xlarge': { aws: 12.24, azure: null, gcp: null },

            // Azure instances
            'Standard_L8s_v2': { aws: null, azure: 0.66, gcp: null },
            'Standard_L16s_v2': { aws: null, azure: 1.32, gcp: null },
            'Standard_L32s_v2': { aws: null, azure: 2.64, gcp: null },
            'Standard_E8s_v3': { aws: null, azure: 0.54, gcp: null },
            'Standard_E16s_v3': { aws: null, azure: 1.08, gcp: null },
            'Standard_E32s_v3': { aws: null, azure: 2.16, gcp: null },
            'Standard_F8s_v2': { aws: null, azure: 0.34, gcp: null },
            'Standard_F16s_v2': { aws: null, azure: 0.68, gcp: null },
            'Standard_D8s_v3': { aws: null, azure: 0.38, gcp: null },
            'Standard_D16s_v3': { aws: null, azure: 0.76, gcp: null },
            'Standard_NC6s_v3': { aws: null, azure: 3.36, gcp: null },
            'Standard_NC24s_v3': { aws: null, azure: 13.44, gcp: null },

            // GCP instances
            'n1-standard-8': { aws: null, azure: null, gcp: 0.38 },
            'n1-standard-16': { aws: null, azure: null, gcp: 0.76 },
            'n1-highmem-8': { aws: null, azure: null, gcp: 0.47 },
            'n1-highmem-16': { aws: null, azure: null, gcp: 0.94 },
            'n1-highcpu-8': { aws: null, azure: null, gcp: 0.28 },
            'n1-highcpu-16': { aws: null, azure: null, gcp: 0.56 },
            'n2-standard-8': { aws: null, azure: null, gcp: 0.39 },
            'n2-standard-16': { aws: null, azure: null, gcp: 0.78 },
            'p100-gpu': { aws: null, azure: null, gcp: 3.20 },
            'v100-gpu': { aws: null, azure: null, gcp: 12.80 }
        };

        // Databricks DBU pricing per hour (actual rates from Databricks pricing)
        const dbuPricing = {
            standard: { aws: 0.75, azure: 0.80, gcp: 0.78 },
            highconcurrency: { aws: 0.90, azure: 0.95, gcp: 0.92 },
            ml: { aws: 1.20, azure: 1.25, gcp: 1.22 },
            sql: { aws: 0.60, azure: 0.65, gcp: 0.62 },
            streaming: { aws: 0.82, azure: 0.87, gcp: 0.85 },
            serverless: { aws: 0.70, azure: 0.74, gcp: 0.72 },
            job: { aws: 0.60, azure: 0.64, gcp: 0.62 }
        };

        // Handle serverless pricing differently
        if (config.serverless) {
            const serverlessRates = {
                aws: { compute: 0.07, storage: 0.023 }, // per DBU-hour, per GB-month
                azure: { compute: 0.074, storage: 0.025 },
                gcp: { compute: 0.072, storage: 0.024 }
            };

            const rate = serverlessRates[cloudProvider];
            const estimatedDBUs = config.nodeCount * 10; // Estimate DBUs based on workload
            const hourlyCost = estimatedDBUs * rate.compute;
            const storageCost = (config.dataVolume || 100) * rate.storage / 730; // Monthly to hourly

            return {
                hourly: hourlyCost + storageCost,
                daily: (hourlyCost + storageCost) * 24,
                monthly: {
                    [cloudProvider]: Math.round((hourlyCost + storageCost) * 24 * 30)
                },
                dbuHours: Math.round(estimatedDBUs * 24 * 30),
                serverless: true
            };
        }

        // Map instance type to correct cloud-specific instance if needed
        let actualInstanceType = config.instanceType;
        if (cloudProvider === 'azure' && !config.instanceType.startsWith('Standard_')) {
            actualInstanceType = this.mapInstanceToCloud(config.instanceType, 'azure');
        } else if (cloudProvider === 'gcp' && !config.instanceType.startsWith('n')) {
            actualInstanceType = this.mapInstanceToCloud(config.instanceType, 'gcp');
        }

        const basePrice = instancePricing[actualInstanceType]?.[cloudProvider] ||
                         instancePricing[config.instanceType]?.[cloudProvider] || 1.0;
        const dbuPrice = dbuPricing[config.clusterType]?.[cloudProvider] || 0.75;

        // Calculate hourly cost
        let hourlyCost = config.nodeCount * (basePrice + dbuPrice);

        // Apply spot discount
        if (config.spotInstancePercent > 0) {
            const spotDiscount = 0.6; // 60% cheaper
            hourlyCost *= (1 - (config.spotInstancePercent / 100 * spotDiscount));
        }

        // Apply reserved discount
        if (config.reservedInstancePercent > 0) {
            const reservedDiscount = 0.3; // 30% cheaper
            hourlyCost *= (1 - (config.reservedInstancePercent / 100 * reservedDiscount));
        }

        // Add feature costs (based on actual Databricks pricing)
        if (config.features?.photon) {
            hourlyCost *= 1.2; // 20% DBU uplift for Photon
        }
        if (config.features?.unityCatalog) {
            hourlyCost += config.nodeCount * 0.10; // Unity Catalog per node cost
        }
        if (config.features?.deltaLiveTables) {
            hourlyCost += config.nodeCount * 0.30; // DLT per node cost
        }
        if (config.features?.mlflow) {
            hourlyCost += config.nodeCount * 0.15; // MLflow tracking cost
        }

        const monthlyCost = hourlyCost * 24 * 30;
        const dbuHours = config.nodeCount * 24 * 30 * (dbuPrice / 0.75); // Normalize to standard DBUs

        return {
            hourly: hourlyCost,
            daily: hourlyCost * 24,
            monthly: {
                [cloudProvider]: Math.round(monthlyCost)
            },
            dbuHours: Math.round(dbuHours)
        };
    },

    // Calculate confidence score with detailed factors
    calculateConfidence: function(config, inputs) {
        let confidence = 0;
        let factors = [];

        // 1. TEMPLATE MATCH CONFIDENCE (0-30 points)
        const templateMatch = this.findBestTemplate(inputs);
        const templateScore = Math.min(30, templateMatch.score * 1.5);
        confidence += templateScore;
        factors.push({
            category: 'Template Match',
            score: templateScore,
            max: 30,
            description: `Workload pattern match: ${Math.round(templateScore)}/30`
        });

        // 2. DATA SIZE CONFIDENCE (0-20 points)
        // How well we can predict performance for this data size
        let dataConfidence = 20;
        if (inputs.dataVolume < 100) {
            dataConfidence = 20; // Very predictable for small data
        } else if (inputs.dataVolume < 1000) {
            dataConfidence = 18; // Good prediction for medium data
        } else if (inputs.dataVolume < 10000) {
            dataConfidence = 15; // Moderate for large data
        } else {
            dataConfidence = 10; // Less certain for very large data
        }
        confidence += dataConfidence;
        factors.push({
            category: 'Data Size',
            score: dataConfidence,
            max: 20,
            description: `Data volume predictability: ${dataConfidence}/20`
        });

        // 3. USER CONCURRENCY CONFIDENCE (0-15 points)
        let userConfidence = 15;
        if (inputs.userCount <= 10) {
            userConfidence = 15; // Very predictable
        } else if (inputs.userCount <= 50) {
            userConfidence = 13; // Good prediction
        } else if (inputs.userCount <= 200) {
            userConfidence = 10; // Moderate
        } else {
            userConfidence = 7; // Less certain for many users
        }
        confidence += userConfidence;
        factors.push({
            category: 'User Concurrency',
            score: userConfidence,
            max: 15,
            description: `User pattern confidence: ${userConfidence}/15`
        });

        // 4. WORKLOAD TYPE EXPERTISE (0-15 points)
        const wellKnownWorkloads = {
            'streaming': 15,
            'batch_processing': 15,
            'business_intelligence': 14,
            'data_science': 13,
            'machine_learning': 11
        };
        const workloadConfidence = wellKnownWorkloads[inputs.workloadType] || 8;
        confidence += workloadConfidence;
        factors.push({
            category: 'Workload Type',
            score: workloadConfidence,
            max: 15,
            description: `Workload expertise: ${workloadConfidence}/15`
        });

        // 5. CONFIGURATION APPROPRIATENESS (0-10 points)
        let configScore = 0;

        // Check if cluster type matches workload
        if (config.configuration.clusterType === 'highconcurrency' && inputs.userCount > 50) {
            configScore += 3;
        } else if (config.configuration.clusterType === 'serverless-sql' && inputs.dataVolume < 100) {
            configScore += 3;
        } else if (config.configuration.clusterType === 'ml' && inputs.workloadType === 'machine_learning') {
            configScore += 3;
        } else {
            configScore += 1;
        }

        // Check if instance type is appropriate
        if (config.configuration.nodeCount >= 2 && config.configuration.nodeCount <= 100) {
            configScore += 3; // Reasonable node count
        }

        // Check if features match workload
        if (inputs.priority === 'performance' && config.configuration.features.photon) {
            configScore += 2;
        } else if (inputs.priority === 'cost' && config.configuration.spotInstancePercent > 50) {
            configScore += 2;
        } else {
            configScore += 1;
        }

        // Check cloud provider support
        if (['aws', 'azure', 'gcp'].includes(inputs.cloudProvider)) {
            configScore += 2;
        }

        confidence += configScore;
        factors.push({
            category: 'Configuration',
            score: configScore,
            max: 10,
            description: `Config appropriateness: ${configScore}/10`
        });

        // 6. COST ESTIMATION ACCURACY (0-10 points)
        let costConfidence = 10;
        if (config.configuration.serverless) {
            costConfidence = 6; // Serverless is harder to predict
        } else if (config.configuration.spotInstancePercent > 50) {
            costConfidence = 7; // Spot pricing varies
        } else if (config.configuration.nodeCount > 20) {
            costConfidence = 8; // Large clusters have more variance
        }
        confidence += costConfidence;
        factors.push({
            category: 'Cost Accuracy',
            score: costConfidence,
            max: 10,
            description: `Cost prediction accuracy: ${costConfidence}/10`
        });

        // Store factors for explanation
        config.confidenceFactors = factors;

        // Calculate final percentage (max 100 points)
        const finalConfidence = Math.round(confidence);

        // Log confidence calculation for debugging
        console.log('Confidence Calculation:', {
            total: finalConfidence,
            factors: factors,
            inputs: inputs
        });

        return Math.min(95, Math.max(70, finalConfidence)); // Min 70%, Max 95%
    },

    // Generate insights
    generateInsights: function(config, inputs) {
        const insights = [];

        // Cost insights
        const monthlyCost = config.estimatedCost.monthly[inputs.cloudProvider];
        if (monthlyCost > 50000) {
            insights.push({
                type: 'cost',
                priority: 'high',
                message: 'Consider committed use contracts for additional 20-30% savings at this scale'
            });
        }

        // Performance insights
        if (config.configuration.features.photon) {
            insights.push({
                type: 'performance',
                priority: 'medium',
                message: 'Photon acceleration enabled - expect 2-3x performance improvement for supported operations'
            });
        }

        // Scaling insights
        if (config.configuration.autoScaling) {
            insights.push({
                type: 'scaling',
                priority: 'low',
                message: `Auto-scaling configured: ${config.configuration.minNodes} to ${config.configuration.maxNodes} nodes`
            });
        }

        // Spot instance insights
        if (config.configuration.spotInstancePercent > 50) {
            insights.push({
                type: 'reliability',
                priority: 'medium',
                message: 'High spot instance usage - consider reducing for critical workloads'
            });
        }

        return insights;
    },

    // Generate explanation for configuration
    generateExplanation: function(config, inputs) {
        const explanations = [];

        // Explain cluster type
        explanations.push(`${config.configuration.clusterType} cluster selected for ${inputs.workloadType} workload`);

        // Explain instance selection
        if (config.configuration.instanceType.includes('Standard_E') || config.configuration.instanceType.includes('r5')) {
            explanations.push('Memory-optimized instances chosen for better data processing performance');
        } else if (config.configuration.instanceType.includes('Standard_L') || config.configuration.instanceType.includes('i3')) {
            explanations.push('Storage-optimized instances selected for high I/O workloads');
        } else if (config.configuration.instanceType.includes('Standard_F') || config.configuration.instanceType.includes('c5')) {
            explanations.push('Compute-optimized instances for CPU-intensive workloads');
        }

        // Explain scaling
        if (config.configuration.nodeCount > 10) {
            explanations.push(`Large cluster (${config.configuration.nodeCount} nodes) configured to handle ${inputs.dataVolume}GB of data and ${inputs.userCount} users`);
        } else if (config.configuration.serverless) {
            explanations.push('Serverless configuration for cost-effective variable workloads');
        }

        // Explain cost optimizations
        if (config.configuration.spotInstancePercent > 0) {
            explanations.push(`${config.configuration.spotInstancePercent}% spot instances used to reduce costs`);
        }

        return explanations; // Return array instead of joined string
    },

    // Generate pros for configuration
    generatePros: function(config, inputs) {
        const pros = [];

        if (config.configuration.features?.photon) {
            pros.push('Photon acceleration for 2-3x performance boost');
        }
        if (config.configuration.autoScaling) {
            pros.push('Auto-scaling enabled for efficient resource utilization');
        }
        if (config.configuration.spotInstancePercent > 50) {
            pros.push('Significant cost savings with spot instances');
        }
        if (config.configuration.serverless) {
            pros.push('Serverless eliminates cluster management overhead');
        }
        if (config.configuration.nodeCount >= inputs.userCount / 30) {
            pros.push('Sufficient capacity for concurrent users');
        }

        return pros;
    },

    // Generate cons for configuration
    generateCons: function(config, inputs) {
        const cons = [];

        if (config.configuration.spotInstancePercent > 70) {
            cons.push('High spot usage may lead to interruptions');
        }
        if (!config.configuration.features?.photon && inputs.priority === 'performance') {
            cons.push('Consider enabling Photon for better performance');
        }
        if (config.configuration.nodeCount < 2 && inputs.slaRequirement === 'critical') {
            cons.push('Single node may not meet high availability requirements');
        }
        if (config.configuration.serverless && inputs.workloadType === 'streaming') {
            cons.push('Serverless may have higher latency for streaming');
        }

        return cons;
    },

    // Explain alternative configuration
    explainAlternative: function(alternative, primary, inputs) {
        const primaryCost = primary.estimatedCost.monthly[inputs.cloudProvider] || 0;
        const altCost = alternative.estimatedCost.monthly[inputs.cloudProvider] || 0;
        const costDiff = altCost - primaryCost;

        if (alternative.name === 'Conservative') {
            return `Higher reliability with no spot instances. ${costDiff > 0 ? 'Costs' : 'Saves'} $${Math.abs(costDiff).toLocaleString()} per month.`;
        } else if (alternative.name === 'Cost-Optimized') {
            return `Maximum cost savings using spot instances. ${costDiff < 0 ? 'Saves' : 'Costs'} $${Math.abs(costDiff).toLocaleString()} per month.`;
        } else if (alternative.name === 'Performance-Optimized') {
            return `Enhanced performance with upgraded instances and Photon. ${costDiff > 0 ? 'Additional' : 'Saves'} $${Math.abs(costDiff).toLocaleString()} per month.`;
        }
        return 'Alternative configuration with different trade-offs';
    },

    // Compare tradeoffs between configurations
    compareTradeoffs: function(alternative, primary) {
        const tradeoffs = {
            cost: 'Similar cost',
            performance: 'Similar performance',
            reliability: 'Similar reliability'
        };

        // Cost comparison
        const primaryCost = Object.values(primary.estimatedCost.monthly)[0] || 0;
        const altCost = Object.values(alternative.estimatedCost.monthly)[0] || 0;

        if (altCost < primaryCost * 0.8) {
            tradeoffs.cost = 'Lower cost';
        } else if (altCost > primaryCost * 1.2) {
            tradeoffs.cost = 'Higher cost';
        }

        // Performance comparison
        if (alternative.configuration.features?.photon && !primary.configuration.features?.photon) {
            tradeoffs.performance = 'Better performance';
        } else if (!alternative.configuration.features?.photon && primary.configuration.features?.photon) {
            tradeoffs.performance = 'Lower performance';
        }

        // Reliability comparison
        if (alternative.configuration.spotInstancePercent < primary.configuration.spotInstancePercent) {
            tradeoffs.reliability = 'Higher reliability';
        } else if (alternative.configuration.spotInstancePercent > primary.configuration.spotInstancePercent) {
            tradeoffs.reliability = 'Lower reliability';
        }

        return tradeoffs;
    }
};

// Note: ScoringEngine and ExplanationEngine functionality integrated into main recommendation system
// Removed unused class declarations to fix initialization errors

/*
// Previous unused ScoringEngine class removed
class ScoringEngine {
    constructor() {
        this.criteria = {
            cost: { weight: 0.35, direction: 'minimize' },
            performance: { weight: 0.30, direction: 'maximize' },
            scalability: { weight: 0.20, direction: 'maximize' },
            reliability: { weight: 0.15, direction: 'maximize' }
        };
    }

    scoreConfiguration(config, requirements) {
        const scores = {
            cost: this.scoreCost(config, requirements),
            performance: this.scorePerformance(config, requirements),
            scalability: this.scoreScalability(config, requirements),
            reliability: this.scoreReliability(config, requirements)
        };

        // Calculate weighted average
        let totalScore = 0;
        for (const [criterion, score] of Object.entries(scores)) {
            totalScore += score * this.criteria[criterion].weight;
        }

        return {
            total: totalScore,
            breakdown: scores
        };
    }

    scoreCost(config, requirements) {
        if (!requirements.budget) return 7; // Neutral score if no budget

        const cost = config.estimatedCost.monthly[requirements.cloudProvider];
        const budgetRatio = cost / requirements.budget;

        if (budgetRatio <= 0.7) return 10; // Well under budget
        if (budgetRatio <= 0.85) return 8;
        if (budgetRatio <= 1.0) return 6;
        if (budgetRatio <= 1.15) return 4;
        return 2; // Significantly over budget
    }

    scorePerformance(config, requirements) {
        let score = 5; // Base score

        // Photon bonus
        if (config.configuration.features.photon) score += 2;

        // Instance type bonus
        if (config.configuration.instanceType.includes('xlarge')) score += 1;
        if (config.configuration.instanceType.includes('4xlarge')) score += 2;

        // Cluster type bonus
        if (config.configuration.clusterType === 'highconcurrency' && requirements.userCount > 20) score += 2;

        return Math.min(10, score);
    }

    scoreScalability(config, requirements) {
        let score = 5;

        // Auto-scaling bonus
        if (config.configuration.autoScaling) score += 3;

        // Headroom bonus
        const maxCapacity = config.configuration.maxNodes * this.getInstanceCapacity(config.configuration.instanceType);
        const requiredCapacity = requirements.dataVolume / 100; // Rough estimate
        const headroom = maxCapacity / requiredCapacity;

        if (headroom >= 3) score += 2;
        else if (headroom >= 2) score += 1;

        return Math.min(10, score);
    }

    scoreReliability(config, requirements) {
        let score = 5;

        // Low spot instance bonus
        if (config.configuration.spotInstancePercent === 0) score += 3;
        else if (config.configuration.spotInstancePercent <= 30) score += 2;
        else if (config.configuration.spotInstancePercent <= 50) score += 1;

        // Reserved instance bonus
        if (config.configuration.reservedInstancePercent >= 70) score += 2;
        else if (config.configuration.reservedInstancePercent >= 50) score += 1;

        // Multi-node bonus
        if (config.configuration.nodeCount >= 3) score += 1;

        return Math.min(10, score);
    }

    getInstanceCapacity(instanceType) {
        const capacityMap = {
            'xlarge': 1,
            '2xlarge': 2,
            '4xlarge': 4,
            '8xlarge': 8,
            '16xlarge': 16
        };

        for (const [size, capacity] of Object.entries(capacityMap)) {
            if (instanceType.includes(size)) return capacity;
        }
        return 1;
    }
}
*/

/* Previous unused ExplanationEngine class removed
class ExplanationEngine {
    explainConfiguration(config, inputs) {
        const explanations = [];

        // Explain cluster type
        explanations.push(`${config.configuration.clusterType} cluster selected for ${inputs.workloadType} workload`);

        // Explain node count
        explanations.push(`${config.configuration.nodeCount} nodes to handle ${inputs.dataVolume}GB data volume`);

        // Explain instance type
        explanations.push(`${config.configuration.instanceType} instances for optimal price/performance`);

        // Explain features
        if (config.configuration.features.photon) {
            explanations.push('Photon enabled for 2-3x performance boost');
        }
        if (config.configuration.features.unityCatalog) {
            explanations.push('Unity Catalog for unified data governance');
        }

        return explanations;
    }

    explainAlternative(alternative, primary) {
        const costDiff = alternative.estimatedCost.monthly[Object.keys(alternative.estimatedCost.monthly)[0]] -
                        primary.estimatedCost.monthly[Object.keys(primary.estimatedCost.monthly)[0]];

        if (alternative.name === 'Conservative') {
            return `Higher reliability with no spot instances. Costs ${Math.abs(costDiff).toLocaleString()} more per month.`;
        } else if (alternative.name === 'Cost-Optimized') {
            return `Maximum cost savings using spot instances. Saves ${Math.abs(costDiff).toLocaleString()} per month.`;
        } else if (alternative.name === 'Performance-Optimized') {
            return `Maximum performance with larger instances. Costs ${Math.abs(costDiff).toLocaleString()} more per month.`;
        }
        return 'Alternative configuration';
    }

    generatePros(config) {
        const pros = [];

        if (config.configuration.features.photon) {
            pros.push('Photon acceleration for faster queries');
        }
        if (config.configuration.autoScaling) {
            pros.push('Auto-scaling for dynamic workloads');
        }
        if (config.configuration.spotInstancePercent > 30) {
            pros.push('Cost-effective with spot instances');
        }
        if (config.configuration.nodeCount >= 3) {
            pros.push('High availability with multiple nodes');
        }

        return pros;
    }

    generateCons(config) {
        const cons = [];

        if (config.configuration.spotInstancePercent > 50) {
            cons.push('Higher risk of interruptions with spot instances');
        }
        if (!config.configuration.features.photon) {
            cons.push('Missing potential performance gains from Photon');
        }
        if (config.configuration.nodeCount === 1) {
            cons.push('Single point of failure with one node');
        }

        return cons;
    }

    compareTradeoffs(alternative, primary) {
        const tradeoffs = {
            cost: this.compareCost(alternative, primary),
            performance: this.comparePerformance(alternative, primary),
            reliability: this.compareReliability(alternative, primary)
        };

        return tradeoffs;
    }

    compareCost(alt, primary) {
        const altCost = alt.estimatedCost.monthly[Object.keys(alt.estimatedCost.monthly)[0]];
        const primaryCost = primary.estimatedCost.monthly[Object.keys(primary.estimatedCost.monthly)[0]];
        const diff = ((altCost - primaryCost) / primaryCost * 100).toFixed(0);

        if (diff > 0) return `+${diff}% cost`;
        return `${diff}% cost`;
    }

    comparePerformance(alt, primary) {
        if (alt.configuration.features.photon && !primary.configuration.features.photon) {
            return '+100% query performance';
        }
        if (alt.configuration.instanceType !== primary.configuration.instanceType) {
            return 'Different performance profile';
        }
        return 'Similar performance';
    }

    compareReliability(alt, primary) {
        const altSpot = alt.configuration.spotInstancePercent;
        const primarySpot = primary.configuration.spotInstancePercent;

        if (altSpot < primarySpot) {
            return 'Higher reliability';
        } else if (altSpot > primarySpot) {
            return 'Lower reliability';
        }
        return 'Similar reliability';
    }
}
*/

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabricksRecommendationEngine;
}
if (typeof window !== 'undefined') {
    window.DatabricksRecommendationEngine = DatabricksRecommendationEngine;
    window.DatabricksRecommendations = DatabricksRecommendationEngine; // Alias for compatibility

    // Auto-initialize when loaded in browser
    if (typeof WorkloadTemplates !== 'undefined') {
        DatabricksRecommendationEngine.init();
    }
}