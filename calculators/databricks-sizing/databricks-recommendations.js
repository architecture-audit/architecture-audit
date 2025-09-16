// Databricks Intelligent Sizing Recommendation Engine
const DatabricksRecommendationEngine = {
    // Configuration scoring weights
    weights: {
        cost: 0.35,
        performance: 0.30,
        scalability: 0.20,
        reliability: 0.15
    },

    // Initialize the engine
    init: function() {
        this.templates = WorkloadTemplates.templates;
        this.scoringEngine = new ScoringEngine();
        this.explainer = new ExplanationEngine();
    },

    // Main recommendation function
    recommend: function(userInputs) {
        console.log('Starting recommendation process for:', userInputs);

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
            'batch_etl': ['batch_etl_small', 'batch_etl_medium'],
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

        // Scale adjustment based on data volume
        const volumeScale = inputs.dataVolume / template.characteristics.dataVolume;
        if (volumeScale > 1) {
            // Need to scale up
            config.configuration.nodeCount = Math.ceil(template.configuration.nodeCount * Math.sqrt(volumeScale));
            config.configuration.maxNodes = Math.ceil(template.configuration.maxNodes * Math.sqrt(volumeScale));

            // Upgrade instance type if scaling is significant
            if (volumeScale > 3) {
                config.configuration.instanceType = this.upgradeInstanceType(template.configuration.instanceType);
            }
        } else if (volumeScale < 0.5) {
            // Can scale down
            config.configuration.nodeCount = Math.max(1, Math.floor(template.configuration.nodeCount * volumeScale * 2));
            config.configuration.maxNodes = Math.max(2, Math.floor(template.configuration.maxNodes * volumeScale * 2));
        }

        // User count adjustment
        const userScale = inputs.userCount / template.characteristics.userCount;
        if (userScale > 2 && config.configuration.clusterType === 'standard') {
            config.configuration.clusterType = 'highconcurrency';
        }

        // Storage adjustment
        config.configuration.storage.deltaStorage = Math.ceil(inputs.dataVolume * 3); // 3x for versioning

        // Update cost estimate
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
        if (inputs.optimizationMode === 'performance') {
            optimized.configuration.spotInstancePercent = 0;
            optimized.configuration.features.photon = true;
            optimized.configuration.instanceType = this.upgradeInstanceType(config.configuration.instanceType);
        }

        // Cost optimization
        if (inputs.optimizationMode === 'cost') {
            optimized.configuration.spotInstancePercent = 70;
            optimized.configuration.reservedInstancePercent = 0;
            optimized.configuration.features.photon = false;
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
        performance.configuration.instanceType = this.upgradeInstanceType(primaryConfig.configuration.instanceType);
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
                explanation: this.explainer.explainConfiguration(primary, inputs),
                pros: this.explainer.generatePros(primary),
                cons: this.explainer.generateCons(primary)
            },
            alternatives: alternatives.map(alt => ({
                name: alt.name,
                configuration: alt.configuration,
                estimatedCost: alt.estimatedCost,
                explanation: this.explainer.explainAlternative(alt, primary),
                tradeoffs: this.explainer.compareTradeoffs(alt, primary)
            })),
            insights: this.generateInsights(primary, inputs)
        };

        return result;
    },

    // Helper function to upgrade instance type
    upgradeInstanceType: function(currentType) {
        const upgradePath = {
            'i3.xlarge': 'i3.2xlarge',
            'i3.2xlarge': 'i3.4xlarge',
            'i3.4xlarge': 'i3.8xlarge',
            'i3.8xlarge': 'i3.16xlarge',
            'r5.xlarge': 'r5.2xlarge',
            'r5.2xlarge': 'r5.4xlarge',
            'p3.2xlarge': 'p3.8xlarge',
            'p3.8xlarge': 'p3.16xlarge'
        };
        return upgradePath[currentType] || currentType;
    },

    // Helper function to downgrade instance type
    downgradeInstanceType: function(currentType) {
        const downgradePath = {
            'i3.16xlarge': 'i3.8xlarge',
            'i3.8xlarge': 'i3.4xlarge',
            'i3.4xlarge': 'i3.2xlarge',
            'i3.2xlarge': 'i3.xlarge',
            'r5.4xlarge': 'r5.2xlarge',
            'r5.2xlarge': 'r5.xlarge',
            'p3.16xlarge': 'p3.8xlarge',
            'p3.8xlarge': 'p3.2xlarge'
        };
        return downgradePath[currentType] || currentType;
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
        const instancePricing = {
            'i3.xlarge': { aws: 0.31, azure: 0.33, gcp: 0.32 },
            'i3.2xlarge': { aws: 0.62, azure: 0.66, gcp: 0.64 },
            'i3.4xlarge': { aws: 1.24, azure: 1.32, gcp: 1.28 },
            'i3.8xlarge': { aws: 2.48, azure: 2.64, gcp: 2.56 },
            'r5.xlarge': { aws: 0.25, azure: 0.27, gcp: 0.26 },
            'r5.2xlarge': { aws: 0.50, azure: 0.54, gcp: 0.52 },
            'p3.2xlarge': { aws: 3.06, azure: 3.30, gcp: 3.20 },
            'p3.8xlarge': { aws: 12.24, azure: 13.20, gcp: 12.80 }
        };

        const dbuPricing = {
            standard: { aws: 0.75, azure: 0.80, gcp: 0.78 },
            highconcurrency: { aws: 0.90, azure: 0.95, gcp: 0.92 },
            ml: { aws: 1.20, azure: 1.25, gcp: 1.22 },
            sql: { aws: 0.60, azure: 0.65, gcp: 0.62 }
        };

        const basePrice = instancePricing[config.instanceType]?.[cloudProvider] || 1.0;
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

        // Add feature costs
        if (config.features.photon) {
            hourlyCost *= 1.2; // 20% more for Photon
        }
        if (config.features.unityCatalog) {
            hourlyCost += 0.5; // Fixed cost per hour
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

    // Calculate confidence score
    calculateConfidence: function(config, inputs) {
        let confidence = 70; // Base confidence

        // Add confidence for good template match
        const templateMatch = this.findBestTemplate(inputs);
        if (templateMatch.score > 20) {
            confidence += 15;
        }

        // Add confidence if within budget
        if (inputs.budget && config.estimatedCost.monthly[inputs.cloudProvider] <= inputs.budget) {
            confidence += 10;
        }

        // Add confidence for common workload types
        if (['streaming', 'batch_etl', 'business_intelligence'].includes(inputs.workloadType)) {
            confidence += 5;
        }

        return Math.min(95, confidence); // Cap at 95%
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
    }
};

// Scoring Engine
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

// Explanation Engine
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

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabricksRecommendationEngine;
}
if (typeof window !== 'undefined') {
    window.DatabricksRecommendationEngine = DatabricksRecommendationEngine;
}