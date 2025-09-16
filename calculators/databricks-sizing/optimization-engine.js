// Optimization Engine for Databricks Recommendations
// Integrates with existing recommendation system

class DatabricksOptimizedCache {
    constructor() {
        this.cache = null;
        this.cachePromise = null;
        this.cacheVersion = null;
        this.fallbackToTemplate = true;
    }

    // Initialize and load cache
    async init() {
        try {
            await this.loadCache();
            console.log('Optimization data loaded successfully');
            return true;
        } catch (error) {
            console.warn('Optimization data not available, using template-based recommendations', error);
            return false;
        }
    }

    // Load cache from CDN/local file
    async loadCache() {
        if (this.cache) return this.cache;
        if (this.cachePromise) return this.cachePromise;

        this.cachePromise = this.fetchCache();
        return this.cachePromise;
    }

    async fetchCache() {
        try {
            // Try multiple paths for local dev and production
            const paths = [
                '/public/data/databricks-optimization-data.json',  // Absolute path
                '../../public/data/databricks-optimization-data.json', // From calculators/databricks-sizing/
                '/data/databricks-optimization-data.json',         // Production CDN
                './data/databricks-optimization-data.json'         // Relative path
            ];

            let response;
            let lastError;

            for (const path of paths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        console.log('Loaded optimization data from:', path);
                        break;
                    }
                } catch (e) {
                    lastError = e;
                }
            }

            if (!response || !response.ok) {
                throw lastError || new Error(`Failed to load cache from any path`);
            }

            const data = await response.json();

            // Validate cache structure
            if (!data.recommendations || !data.version) {
                throw new Error('Invalid cache format');
            }

            this.cache = data.recommendations;
            this.cacheVersion = data.version;

            // Store in localStorage for offline use
            try {
                localStorage.setItem('databricks-optimization-data', JSON.stringify(data));
                localStorage.setItem('databricks-optimization-version', data.version);
            } catch (e) {
                console.warn('Failed to store cache in localStorage:', e);
            }

