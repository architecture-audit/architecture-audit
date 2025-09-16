// Databricks Workload Templates - Validated Configurations
const WorkloadTemplates = {
    // Template structure with all configuration parameters
    templates: {
        // Streaming Analytics Templates
        'streaming_small': {
            id: 'streaming_small',
            name: 'Small Streaming Analytics',
            description: 'Real-time processing up to 100GB/hour',
            category: 'streaming',

            // Workload characteristics
            characteristics: {
                dataVolume: 100, // GB/hour
                userCount: 10,
                jobComplexity: 'medium',
                latencyRequirement: 'low', // <1 minute
                availabilityTarget: 99.9
            },

            // Recommended configuration
            configuration: {
                // Cluster settings
                clusterType: 'standard',
                nodeCount: 3,
                instanceType: 'i3.2xlarge',
                autoScaling: true,
                minNodes: 2,
                maxNodes: 8,

                // Cost optimization
                spotInstancePercent: 0, // No spot for streaming
                reservedInstancePercent: 70,

                // Features
                features: {
                    photon: true,
                    unityCatalog: true,
                    deltaLiveTable: true,
                    mlRuntime: false,
                    gpuEnabled: false
                },

                // Storage
                storage: {
                    deltaStorage: 500, // GB
                    checkpointStorage: 100 // GB
                }
            },

            // Cost estimates
            estimatedCost: {
                monthly: {
                    aws: 12500,
                    azure: 13200,
                    gcp: 12800
                },
                dbuHours: 8640 // Monthly
            },

            // Scaling factors
            scaling: {
                volumeMultiplier: 1.2, // Cost increases 20% per 100GB/hour
                userMultiplier: 1.1 // Cost increases 10% per 10 users
            }
        },

        'streaming_medium': {
            id: 'streaming_medium',
            name: 'Medium Streaming Analytics',
            description: 'Real-time processing 100GB-1TB/hour',
            category: 'streaming',

            characteristics: {
                dataVolume: 500,
                userCount: 50,
                jobComplexity: 'high',
                latencyRequirement: 'low',
                availabilityTarget: 99.95
            },

            configuration: {
                clusterType: 'highconcurrency',
                nodeCount: 10,
                instanceType: 'i3.4xlarge',
                autoScaling: true,
                minNodes: 5,
                maxNodes: 20,
                spotInstancePercent: 0,
                reservedInstancePercent: 80,
                features: {
                    photon: true,
                    unityCatalog: true,
                    deltaLiveTable: true,
                    mlRuntime: false,
                    gpuEnabled: false
                },
                storage: {
                    deltaStorage: 5000,
                    checkpointStorage: 500
                }
            },

            estimatedCost: {
                monthly: {
                    aws: 45000,
                    azure: 47500,
                    gcp: 46000
                },
                dbuHours: 28800
            },

            scaling: {
                volumeMultiplier: 1.15,
                userMultiplier: 1.08
            }
        },

        // Batch ETL Templates
        'batch_etl_small': {
            id: 'batch_etl_small',
            name: 'Small Batch ETL',
            description: 'Daily batch processing up to 1TB',
            category: 'batch_etl',

            characteristics: {
                dataVolume: 1000, // GB daily
                userCount: 5,
                jobComplexity: 'medium',
                latencyRequirement: 'medium', // Hours
                availabilityTarget: 99.5
            },

            configuration: {
                clusterType: 'standard',
                nodeCount: 2,
                instanceType: 'i3.xlarge',
                autoScaling: true,
                minNodes: 1,
                maxNodes: 5,
                spotInstancePercent: 70, // High spot for batch
                reservedInstancePercent: 0,
                features: {
                    photon: true,
                    unityCatalog: true,
                    deltaLiveTable: false,
                    mlRuntime: false,
                    gpuEnabled: false
                },
                storage: {
                    deltaStorage: 3000,
                    checkpointStorage: 50
                }
            },

            estimatedCost: {
                monthly: {
                    aws: 5500,
                    azure: 5800,
                    gcp: 5600
                },
                dbuHours: 3600
            },

            scaling: {
                volumeMultiplier: 1.3,
                userMultiplier: 1.05
            }
        },

        'batch_etl_medium': {
            id: 'batch_etl_medium',
            name: 'Medium Batch ETL',
            description: 'Daily batch processing 1-10TB',
            category: 'batch_etl',

            characteristics: {
                dataVolume: 5000,
                userCount: 20,
                jobComplexity: 'high',
                latencyRequirement: 'medium',
                availabilityTarget: 99.7
            },

            configuration: {
                clusterType: 'standard',
                nodeCount: 8,
                instanceType: 'i3.2xlarge',
                autoScaling: true,
                minNodes: 4,
                maxNodes: 16,
                spotInstancePercent: 60,
                reservedInstancePercent: 20,
                features: {
                    photon: true,
                    unityCatalog: true,
                    deltaLiveTable: true,
                    mlRuntime: false,
                    gpuEnabled: false
                },
                storage: {
                    deltaStorage: 15000,
                    checkpointStorage: 200
                }
            },

            estimatedCost: {
                monthly: {
                    aws: 22000,
                    azure: 23500,
                    gcp: 22800
                },
                dbuHours: 14400
            },

            scaling: {
                volumeMultiplier: 1.25,
                userMultiplier: 1.08
            }
        },

        // Machine Learning Templates
        'ml_training_small': {
            id: 'ml_training_small',
            name: 'Small ML Training',
            description: 'ML experiments and model training',
            category: 'machine_learning',

            characteristics: {
                dataVolume: 500,
                userCount: 10,
                jobComplexity: 'very_high',
                latencyRequirement: 'high', // Days OK
                availabilityTarget: 99.0
            },

            configuration: {
                clusterType: 'ml',
                nodeCount: 2,
                instanceType: 'p3.2xlarge', // GPU instances
                autoScaling: false,
                minNodes: 2,
                maxNodes: 4,
                spotInstancePercent: 50,
                reservedInstancePercent: 0,
                features: {
                    photon: false, // Not for ML
                    unityCatalog: true,
                    deltaLiveTable: false,
                    mlRuntime: true,
                    gpuEnabled: true
                },
                storage: {
                    deltaStorage: 2000,
                    checkpointStorage: 500,
                    mlflowStorage: 100
                }
            },

            estimatedCost: {
                monthly: {
                    aws: 18000,
                    azure: 19500,
                    gcp: 18500
                },
                dbuHours: 4320
            },

            scaling: {
                volumeMultiplier: 1.4,
                userMultiplier: 1.15
            }
        },

        'ml_training_large': {
            id: 'ml_training_large',
            name: 'Large ML Training',
            description: 'Large-scale ML and deep learning',
            category: 'machine_learning',

            characteristics: {
                dataVolume: 10000,
                userCount: 50,
                jobComplexity: 'very_high',
                latencyRequirement: 'high',
                availabilityTarget: 99.5
            },

            configuration: {
                clusterType: 'ml',
                nodeCount: 8,
                instanceType: 'p3.8xlarge',
                autoScaling: true,
                minNodes: 4,
                maxNodes: 16,
                spotInstancePercent: 30,
                reservedInstancePercent: 40,
                features: {
                    photon: false,
                    unityCatalog: true,
                    deltaLiveTable: false,
                    mlRuntime: true,
                    gpuEnabled: true
                },
                storage: {
                    deltaStorage: 50000,
                    checkpointStorage: 5000,
                    mlflowStorage: 1000
                }
            },

            estimatedCost: {
                monthly: {
                    aws: 125000,
                    azure: 135000,
                    gcp: 128000
                },
                dbuHours: 34560
            },

            scaling: {
                volumeMultiplier: 1.35,
                userMultiplier: 1.12
            }
        },

        // Data Science Interactive Templates
        'datascience_small': {
            id: 'datascience_small',
            name: 'Small Data Science Team',
            description: 'Interactive analysis and notebooks',
            category: 'data_science',

            characteristics: {
                dataVolume: 100,
                userCount: 5,
                jobComplexity: 'medium',
                latencyRequirement: 'low',
                availabilityTarget: 99.0
            },

            configuration: {
                clusterType: 'highconcurrency',
                nodeCount: 1,
                instanceType: 'i3.xlarge',
                autoScaling: true,
                minNodes: 1,
                maxNodes: 3,
                spotInstancePercent: 0,
                reservedInstancePercent: 100,
                features: {
                    photon: true,
                    unityCatalog: true,
                    deltaLiveTable: false,
                    mlRuntime: true,
                    gpuEnabled: false
                },
                storage: {
                    deltaStorage: 500,
                    checkpointStorage: 50,
                    notebookStorage: 10
                }
            },

            estimatedCost: {
                monthly: {
                    aws: 2800,
                    azure: 2950,
                    gcp: 2850
                },
                dbuHours: 1440
            },

            scaling: {
                volumeMultiplier: 1.2,
                userMultiplier: 1.25
            }
        },

        // Business Intelligence Templates
        'bi_reporting': {
            id: 'bi_reporting',
            name: 'Business Intelligence & Reporting',
            description: 'SQL analytics and dashboards',
            category: 'business_intelligence',

            characteristics: {
                dataVolume: 2000,
                userCount: 100,
                jobComplexity: 'low',
                latencyRequirement: 'low',
                availabilityTarget: 99.9
            },

            configuration: {
                clusterType: 'sql',
                nodeCount: 4,
                instanceType: 'i3.2xlarge',
                autoScaling: true,
                minNodes: 2,
                maxNodes: 8,
                spotInstancePercent: 30,
                reservedInstancePercent: 50,
                features: {
                    photon: true,
                    unityCatalog: true,
                    deltaLiveTable: false,
                    mlRuntime: false,
                    gpuEnabled: false,
                    sqlWarehouse: true
                },
                storage: {
                    deltaStorage: 5000,
                    checkpointStorage: 100
                }
            },

            estimatedCost: {
                monthly: {
                    aws: 15000,
                    azure: 16000,
                    gcp: 15500
                },
                dbuHours: 11520
            },

            scaling: {
                volumeMultiplier: 1.15,
                userMultiplier: 1.3
            }
        }
    },

    // Helper functions
    getTemplateById: function(id) {
        return this.templates[id] || null;
    },

    getTemplatesByCategory: function(category) {
        return Object.values(this.templates).filter(t => t.category === category);
    },

    getAllCategories: function() {
        return [...new Set(Object.values(this.templates).map(t => t.category))];
    },

    findClosestTemplate: function(requirements) {
        let bestMatch = null;
        let bestScore = -1;

        for (const template of Object.values(this.templates)) {
            const score = this.calculateMatchScore(template, requirements);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = template;
            }
        }

        return { template: bestMatch, score: bestScore };
    },

    calculateMatchScore: function(template, requirements) {
        let score = 0;
        const chars = template.characteristics;

        // Volume match (most important)
        const volumeDiff = Math.abs(Math.log10(chars.dataVolume + 1) - Math.log10(requirements.dataVolume + 1));
        score += Math.max(0, 10 - volumeDiff * 3);

        // User count match
        const userDiff = Math.abs(Math.log10(chars.userCount + 1) - Math.log10(requirements.userCount + 1));
        score += Math.max(0, 5 - userDiff * 2);

        // Category match
        if (template.category === requirements.workloadType) {
            score += 8;
        }

        // Latency match
        if (chars.latencyRequirement === requirements.latencyRequirement) {
            score += 3;
        }

        return score;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkloadTemplates;
}
if (typeof window !== 'undefined') {
    window.WorkloadTemplates = WorkloadTemplates;
}