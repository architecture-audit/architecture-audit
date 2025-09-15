// Comprehensive Databricks Sizing Calculator Module
const DatabricksComprehensive = {
    // Regional pricing multipliers (relative to us-east-1/eastus/us-central1)
    regionalPricing: {
        aws: {
            'us-east-1': 1.00,  // Baseline
            'us-east-2': 1.00,
            'us-west-1': 1.05,  // California is more expensive
            'us-west-2': 1.00,
            'eu-west-1': 1.02,
            'eu-west-2': 1.05,  // London
            'eu-west-3': 1.06,  // Paris
            'eu-central-1': 1.06,  // Frankfurt
            'eu-north-1': 1.01,  // Stockholm
            'eu-south-1': 1.08,  // Milan
            'ap-southeast-1': 1.08,  // Singapore
            'ap-southeast-2': 1.10,  // Sydney
            'ap-northeast-1': 1.12,  // Tokyo
            'ap-northeast-2': 1.10,  // Seoul
            'ap-south-1': 0.95,  // Mumbai - cheaper
            'ap-east-1': 1.15,  // Hong Kong
            'ca-central-1': 1.02,
            'sa-east-1': 1.20,  // São Paulo - most expensive
            'me-south-1': 1.10,  // Bahrain
            'af-south-1': 1.15  // Cape Town
        },
        azure: {
            'eastus': 1.00,  // Baseline
            'eastus2': 1.00,
            'centralus': 1.01,
            'westus': 1.02,
            'westus2': 1.00,
            'westus3': 1.00,
            'northeurope': 1.02,
            'westeurope': 1.05,
            'uksouth': 1.05,
            'ukwest': 1.08,
            'francecentral': 1.06,
            'germanywestcentral': 1.07,
            'norwayeast': 1.10,
            'switzerlandnorth': 1.15,
            'swedencentral': 1.04,
            'eastasia': 1.15,  // Hong Kong
            'southeastasia': 1.08,  // Singapore
            'japaneast': 1.12,
            'japanwest': 1.12,
            'koreacentral': 1.10,
            'centralindia': 0.95,  // India regions are cheaper
            'southindia': 0.92,
            'westindia': 0.95,
            'australiaeast': 1.10,
            'australiasoutheast': 1.10,
            'canadacentral': 1.02,
            'canadaeast': 1.02,
            'brazilsouth': 1.20,
            'southafricanorth': 1.15,
            'uaenorth': 1.10
        },
        gcp: {
            'us-central1': 1.00,  // Baseline - Iowa
            'us-east1': 1.00,  // South Carolina
            'us-east4': 1.01,  // Virginia
            'us-west1': 1.00,  // Oregon
            'us-west2': 1.08,  // Los Angeles
            'us-west3': 1.08,  // Salt Lake City
            'us-west4': 1.09,  // Las Vegas
            'europe-west1': 1.02,  // Belgium
            'europe-west2': 1.08,  // London
            'europe-west3': 1.08,  // Frankfurt
            'europe-west4': 1.02,  // Netherlands
            'europe-west6': 1.15,  // Zurich
            'europe-north1': 1.06,  // Finland
            'europe-central2': 1.10,  // Warsaw
            'asia-east1': 1.09,  // Taiwan
            'asia-east2': 1.15,  // Hong Kong
            'asia-northeast1': 1.12,  // Tokyo
            'asia-northeast2': 1.14,  // Osaka
            'asia-northeast3': 1.10,  // Seoul
            'asia-south1': 0.95,  // Mumbai
            'asia-south2': 0.97,  // Delhi
            'asia-southeast1': 1.08,  // Singapore
            'asia-southeast2': 1.10,  // Jakarta
            'australia-southeast1': 1.10,  // Sydney
            'australia-southeast2': 1.12,  // Melbourne
            'northamerica-northeast1': 1.02,  // Montreal
            'northamerica-northeast2': 1.02,  // Toronto
            'southamerica-east1': 1.20,  // São Paulo
            'southamerica-west1': 1.15,  // Santiago
            'me-west1': 1.12  // Tel Aviv
        }
    },

    // Detailed pricing structure for all Databricks features
    pricing: {
        // DBU pricing by workload type and tier
        dbu: {
            aws: {
                // All-Purpose Compute
                allPurpose: {
                    standard: 0.55,
                    premium: 0.65,
                    enterprise: 0.75
                },
                // Jobs Compute
                jobs: {
                    standard: 0.30,
                    premium: 0.35,
                    enterprise: 0.40
                },
                // SQL Compute
                sql: {
                    classic: 0.22,
                    pro: 0.55,
                    serverless: 0.70
                },
                // DLT (Delta Live Tables)
                dlt: {
                    core: 0.36,
                    pro: 0.54,
                    advanced: 0.72
                },
                // Photon acceleration
                photon: {
                    multiplier: 2.0,  // 2x DBU cost
                    performanceGain: 3.0  // 3x performance
                },
                // Model Serving
                modelServing: {
                    cpu: 0.07,  // per DBU hour
                    gpu: 0.35   // per DBU hour
                }
            },
            azure: {
                // Azure Databricks is a native Azure service with different pricing
                // DBU prices are in addition to VM costs (not bundled like AWS)
                // These are the actual Azure Databricks DBU rates
                allPurpose: {
                    standard: 0.40,  // Azure Premium tier (was called Standard)
                    premium: 0.55,   // Azure Premium tier with additional features
                    enterprise: 0.65  // Not available in Azure - using premium + markup
                },
                jobs: {
                    standard: 0.15,  // Azure Jobs Compute (Light)
                    premium: 0.30,   // Azure Jobs Compute (Standard)
                    enterprise: 0.40 // Azure Jobs Compute (Premium)
                },
                sql: {
                    classic: 0.22,   // SQL Compute Classic
                    pro: 0.55,       // SQL Compute Pro
                    serverless: 0.70 // SQL Serverless
                },
                dlt: {
                    core: 0.25,      // DLT Core
                    pro: 0.36,       // DLT Pro
                    advanced: 0.54   // DLT Advanced
                },
                photon: {
                    multiplier: 1.5,  // Lower multiplier in Azure (better integrated)
                    performanceGain: 3.0
                },
                modelServing: {
                    cpu: 0.07,
                    gpu: 0.35
                },
                // Azure-specific commitment discounts
                commitmentTiers: {
                    // Pre-purchase DBU commitments for discounts
                    payAsYouGo: 1.00,        // No discount
                    oneYear: 0.82,           // 18% discount
                    threeYear: 0.63          // 37% discount
                }
            },
            gcp: {
                allPurpose: {
                    standard: 0.52,
                    premium: 0.62,
                    enterprise: 0.72
                },
                jobs: {
                    standard: 0.29,
                    premium: 0.34,
                    enterprise: 0.39
                },
                sql: {
                    classic: 0.21,
                    pro: 0.52,
                    serverless: 0.68
                },
                dlt: {
                    core: 0.35,
                    pro: 0.52,
                    advanced: 0.70
                },
                photon: {
                    multiplier: 2.0,
                    performanceGain: 3.0
                },
                modelServing: {
                    cpu: 0.068,
                    gpu: 0.34
                }
            }
        },

        // Extended instance types with detailed specs
        instances: {
            aws: {
                // General Purpose
                'm5.large': { cpu: 2, memory: 8, hourly: 0.096, dbus: 0.5 },
                'm5.xlarge': { cpu: 4, memory: 16, hourly: 0.192, dbus: 1.0 },
                'm5.2xlarge': { cpu: 8, memory: 32, hourly: 0.384, dbus: 2.0 },
                'm5.4xlarge': { cpu: 16, memory: 64, hourly: 0.768, dbus: 4.0 },
                'm5.8xlarge': { cpu: 32, memory: 128, hourly: 1.536, dbus: 8.0 },
                'm5.12xlarge': { cpu: 48, memory: 192, hourly: 2.304, dbus: 12.0 },
                'm5.16xlarge': { cpu: 64, memory: 256, hourly: 3.072, dbus: 16.0 },
                'm5.24xlarge': { cpu: 96, memory: 384, hourly: 4.608, dbus: 24.0 },
                'm6i.32xlarge': { cpu: 128, memory: 512, hourly: 6.144, dbus: 32.0 },

                // Memory Optimized
                'r5.large': { cpu: 2, memory: 16, hourly: 0.126, dbus: 0.75 },
                'r5.xlarge': { cpu: 4, memory: 32, hourly: 0.252, dbus: 1.5 },
                'r5.2xlarge': { cpu: 8, memory: 64, hourly: 0.504, dbus: 3.0 },
                'r5.4xlarge': { cpu: 16, memory: 128, hourly: 1.008, dbus: 6.0 },
                'r5.8xlarge': { cpu: 32, memory: 256, hourly: 2.016, dbus: 12.0 },
                'r5.12xlarge': { cpu: 48, memory: 384, hourly: 3.024, dbus: 18.0 },
                'r5.16xlarge': { cpu: 64, memory: 512, hourly: 4.032, dbus: 24.0 },
                'r5.24xlarge': { cpu: 96, memory: 768, hourly: 6.048, dbus: 36.0 },
                'x2idn.32xlarge': { cpu: 128, memory: 2048, hourly: 13.338, dbus: 80.0 },

                // Compute Optimized
                'c5.large': { cpu: 2, memory: 4, hourly: 0.085, dbus: 0.375 },
                'c5.xlarge': { cpu: 4, memory: 8, hourly: 0.17, dbus: 0.75 },
                'c5.2xlarge': { cpu: 8, memory: 16, hourly: 0.34, dbus: 1.5 },
                'c5.4xlarge': { cpu: 16, memory: 32, hourly: 0.68, dbus: 3.0 },
                'c5.9xlarge': { cpu: 36, memory: 72, hourly: 1.53, dbus: 6.75 },
                'c5.12xlarge': { cpu: 48, memory: 96, hourly: 2.04, dbus: 9.0 },
                'c5.18xlarge': { cpu: 72, memory: 144, hourly: 3.06, dbus: 13.5 },
                'c5.24xlarge': { cpu: 96, memory: 192, hourly: 4.08, dbus: 18.0 },

                // Storage Optimized
                'i3.large': { cpu: 2, memory: 15.25, hourly: 0.156, dbus: 0.625 },
                'i3.xlarge': { cpu: 4, memory: 30.5, hourly: 0.312, dbus: 1.25 },
                'i3.2xlarge': { cpu: 8, memory: 61, hourly: 0.624, dbus: 2.5 },
                'i3.4xlarge': { cpu: 16, memory: 122, hourly: 1.248, dbus: 5.0 },
                'i3.8xlarge': { cpu: 32, memory: 244, hourly: 2.496, dbus: 10.0 },
                'i3.16xlarge': { cpu: 64, memory: 488, hourly: 4.992, dbus: 20.0 },
                'i3en.24xlarge': { cpu: 96, memory: 768, hourly: 10.848, dbus: 40.0 },

                // GPU Instances
                'p3.2xlarge': { cpu: 8, memory: 61, hourly: 3.06, dbus: 7.0, gpu: 1, gpuType: 'V100' },
                'p3.8xlarge': { cpu: 32, memory: 244, hourly: 12.24, dbus: 28.0, gpu: 4, gpuType: 'V100' },
                'p3.16xlarge': { cpu: 64, memory: 488, hourly: 24.48, dbus: 56.0, gpu: 8, gpuType: 'V100' },
                'p4d.24xlarge': { cpu: 96, memory: 1152, hourly: 32.77, dbus: 96.0, gpu: 8, gpuType: 'A100' },
                'g4dn.xlarge': { cpu: 4, memory: 16, hourly: 0.526, dbus: 2.0, gpu: 1, gpuType: 'T4' },
                'g4dn.2xlarge': { cpu: 8, memory: 32, hourly: 0.752, dbus: 4.0, gpu: 1, gpuType: 'T4' },
                'g4dn.4xlarge': { cpu: 16, memory: 64, hourly: 1.204, dbus: 8.0, gpu: 1, gpuType: 'T4' },
                'g4dn.8xlarge': { cpu: 32, memory: 128, hourly: 2.176, dbus: 16.0, gpu: 1, gpuType: 'T4' },
                'g4dn.12xlarge': { cpu: 48, memory: 192, hourly: 3.912, dbus: 24.0, gpu: 4, gpuType: 'T4' },
                'g4dn.16xlarge': { cpu: 64, memory: 256, hourly: 4.352, dbus: 32.0, gpu: 1, gpuType: 'T4' },
                'g5.xlarge': { cpu: 4, memory: 16, hourly: 1.006, dbus: 3.0, gpu: 1, gpuType: 'A10G' },
                'g5.2xlarge': { cpu: 8, memory: 32, hourly: 1.212, dbus: 6.0, gpu: 1, gpuType: 'A10G' },
                'g5.4xlarge': { cpu: 16, memory: 64, hourly: 1.624, dbus: 12.0, gpu: 1, gpuType: 'A10G' },
                'g5.8xlarge': { cpu: 32, memory: 128, hourly: 2.448, dbus: 24.0, gpu: 1, gpuType: 'A10G' },
                'g5.12xlarge': { cpu: 48, memory: 192, hourly: 5.672, dbus: 36.0, gpu: 4, gpuType: 'A10G' },
                'g5.16xlarge': { cpu: 64, memory: 256, hourly: 4.096, dbus: 48.0, gpu: 1, gpuType: 'A10G' },
                'g5.24xlarge': { cpu: 96, memory: 384, hourly: 8.144, dbus: 72.0, gpu: 4, gpuType: 'A10G' },
                'g5.48xlarge': { cpu: 192, memory: 768, hourly: 16.288, dbus: 144.0, gpu: 8, gpuType: 'A10G' }
            },
            azure: {
                // Similar comprehensive list for Azure
                'Standard_D2s_v3': { cpu: 2, memory: 8, hourly: 0.096, dbus: 0.5 },
                'Standard_D4s_v3': { cpu: 4, memory: 16, hourly: 0.192, dbus: 1.0 },
                'Standard_D8s_v3': { cpu: 8, memory: 32, hourly: 0.384, dbus: 2.0 },
                'Standard_D16s_v3': { cpu: 16, memory: 64, hourly: 0.768, dbus: 4.0 },
                'Standard_D32s_v3': { cpu: 32, memory: 128, hourly: 1.536, dbus: 8.0 },
                'Standard_D48s_v3': { cpu: 48, memory: 192, hourly: 2.304, dbus: 12.0 },
                'Standard_D64s_v3': { cpu: 64, memory: 256, hourly: 3.072, dbus: 16.0 },

                // Memory Optimized
                'Standard_E2s_v3': { cpu: 2, memory: 16, hourly: 0.126, dbus: 0.75 },
                'Standard_E4s_v3': { cpu: 4, memory: 32, hourly: 0.252, dbus: 1.5 },
                'Standard_E8s_v3': { cpu: 8, memory: 64, hourly: 0.504, dbus: 3.0 },
                'Standard_E16s_v3': { cpu: 16, memory: 128, hourly: 1.008, dbus: 6.0 },
                'Standard_E32s_v3': { cpu: 32, memory: 256, hourly: 2.016, dbus: 12.0 },
                'Standard_E48s_v3': { cpu: 48, memory: 384, hourly: 3.024, dbus: 18.0 },
                'Standard_E64s_v3': { cpu: 64, memory: 432, hourly: 4.032, dbus: 24.0 },

                // GPU Instances
                'Standard_NC6s_v3': { cpu: 6, memory: 112, hourly: 3.366, dbus: 7.0, gpu: 1, gpuType: 'V100' },
                'Standard_NC12s_v3': { cpu: 12, memory: 224, hourly: 6.732, dbus: 14.0, gpu: 2, gpuType: 'V100' },
                'Standard_NC24s_v3': { cpu: 24, memory: 448, hourly: 13.464, dbus: 28.0, gpu: 4, gpuType: 'V100' },
                'Standard_NC24rs_v3': { cpu: 24, memory: 448, hourly: 14.810, dbus: 30.0, gpu: 4, gpuType: 'V100' },
                'Standard_ND40rs_v2': { cpu: 40, memory: 672, hourly: 22.032, dbus: 60.0, gpu: 8, gpuType: 'V100' }
            },
            gcp: {
                // Similar comprehensive list for GCP
                'n2-standard-2': { cpu: 2, memory: 8, hourly: 0.097, dbus: 0.5 },
                'n2-standard-4': { cpu: 4, memory: 16, hourly: 0.194, dbus: 1.0 },
                'n2-standard-8': { cpu: 8, memory: 32, hourly: 0.388, dbus: 2.0 },
                'n2-standard-16': { cpu: 16, memory: 64, hourly: 0.777, dbus: 4.0 },
                'n2-standard-32': { cpu: 32, memory: 128, hourly: 1.554, dbus: 8.0 },
                'n2-standard-48': { cpu: 48, memory: 192, hourly: 2.331, dbus: 12.0 },
                'n2-standard-64': { cpu: 64, memory: 256, hourly: 3.108, dbus: 16.0 },
                'n2-standard-80': { cpu: 80, memory: 320, hourly: 3.885, dbus: 20.0 },

                // GPU Instances
                'a2-highgpu-1g': { cpu: 12, memory: 85, hourly: 3.673, dbus: 7.0, gpu: 1, gpuType: 'A100' },
                'a2-highgpu-2g': { cpu: 24, memory: 170, hourly: 7.346, dbus: 14.0, gpu: 2, gpuType: 'A100' },
                'a2-highgpu-4g': { cpu: 48, memory: 340, hourly: 14.692, dbus: 28.0, gpu: 4, gpuType: 'A100' },
                'a2-highgpu-8g': { cpu: 96, memory: 680, hourly: 29.384, dbus: 56.0, gpu: 8, gpuType: 'A100' }
            }
        },

        // Additional Databricks features pricing
        features: {
            // Unity Catalog
            unityCatalog: {
                aws: { perTB: 25, perMillionRequests: 1.0 },
                azure: { perTB: 23, perMillionRequests: 0.9 },
                gcp: { perTB: 24, perMillionRequests: 0.95 }
            },

            // Delta Sharing
            deltaSharing: {
                aws: { perTB: 20, perMillionRequests: 0.5 },
                azure: { perTB: 18, perMillionRequests: 0.45 },
                gcp: { perTB: 19, perMillionRequests: 0.48 }
            },

            // MLflow Model Registry
            mlflow: {
                aws: { perModel: 10, perMillionPredictions: 0.25 },
                azure: { perModel: 9, perMillionPredictions: 0.23 },
                gcp: { perModel: 9.5, perMillionPredictions: 0.24 }
            },

            // Databricks Workflows
            workflows: {
                aws: { perJobRun: 0.01, perOrchestratedHour: 0.05 },
                azure: { perJobRun: 0.009, perOrchestratedHour: 0.045 },
                gcp: { perJobRun: 0.0095, perOrchestratedHour: 0.048 }
            },

            // Vector Search
            vectorSearch: {
                aws: { perMillionVectors: 140, perMillionQueries: 7 },
                azure: { perMillionVectors: 126, perMillionQueries: 6.3 },
                gcp: { perMillionVectors: 133, perMillionQueries: 6.65 }
            },

            // Serverless SQL
            serverlessSQL: {
                aws: { perTBProcessed: 7, idlePerHour: 0.03 },
                azure: { perTBProcessed: 6.3, idlePerHour: 0.027 },
                gcp: { perTBProcessed: 6.65, idlePerHour: 0.029 }
            },

            // Databricks Assistant (AI)
            assistant: {
                aws: { perUser: 20, perMillionTokens: 2 },
                azure: { perUser: 18, perMillionTokens: 1.8 },
                gcp: { perUser: 19, perMillionTokens: 1.9 }
            }
        },

        // Networking costs
        networking: {
            aws: {
                dataTransferOut: 0.09,      // per GB
                dataTransferBetweenAZ: 0.01, // per GB
                vpcEndpoint: 0.01,           // per hour
                natGateway: 0.045,           // per hour
                natGatewayProcessing: 0.045, // per GB
                privateLink: 0.01,           // per hour
                transitGateway: 0.05,        // per hour
                transitGatewayData: 0.02    // per GB
            },
            azure: {
                dataTransferOut: 0.087,
                dataTransferBetweenAZ: 0.01,
                vnetPeering: 0.01,
                natGateway: 0.045,
                natGatewayProcessing: 0.045,
                privateEndpoint: 0.01,
                expressRouteGateway: 0.28,
                expressRouteData: 0.025
            },
            gcp: {
                dataTransferOut: 0.12,
                dataTransferBetweenZone: 0.01,
                cloudNat: 0.045,
                cloudNatProcessing: 0.045,
                privateServiceConnect: 0.01,
                cloudInterconnect: 0.02,
                cloudVPN: 0.05,
                cloudVPNData: 0.03
            }
        },

        // Storage pricing (detailed)
        storage: {
            aws: {
                s3: {
                    standard: 0.023,
                    standardIA: 0.0125,
                    intelligentTiering: 0.023,
                    glacierInstant: 0.004,
                    glacierFlexible: 0.0036,
                    glacierDeep: 0.00099
                },
                ebs: {
                    gp3: 0.08,
                    gp2: 0.10,
                    io2: 0.125,
                    st1: 0.045,
                    sc1: 0.025
                },
                deltaLake: {
                    managed: 0.023,
                    versioning: 0.005,
                    timeTravel: 0.003
                }
            },
            azure: {
                blob: {
                    hot: 0.0184,
                    cool: 0.01,
                    archive: 0.00099
                },
                disk: {
                    premiumSSD: 0.12,
                    standardSSD: 0.075,
                    standardHDD: 0.04
                },
                deltaLake: {
                    managed: 0.0184,
                    versioning: 0.004,
                    timeTravel: 0.0025
                }
            },
            gcp: {
                gcs: {
                    standard: 0.020,
                    nearline: 0.010,
                    coldline: 0.004,
                    archive: 0.0012
                },
                disk: {
                    pdSSD: 0.17,
                    pdBalanced: 0.10,
                    pdStandard: 0.04
                },
                deltaLake: {
                    managed: 0.020,
                    versioning: 0.0045,
                    timeTravel: 0.0028
                }
            }
        }
    },

    // Workload patterns and recommendations
    workloadPatterns: {
        batch: {
            name: 'Batch Processing',
            characteristics: {
                clusterUptime: 0.3,  // 30% of the time
                spotInstancesSuitable: true,
                recommendedSpotPercent: 80,
                photonBenefit: 'high',
                autoScalingRecommended: true,
                minNodes: 2,
                maxNodesRatio: 10  // max = min * 10
            },
            instanceRecommendations: {
                small: ['m5.xlarge', 'Standard_D4s_v3', 'n2-standard-4'],
                medium: ['m5.4xlarge', 'Standard_D16s_v3', 'n2-standard-16'],
                large: ['m5.12xlarge', 'Standard_D48s_v3', 'n2-standard-48']
            }
        },
        streaming: {
            name: 'Real-time Streaming',
            characteristics: {
                clusterUptime: 1.0,  // 100% of the time
                spotInstancesSuitable: false,
                recommendedSpotPercent: 0,
                photonBenefit: 'medium',
                autoScalingRecommended: true,
                minNodes: 4,
                maxNodesRatio: 4
            },
            instanceRecommendations: {
                small: ['m5.2xlarge', 'Standard_D8s_v3', 'n2-standard-8'],
                medium: ['m5.8xlarge', 'Standard_D32s_v3', 'n2-standard-32'],
                large: ['m5.16xlarge', 'Standard_D64s_v3', 'n2-standard-64']
            }
        },
        ml: {
            name: 'Machine Learning',
            characteristics: {
                clusterUptime: 0.5,
                spotInstancesSuitable: true,
                recommendedSpotPercent: 60,
                photonBenefit: 'low',
                autoScalingRecommended: false,
                minNodes: 1,
                maxNodesRatio: 1,
                gpuRecommended: true
            },
            instanceRecommendations: {
                small: ['g4dn.xlarge', 'Standard_NC6s_v3', 'a2-highgpu-1g'],
                medium: ['p3.2xlarge', 'Standard_NC12s_v3', 'a2-highgpu-2g'],
                large: ['p3.8xlarge', 'Standard_NC24s_v3', 'a2-highgpu-4g']
            }
        },
        sql: {
            name: 'SQL Analytics',
            characteristics: {
                clusterUptime: 0.7,
                spotInstancesSuitable: false,
                recommendedSpotPercent: 20,
                photonBenefit: 'very-high',
                autoScalingRecommended: true,
                minNodes: 2,
                maxNodesRatio: 8,
                sqlWarehouseRecommended: true
            },
            instanceRecommendations: {
                small: ['r5.2xlarge', 'Standard_E8s_v3', 'n2-highmem-8'],
                medium: ['r5.8xlarge', 'Standard_E32s_v3', 'n2-highmem-32'],
                large: ['r5.16xlarge', 'Standard_E64s_v3', 'n2-highmem-64']
            }
        },
        etl: {
            name: 'ETL/Data Engineering',
            characteristics: {
                clusterUptime: 0.4,
                spotInstancesSuitable: true,
                recommendedSpotPercent: 70,
                photonBenefit: 'high',
                autoScalingRecommended: true,
                minNodes: 2,
                maxNodesRatio: 6
            },
            instanceRecommendations: {
                small: ['m5.2xlarge', 'Standard_D8s_v3', 'n2-standard-8'],
                medium: ['m5.8xlarge', 'Standard_D32s_v3', 'n2-standard-32'],
                large: ['r5.12xlarge', 'Standard_E48s_v3', 'n2-highmem-48']
            }
        },
        interactive: {
            name: 'Interactive/Ad-hoc',
            characteristics: {
                clusterUptime: 0.3,
                spotInstancesSuitable: false,
                recommendedSpotPercent: 0,
                photonBenefit: 'medium',
                autoScalingRecommended: true,
                minNodes: 1,
                maxNodesRatio: 4
            },
            instanceRecommendations: {
                small: ['m5.xlarge', 'Standard_D4s_v3', 'n2-standard-4'],
                medium: ['m5.4xlarge', 'Standard_D16s_v3', 'n2-standard-16'],
                large: ['m5.8xlarge', 'Standard_D32s_v3', 'n2-standard-32']
            }
        }
    },

    // Optimization recommendations
    optimizations: {
        costOptimizations: [
            {
                name: 'Use Spot Instances',
                impact: 'high',
                savings: '60-80%',
                applicable: ['batch', 'etl', 'ml'],
                description: 'Use spot instances for fault-tolerant workloads'
            },
            {
                name: 'Enable Photon',
                impact: 'high',
                savings: '20-40%',
                applicable: ['sql', 'etl', 'batch'],
                description: 'Photon provides 3x performance at 2x DBU cost'
            },
            {
                name: 'Implement Auto-scaling',
                impact: 'medium',
                savings: '20-30%',
                applicable: ['all'],
                description: 'Scale clusters based on workload demand'
            },
            {
                name: 'Use Job Clusters',
                impact: 'high',
                savings: '40-50%',
                applicable: ['batch', 'etl'],
                description: 'Job clusters cost 45% less than all-purpose clusters'
            },
            {
                name: 'Enable Cluster Pools',
                impact: 'medium',
                savings: '10-15%',
                applicable: ['interactive', 'ml'],
                description: 'Reduce cluster startup time and idle costs'
            },
            {
                name: 'Optimize Storage Tiers',
                impact: 'medium',
                savings: '30-50%',
                applicable: ['all'],
                description: 'Use appropriate storage tiers for data lifecycle'
            },
            {
                name: 'Schedule Cluster Shutdown',
                impact: 'high',
                savings: '40-60%',
                applicable: ['interactive', 'ml'],
                description: 'Automatically terminate idle clusters'
            },
            {
                name: 'Use Delta Cache',
                impact: 'medium',
                savings: '15-25%',
                applicable: ['sql', 'interactive'],
                description: 'Cache frequently accessed data on local SSDs'
            },
            {
                name: 'Optimize File Sizes',
                impact: 'low',
                savings: '5-10%',
                applicable: ['all'],
                description: 'Use optimal file sizes (128MB-1GB) for better performance'
            },
            {
                name: 'Enable Z-Ordering',
                impact: 'medium',
                savings: '20-30%',
                applicable: ['sql', 'interactive'],
                description: 'Optimize data layout for query patterns'
            }
        ],

        performanceOptimizations: [
            {
                name: 'Enable Adaptive Query Execution',
                impact: 'high',
                improvement: '2-3x',
                description: 'Dynamically optimize query plans during execution'
            },
            {
                name: 'Use Broadcast Joins',
                impact: 'medium',
                improvement: '10-50x',
                description: 'Broadcast small tables for faster joins'
            },
            {
                name: 'Implement Partition Pruning',
                impact: 'high',
                improvement: '10-100x',
                description: 'Read only relevant partitions'
            },
            {
                name: 'Enable Dynamic Partition Overwrite',
                impact: 'medium',
                improvement: '2-5x',
                description: 'Overwrite only changed partitions'
            },
            {
                name: 'Use Column Pruning',
                impact: 'medium',
                improvement: '2-10x',
                description: 'Read only required columns'
            }
        ]
    }
};

// Export for browser use
if (typeof window !== 'undefined') {
    window.DatabricksComprehensive = DatabricksComprehensive;
}