            return this.cache;

        } catch (fetchError) {
            // Try localStorage fallback
            console.warn('Failed to fetch cache from server, trying localStorage...');

            const stored = localStorage.getItem('databricks-optimization-data');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    this.cache = data.recommendations;
                    this.cacheVersion = data.version;
                    console.log('Using cached data from localStorage (version: ' + this.cacheVersion + ')');
                    return this.cache;
                } catch (e) {
                    console.error('Failed to parse localStorage cache:', e);
                }
            }

            throw fetchError;
        }
    }

    // Get recommendation from cache
    getRecommendation(inputs) {
        if (!this.cache) {
            return null;
        }

        // Build cache key
        const key = this.buildCacheKey(inputs);

        // Try exact match first
        if (this.cache[key]) {
            return this.formatRecommendation(this.cache[key], inputs);
        }

        // Try nearest match
        const nearestKey = this.findNearestMatch(inputs);
        if (nearestKey && this.cache[nearestKey]) {
            const recommendation = this.cache[nearestKey];
            return this.adjustRecommendation(recommendation, inputs);
        }

        return null;
    }

    // Build cache key from inputs
    buildCacheKey(inputs) {
        // Convert data volume to scale category
        const getDataScale = (volume) => {
            if (volume < 1000) return 'small';       // <1TB
            if (volume < 10000) return 'medium';     // 1-10TB
            if (volume < 100000) return 'large';     // 10-100TB
            return 'xlarge';                         // >100TB
        };

        // Convert user count to team size category
        const getTeamSize = (users) => {
            if (users <= 10) return 'small';         // 1-10 users
            if (users <= 50) return 'medium';        // 10-50 users
            if (users <= 200) return 'large';        // 50-200 users
            return 'xlarge';                         // 200+ users
        };

        const normalized = {
            cloud: inputs.cloudProvider,
            workload: this.normalizeWorkload(inputs.workloadType),
            dataScale: getDataScale(inputs.dataVolume),
            teamSize: getTeamSize(inputs.userCount),
            priority: inputs.priority,
            sla: inputs.slaRequirement
        };

        return `${normalized.cloud}_${normalized.workload}_${normalized.dataScale}_${normalized.teamSize}_${normalized.priority}_${normalized.sla}`;
    }

    // Normalize workload types to match cache
    normalizeWorkload(workloadType) {
        const mapping = {
            'streaming': 'streaming',
            'batch_processing': 'batch',
            'batch_etl': 'batch',
            'machine_learning': 'ml',
            'data_science': 'ml',
            'business_intelligence': 'analytics'
        };
        return mapping[workloadType] || 'analytics';
    }

    // Find nearest value in buckets
    getNearestBucket(value, buckets) {
        return buckets.reduce((prev, curr) =>
            Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        );
    }

    // Find nearest match in cache
    findNearestMatch(inputs) {
        const targetKey = this.buildCacheKey(inputs);
        const keys = Object.keys(this.cache);

        // Find keys with same cloud and workload
        const candidates = keys.filter(key => {
            const parts = key.split('_');
            const keyParts = targetKey.split('_');
            return parts[0] === keyParts[0] && parts[1] === keyParts[1]; // Same cloud and workload
        });

        if (candidates.length === 0) {
            return null;
        }

        // Score each candidate by similarity
        let bestMatch = null;
        let bestScore = -1;

        candidates.forEach(key => {
            const parts = key.split('_');
            const targetParts = targetKey.split('_');

            let score = 0;
            if (parts[4] === targetParts[4]) score += 3; // Same priority
            if (parts[5] === targetParts[5]) score += 2; // Same SLA

            // Data volume similarity (inverse of difference)
            const dataDiff = Math.abs(parseInt(parts[2]) - parseInt(targetParts[2]));
            score += Math.max(0, 5 - dataDiff / 10000);

            // User count similarity
            const userDiff = Math.abs(parseInt(parts[3]) - parseInt(targetParts[3]));
            score += Math.max(0, 3 - userDiff / 100);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = key;
            }
        });

        return bestMatch;
    }

    // Format cached recommendation for use
    formatRecommendation(cached, inputs) {
        const rec = cached.recommendation;

        // Ensure features object exists
        const features = rec.features || {
            photon: false,
            autoScaling: true,
            unityCatalog: false,
            deltaLiveTables: false
        };

        return {
            configuration: {
                clusterType: rec.clusterType || 'standard',
                instanceType: rec.instanceType || 'i3.2xlarge',
                nodeCount: rec.nodeCount || 2,
                minNodes: Math.max(2, Math.floor((rec.nodeCount || 2) * 0.5)),
                maxNodes: Math.ceil((rec.nodeCount || 2) * 1.5),
                autoScaling: features.autoScaling !== false,
                spotInstancePercent: rec.spotInstancePercent || 0,
                reservedInstancePercent: rec.reservedInstancePercent || 0,
                features: features,
                storage: {
                    deltaStorage: inputs.dataVolume * 3,
                    checkpointStorage: inputs.dataVolume * 0.2
                }
            },
            estimatedCost: {
                monthly: {
                    [inputs.cloudProvider]: rec.estimatedMonthlyCost || 1000
                },
                hourly: (rec.estimatedMonthlyCost || 1000) / 730,
                daily: (rec.estimatedMonthlyCost || 1000) / 30
            },
            confidence: Math.max(70, rec.confidence || 85),
            explanation: rec.explanation || ['ML-optimized recommendation'],
            pros: rec.pros || ['Cost-optimized configuration'],
            cons: rec.cons || [],
            insights: [],
            source: 'optimized',
            cacheVersion: this.cacheVersion,
            cacheKey: this.buildCacheKey(inputs)
        };
    }

    // Adjust recommendation for different input values
    adjustRecommendation(cached, inputs) {
        const recommendation = this.formatRecommendation(cached, inputs);
        const cachedInput = cached.input;

        // Scale node count based on data volume difference
        if (cachedInput && cachedInput.dataVolume) {
            const dataScale = inputs.dataVolume / cachedInput.dataVolume;
            if (dataScale > 1.5 || dataScale < 0.5) {
                const adjustment = Math.sqrt(dataScale); // Use square root for moderate scaling
                recommendation.configuration.nodeCount = Math.max(
                    2,
                    Math.round(recommendation.configuration.nodeCount * adjustment)
                );
            }
        }

        // Scale node count based on user difference
        if (cachedInput && cachedInput.userCount) {
            const userScale = inputs.userCount / cachedInput.userCount;
            if (userScale > 2) {
                const userNodes = Math.ceil(inputs.userCount / 30);
                recommendation.configuration.nodeCount = Math.max(
                    recommendation.configuration.nodeCount,
                    userNodes
                );
            }
        }

        // Adjust cost estimate
        const nodeScale = recommendation.configuration.nodeCount / (cached.recommendation.nodeCount || 1);
        recommendation.estimatedCost.monthly[inputs.cloudProvider] =
            Math.round(cached.recommendation.estimatedMonthlyCost * nodeScale);

        // Update min/max nodes
        recommendation.configuration.minNodes = Math.max(2, Math.floor(recommendation.configuration.nodeCount * 0.5));
        recommendation.configuration.maxNodes = Math.ceil(recommendation.configuration.nodeCount * 1.5);

        // Mark as adjusted
        recommendation.source = 'adjusted';
        recommendation.confidence = Math.max(70, (recommendation.confidence || 80) - 10); // Slightly lower confidence

        return recommendation;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabricksOptimizedCache;
}
if (typeof window !== 'undefined') {
    window.DatabricksOptimizedCache = DatabricksOptimizedCache;
}