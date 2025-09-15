// Databricks Multi-Cloud Support Module
const DatabricksMultiCloud = {
    // Cloud-specific pricing with equivalent instance mappings
    pricing: {
        dbu: {
            aws: { standard: 0.55, premium: 0.65, jobs: 0.30, sql: 0.22 },
            azure: { standard: 0.50, premium: 0.60, jobs: 0.28, sql: 0.20 },
            gcp: { standard: 0.52, premium: 0.62, jobs: 0.29, sql: 0.21 }
        },

        // Instance type mappings across clouds
        instances: {
            aws: {
                'general-small': { name: 'm5.xlarge', cpu: 4, memory: 16, hourly: 0.192, dbus: 1.0 },
                'general-medium': { name: 'm5.2xlarge', cpu: 8, memory: 32, hourly: 0.384, dbus: 2.0 },
                'general-large': { name: 'm5.4xlarge', cpu: 16, memory: 64, hourly: 0.768, dbus: 4.0 },
                'general-xlarge': { name: 'm5.8xlarge', cpu: 32, memory: 128, hourly: 1.536, dbus: 8.0 },
                'memory-small': { name: 'r5.xlarge', cpu: 4, memory: 32, hourly: 0.252, dbus: 1.5 },
                'memory-medium': { name: 'r5.2xlarge', cpu: 8, memory: 64, hourly: 0.504, dbus: 3.0 },
                'memory-large': { name: 'r5.4xlarge', cpu: 16, memory: 128, hourly: 1.008, dbus: 6.0 },
                'memory-xlarge': { name: 'r5.8xlarge', cpu: 32, memory: 256, hourly: 2.016, dbus: 12.0 },
                'compute-small': { name: 'c5.xlarge', cpu: 4, memory: 8, hourly: 0.17, dbus: 0.75 },
                'compute-medium': { name: 'c5.2xlarge', cpu: 8, memory: 16, hourly: 0.34, dbus: 1.5 },
                'compute-large': { name: 'c5.4xlarge', cpu: 16, memory: 32, hourly: 0.68, dbus: 3.0 },
                'compute-xlarge': { name: 'c5.9xlarge', cpu: 36, memory: 72, hourly: 1.53, dbus: 6.75 },
                'storage-small': { name: 'i3.xlarge', cpu: 4, memory: 30.5, hourly: 0.624, dbus: 1.25 },
                'storage-medium': { name: 'i3.2xlarge', cpu: 8, memory: 61, hourly: 1.248, dbus: 2.5 },
                'storage-large': { name: 'i3.4xlarge', cpu: 16, memory: 122, hourly: 2.496, dbus: 5.0 },
                'storage-xlarge': { name: 'i3.8xlarge', cpu: 32, memory: 244, hourly: 4.992, dbus: 10.0 },
                'gpu-small': { name: 'p3.2xlarge', cpu: 8, memory: 61, hourly: 3.06, dbus: 7.0 },
                'gpu-medium': { name: 'p3.8xlarge', cpu: 32, memory: 244, hourly: 12.24, dbus: 28.0 },
                'gpu-large': { name: 'p3.16xlarge', cpu: 64, memory: 488, hourly: 24.48, dbus: 56.0 }
            },
            azure: {
                'general-small': { name: 'Standard_D4s_v3', cpu: 4, memory: 16, hourly: 0.192, dbus: 1.0 },
                'general-medium': { name: 'Standard_D8s_v3', cpu: 8, memory: 32, hourly: 0.384, dbus: 2.0 },
                'general-large': { name: 'Standard_D16s_v3', cpu: 16, memory: 64, hourly: 0.768, dbus: 4.0 },
                'general-xlarge': { name: 'Standard_D32s_v3', cpu: 32, memory: 128, hourly: 1.536, dbus: 8.0 },
                'memory-small': { name: 'Standard_E4s_v3', cpu: 4, memory: 32, hourly: 0.252, dbus: 1.5 },
                'memory-medium': { name: 'Standard_E8s_v3', cpu: 8, memory: 64, hourly: 0.504, dbus: 3.0 },
                'memory-large': { name: 'Standard_E16s_v3', cpu: 16, memory: 128, hourly: 1.008, dbus: 6.0 },
                'memory-xlarge': { name: 'Standard_E32s_v3', cpu: 32, memory: 256, hourly: 2.016, dbus: 12.0 },
                'compute-small': { name: 'Standard_F4s_v2', cpu: 4, memory: 8, hourly: 0.169, dbus: 0.75 },
                'compute-medium': { name: 'Standard_F8s_v2', cpu: 8, memory: 16, hourly: 0.338, dbus: 1.5 },
                'compute-large': { name: 'Standard_F16s_v2', cpu: 16, memory: 32, hourly: 0.677, dbus: 3.0 },
                'compute-xlarge': { name: 'Standard_F32s_v2', cpu: 32, memory: 64, hourly: 1.354, dbus: 6.0 },
                'storage-small': { name: 'Standard_L4s_v2', cpu: 4, memory: 32, hourly: 0.346, dbus: 1.25 },
                'storage-medium': { name: 'Standard_L8s_v2', cpu: 8, memory: 64, hourly: 0.692, dbus: 2.5 },
                'storage-large': { name: 'Standard_L16s_v2', cpu: 16, memory: 128, hourly: 1.383, dbus: 5.0 },
                'storage-xlarge': { name: 'Standard_L32s_v2', cpu: 32, memory: 256, hourly: 2.766, dbus: 10.0 },
                'gpu-small': { name: 'Standard_NC6s_v3', cpu: 6, memory: 112, hourly: 3.366, dbus: 7.0 },
                'gpu-medium': { name: 'Standard_NC12s_v3', cpu: 12, memory: 224, hourly: 6.732, dbus: 14.0 },
                'gpu-large': { name: 'Standard_NC24s_v3', cpu: 24, memory: 448, hourly: 13.464, dbus: 28.0 }
            },
            gcp: {
                'general-small': { name: 'n2-standard-4', cpu: 4, memory: 16, hourly: 0.194, dbus: 1.0 },
                'general-medium': { name: 'n2-standard-8', cpu: 8, memory: 32, hourly: 0.388, dbus: 2.0 },
                'general-large': { name: 'n2-standard-16', cpu: 16, memory: 64, hourly: 0.777, dbus: 4.0 },
                'general-xlarge': { name: 'n2-standard-32', cpu: 32, memory: 128, hourly: 1.554, dbus: 8.0 },
                'memory-small': { name: 'n2-highmem-4', cpu: 4, memory: 32, hourly: 0.262, dbus: 1.5 },
                'memory-medium': { name: 'n2-highmem-8', cpu: 8, memory: 64, hourly: 0.523, dbus: 3.0 },
                'memory-large': { name: 'n2-highmem-16', cpu: 16, memory: 128, hourly: 1.047, dbus: 6.0 },
                'memory-xlarge': { name: 'n2-highmem-32', cpu: 32, memory: 256, hourly: 2.094, dbus: 12.0 },
                'compute-small': { name: 'n2-highcpu-4', cpu: 4, memory: 4, hourly: 0.145, dbus: 0.75 },
                'compute-medium': { name: 'n2-highcpu-8', cpu: 8, memory: 8, hourly: 0.291, dbus: 1.5 },
                'compute-large': { name: 'n2-highcpu-16', cpu: 16, memory: 16, hourly: 0.582, dbus: 3.0 },
                'compute-xlarge': { name: 'n2-highcpu-32', cpu: 32, memory: 32, hourly: 1.164, dbus: 6.0 },
                'storage-small': { name: 'n1-standard-4', cpu: 4, memory: 15, hourly: 0.19, dbus: 1.25 },
                'storage-medium': { name: 'n1-standard-8', cpu: 8, memory: 30, hourly: 0.38, dbus: 2.5 },
                'storage-large': { name: 'n1-standard-16', cpu: 16, memory: 60, hourly: 0.76, dbus: 5.0 },
                'storage-xlarge': { name: 'n1-standard-32', cpu: 32, memory: 120, hourly: 1.52, dbus: 10.0 },
                'gpu-small': { name: 'a2-highgpu-1g', cpu: 12, memory: 85, hourly: 3.673, dbus: 7.0 },
                'gpu-medium': { name: 'a2-highgpu-2g', cpu: 24, memory: 170, hourly: 7.346, dbus: 14.0 },
                'gpu-large': { name: 'a2-highgpu-4g', cpu: 48, memory: 340, hourly: 14.692, dbus: 28.0 }
            }
        },

        storage: {
            aws: {
                s3_standard: 0.023,
                s3_infrequent: 0.0125,
                s3_glacier: 0.004,
                ebs_gp3: 0.08,
                ebs_io2: 0.125
            },
            azure: {
                blob_hot: 0.0184,
                blob_cool: 0.01,
                blob_archive: 0.00099,
                premium_ssd: 0.12,
                standard_ssd: 0.075
            },
            gcp: {
                standard: 0.020,
                nearline: 0.010,
                coldline: 0.004,
                archive: 0.0012,
                pd_ssd: 0.17,
                pd_standard: 0.04
            }
        },

        networking: {
            aws: {
                data_transfer_out: 0.09,
                vpc_endpoint: 0.01,
                nat_gateway: 0.045
            },
            azure: {
                data_transfer_out: 0.087,
                vnet_peering: 0.01,
                nat_gateway: 0.045
            },
            gcp: {
                data_transfer_out: 0.12,
                cloud_nat: 0.045,
                interconnect: 0.02
            }
        }
    },

    // Update instance types based on cloud provider selection
    updateInstanceTypes(clusterId, provider) {
        const select = document.getElementById(`instance-type-${clusterId}`);
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '';

        // Instance categories with descriptions
        const categories = [
            { group: 'General Purpose', types: ['general-small', 'general-medium', 'general-large', 'general-xlarge'] },
            { group: 'Memory Optimized', types: ['memory-small', 'memory-medium', 'memory-large', 'memory-xlarge'] },
            { group: 'Compute Optimized', types: ['compute-small', 'compute-medium', 'compute-large', 'compute-xlarge'] },
            { group: 'Storage Optimized', types: ['storage-small', 'storage-medium', 'storage-large', 'storage-xlarge'] },
            { group: 'GPU Accelerated', types: ['gpu-small', 'gpu-medium', 'gpu-large'] }
        ];

        categories.forEach(category => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category.group;

            category.types.forEach(type => {
                const instance = this.pricing.instances[provider][type];
                if (instance) {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = `${instance.name} (${instance.cpu} vCPU, ${instance.memory} GB, ${instance.dbus} DBU/hr)`;
                    if (type === currentValue) option.selected = true;
                    optgroup.appendChild(option);
                }
            });

            select.appendChild(optgroup);
        });

        // Set default if no selection
        if (!select.value && select.options.length > 0) {
            select.value = 'general-medium';
        }
    },

    // Calculate comprehensive pricing across all clouds
    calculateMultiCloudPricing(config) {
        const results = {
            aws: this.calculateCloudCost('aws', config),
            azure: this.calculateCloudCost('azure', config),
            gcp: this.calculateCloudCost('gcp', config)
        };

        // Add comparison metrics
        const minCost = Math.min(results.aws.total, results.azure.total, results.gcp.total);
        const cheapestCloud = Object.keys(results).find(cloud => results[cloud].total === minCost);

        Object.keys(results).forEach(cloud => {
            results[cloud].savings = results[cloud].total - minCost;
            results[cloud].percentDiff = ((results[cloud].total - minCost) / minCost * 100).toFixed(1);
            results[cloud].isCheapest = cloud === cheapestCloud;
        });

        return results;
    },

    // Calculate cost for a specific cloud
    calculateCloudCost(cloud, config) {
        const pricing = this.pricing;
        let cost = {
            compute: 0,
            dbu: 0,
            storage: 0,
            networking: 0,
            total: 0
        };

        // Calculate compute costs
        config.clusters.forEach(cluster => {
            const instance = pricing.instances[cloud][cluster.instanceType];
            if (instance) {
                const hoursPerMonth = cluster.hoursPerDay * 30;
                const avgWorkers = (cluster.minWorkers + cluster.maxWorkers) / 2;

                // Apply spot discount if applicable
                const spotDiscount = cluster.useSpot ? (cluster.spotPercent / 100) * 0.7 : 0;
                const hourlyRate = instance.hourly * (1 - spotDiscount);

                cost.compute += hourlyRate * avgWorkers * hoursPerMonth;

                // Calculate DBU cost
                const dbuRate = cluster.clusterType === 'job' ?
                    pricing.dbu[cloud].jobs :
                    pricing.dbu[cloud].standard;

                cost.dbu += instance.dbus * avgWorkers * hoursPerMonth * dbuRate;
            }
        });

        // Calculate storage costs
        const storageType = config.storageType || 'standard';
        const storageRate = cloud === 'aws' ? pricing.storage.aws.s3_standard :
                          cloud === 'azure' ? pricing.storage.azure.blob_hot :
                          pricing.storage.gcp.standard;

        cost.storage = config.totalStorageGB * storageRate;

        // Calculate networking costs (simplified)
        const dataTransferGB = config.dataTransferGB || 0;
        cost.networking = dataTransferGB * pricing.networking[cloud].data_transfer_out;

        // Total cost
        cost.total = cost.compute + cost.dbu + cost.storage + cost.networking;

        return cost;
    },

    // Generate cloud comparison report
    generateComparisonReport(results) {
        const report = {
            summary: [],
            recommendations: [],
            breakdowns: {}
        };

        // Find best options
        const clouds = ['aws', 'azure', 'gcp'];
        const cheapest = clouds.reduce((a, b) => results[a].total < results[b].total ? a : b);
        const mostExpensive = clouds.reduce((a, b) => results[a].total > results[b].total ? a : b);

        report.summary.push(`💰 ${cheapest.toUpperCase()} is the most cost-effective option at $${results[cheapest].total.toFixed(2)}/month`);
        report.summary.push(`📊 Potential savings of $${results[mostExpensive].savings.toFixed(2)}/month vs ${mostExpensive.toUpperCase()}`);

        // Add specific recommendations
        if (results.aws.isCheapest) {
            report.recommendations.push('Consider AWS Reserved Instances for additional 40-60% savings');
            report.recommendations.push('Use AWS Savings Plans for flexible compute discounts');
        } else if (results.azure.isCheapest) {
            report.recommendations.push('Leverage Azure Hybrid Benefit if you have existing licenses');
            report.recommendations.push('Consider Azure Reserved VM Instances for up to 72% savings');
        } else if (results.gcp.isCheapest) {
            report.recommendations.push('Use GCP Committed Use Discounts for up to 57% savings');
            report.recommendations.push('Consider Preemptible VMs for batch workloads');
        }

        // Cost breakdown by component
        clouds.forEach(cloud => {
            report.breakdowns[cloud] = {
                compute: `$${results[cloud].compute.toFixed(2)}`,
                dbu: `$${results[cloud].dbu.toFixed(2)}`,
                storage: `$${results[cloud].storage.toFixed(2)}`,
                networking: `$${results[cloud].networking.toFixed(2)}`,
                total: `$${results[cloud].total.toFixed(2)}`
            };
        });

        return report;
    },

    // Instance recommendation engine
    recommendInstances(workloadProfile) {
        const recommendations = [];

        if (workloadProfile.type === 'ml') {
            recommendations.push({
                type: 'gpu-medium',
                reason: 'GPU acceleration for ML training workloads',
                clouds: {
                    aws: 'p3.8xlarge',
                    azure: 'Standard_NC12s_v3',
                    gcp: 'a2-highgpu-2g'
                }
            });
        } else if (workloadProfile.type === 'streaming') {
            recommendations.push({
                type: 'memory-medium',
                reason: 'High memory for streaming data processing',
                clouds: {
                    aws: 'r5.2xlarge',
                    azure: 'Standard_E8s_v3',
                    gcp: 'n2-highmem-8'
                }
            });
        } else if (workloadProfile.type === 'batch') {
            recommendations.push({
                type: 'compute-large',
                reason: 'Compute-optimized for batch processing',
                clouds: {
                    aws: 'c5.4xlarge',
                    azure: 'Standard_F16s_v2',
                    gcp: 'n2-highcpu-16'
                }
            });
        } else {
            recommendations.push({
                type: 'general-medium',
                reason: 'Balanced compute and memory for general workloads',
                clouds: {
                    aws: 'm5.2xlarge',
                    azure: 'Standard_D8s_v3',
                    gcp: 'n2-standard-8'
                }
            });
        }

        return recommendations;
    }
};

// Export for use in main calculator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabricksMultiCloud;
}