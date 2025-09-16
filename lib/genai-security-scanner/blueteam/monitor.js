/**
 * Blue Team Monitor
 * Real-time monitoring and threat detection for GenAI systems
 */

const EventEmitter = require('events');

class BlueTeamMonitor extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.isMonitoring = false;

        // Threat detection patterns
        this.threatPatterns = {
            promptInjection: {
                patterns: [
                    /ignore.*previous.*instructions/i,
                    /system.*prompt/i,
                    /reveal.*configuration/i,
                    /admin.*override/i,
                    /debug.*mode/i,
                    /\]\]>.*<\[/,
                    /base64:[A-Za-z0-9+/]+=*/
                ],
                severity: 'HIGH',
                category: 'INJECTION'
            },
            dataExfiltration: {
                patterns: [
                    /show.*training.*data/i,
                    /reveal.*personal.*information/i,
                    /list.*all.*users/i,
                    /dump.*database/i,
                    /export.*sensitive/i
                ],
                severity: 'CRITICAL',
                category: 'DATA_LEAK'
            },
            jailbreak: {
                patterns: [
                    /pretend.*no.*rules/i,
                    /roleplay.*as/i,
                    /act.*as.*if/i,
                    /new.*personality/i,
                    /different.*assistant/i
                ],
                severity: 'HIGH',
                category: 'JAILBREAK'
            },
            modelExtraction: {
                patterns: [
                    /complete.*this.*pattern/i,
                    /continue.*sequence/i,
                    /repeat.*exactly/i,
                    /verbatim/i,
                    /word.*for.*word/i
                ],
                severity: 'MEDIUM',
                category: 'EXTRACTION'
            },
            dos: {
                patterns: [
                    /repeat.*(\d{4,}|million|billion).*times/i,
                    /generate.*infinite/i,
                    /maximum.*tokens/i,
                    /largest.*possible/i
                ],
                severity: 'MEDIUM',
                category: 'DOS'
            }
        };

        // Behavioral baselines
        this.baseline = {
            avgQueryLength: 50,
            avgResponseTime: 1000,
            normalQueryRate: 10, // queries per minute
            userProfiles: new Map()
        };

        // Detection thresholds
        this.thresholds = {
            queryRateMultiplier: 5, // 5x normal rate triggers alert
            responseSizeMultiplier: 10, // 10x normal size
            suspiciousPatternCount: 3, // Number of patterns to trigger
            anomalyScore: 0.7 // Anomaly score threshold
        };

        // Monitoring state
        this.state = {
            totalQueries: 0,
            threats: [],
            activeAlerts: [],
            metrics: {
                detectionRate: 0,
                falsePositives: 0,
                avgResponseTime: 0,
                threatsByCategory: {}
            }
        };

        // Real-time analysis queue
        this.analysisQueue = [];
        this.processingInterval = null;
    }

    /**
     * Start monitoring
     */
    start() {
        if (this.isMonitoring) {
            console.log('Monitor already running');
            return;
        }

        this.isMonitoring = true;
        console.log('🔵 Blue Team Monitor activated');

        // Start processing queue
        this.processingInterval = setInterval(() => {
            this.processQueue();
        }, 100);

        // Initialize threat hunting
        this.startThreatHunting();

        this.emit('started');
    }

    /**
     * Stop monitoring
     */
    stop() {
        this.isMonitoring = false;
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        console.log('🔴 Blue Team Monitor deactivated');
        this.emit('stopped');
    }

    /**
     * Intercept and analyze a request/response pair
     */
    async analyze(request, response) {
        if (!this.isMonitoring) return;

        const analysis = {
            timestamp: new Date().toISOString(),
            request,
            response,
            threats: [],
            anomalies: [],
            riskScore: 0
        };

        // Add to processing queue
        this.analysisQueue.push(analysis);
        this.state.totalQueries++;

        // Immediate threat detection for critical patterns
        const immediateThreats = this.detectImmediateThreats(request);
        if (immediateThreats.length > 0) {
            this.handleThreats(immediateThreats);
        }

        return analysis;
    }

    /**
     * Process analysis queue
     */
    async processQueue() {
        while (this.analysisQueue.length > 0) {
            const analysis = this.analysisQueue.shift();
            await this.performDeepAnalysis(analysis);
        }
    }

    /**
     * Perform deep analysis on request/response
     */
    async performDeepAnalysis(analysis) {
        // Pattern matching
        analysis.threats.push(...this.detectPatternThreats(analysis.request));

        // Behavioral analysis
        analysis.anomalies.push(...this.detectBehavioralAnomalies(analysis));

        // Context analysis
        analysis.anomalies.push(...this.analyzeContext(analysis));

        // Calculate risk score
        analysis.riskScore = this.calculateRiskScore(analysis);

        // Update user profile
        this.updateUserProfile(analysis);

        // Emit threats if found
        if (analysis.threats.length > 0 || analysis.riskScore > this.thresholds.anomalyScore) {
            this.emit('threat', {
                type: analysis.threats[0]?.category || 'ANOMALY',
                severity: this.getRiskSeverity(analysis.riskScore),
                details: analysis,
                timestamp: analysis.timestamp
            });

            // Store threat for analysis
            this.state.threats.push(analysis);

            // Trigger response if needed
            if (analysis.riskScore > 0.9) {
                this.triggerIncidentResponse(analysis);
            }
        }

        // Update metrics
        this.updateMetrics(analysis);
    }

    /**
     * Detect immediate threats that need instant response
     */
    detectImmediateThreats(request) {
        const threats = [];

        // Check for critical patterns
        for (const [threatType, config] of Object.entries(this.threatPatterns)) {
            if (config.severity === 'CRITICAL') {
                for (const pattern of config.patterns) {
                    if (pattern.test(request)) {
                        threats.push({
                            type: threatType,
                            pattern: pattern.toString(),
                            severity: config.severity,
                            category: config.category,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
        }

        return threats;
    }

    /**
     * Detect pattern-based threats
     */
    detectPatternThreats(request) {
        const threats = [];

        for (const [threatType, config] of Object.entries(this.threatPatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(request)) {
                    threats.push({
                        type: threatType,
                        pattern: pattern.toString(),
                        severity: config.severity,
                        category: config.category,
                        confidence: this.calculatePatternConfidence(request, pattern)
                    });
                }
            }
        }

        return threats;
    }

    /**
     * Detect behavioral anomalies
     */
    detectBehavioralAnomalies(analysis) {
        const anomalies = [];

        // Query length anomaly
        if (analysis.request.length > this.baseline.avgQueryLength * this.thresholds.responseSizeMultiplier) {
            anomalies.push({
                type: 'QUERY_SIZE_ANOMALY',
                severity: 'MEDIUM',
                value: analysis.request.length,
                baseline: this.baseline.avgQueryLength
            });
        }

        // Response time anomaly (if available)
        if (analysis.responseTime && analysis.responseTime > this.baseline.avgResponseTime * 3) {
            anomalies.push({
                type: 'RESPONSE_TIME_ANOMALY',
                severity: 'LOW',
                value: analysis.responseTime,
                baseline: this.baseline.avgResponseTime
            });
        }

        // Encoding detection
        if (this.detectEncodedContent(analysis.request)) {
            anomalies.push({
                type: 'ENCODED_CONTENT',
                severity: 'HIGH',
                encoding: this.identifyEncoding(analysis.request)
            });
        }

        return anomalies;
    }

    /**
     * Analyze context for suspicious patterns
     */
    analyzeContext(analysis) {
        const anomalies = [];

        // Check for context switching attempts
        if (this.detectContextSwitch(analysis.request)) {
            anomalies.push({
                type: 'CONTEXT_MANIPULATION',
                severity: 'HIGH',
                technique: 'context_switch'
            });
        }

        // Check for role confusion
        if (this.detectRoleConfusion(analysis.request)) {
            anomalies.push({
                type: 'ROLE_CONFUSION',
                severity: 'MEDIUM',
                technique: 'role_play'
            });
        }

        // Check for instruction override
        if (this.detectInstructionOverride(analysis.request)) {
            anomalies.push({
                type: 'INSTRUCTION_OVERRIDE',
                severity: 'HIGH',
                technique: 'direct_override'
            });
        }

        return anomalies;
    }

    /**
     * Calculate risk score for analysis
     */
    calculateRiskScore(analysis) {
        let score = 0;

        // Weight threats
        for (const threat of analysis.threats) {
            const severityScore = {
                'CRITICAL': 0.4,
                'HIGH': 0.3,
                'MEDIUM': 0.2,
                'LOW': 0.1
            };
            score += severityScore[threat.severity] || 0.1;
        }

        // Weight anomalies
        for (const anomaly of analysis.anomalies) {
            const severityScore = {
                'HIGH': 0.2,
                'MEDIUM': 0.1,
                'LOW': 0.05
            };
            score += severityScore[anomaly.severity] || 0.05;
        }

        return Math.min(1, score); // Cap at 1.0
    }

    /**
     * Update user profile for behavioral analysis
     */
    updateUserProfile(analysis) {
        const userId = analysis.userId || 'anonymous';

        if (!this.baseline.userProfiles.has(userId)) {
            this.baseline.userProfiles.set(userId, {
                queryCount: 0,
                avgQueryLength: 0,
                patterns: [],
                riskScore: 0,
                lastSeen: null
            });
        }

        const profile = this.baseline.userProfiles.get(userId);
        profile.queryCount++;
        profile.avgQueryLength = (profile.avgQueryLength * (profile.queryCount - 1) +
                                  analysis.request.length) / profile.queryCount;
        profile.lastSeen = analysis.timestamp;
        profile.riskScore = (profile.riskScore * 0.9) + (analysis.riskScore * 0.1); // Weighted average
    }

    /**
     * Start threat hunting (proactive threat detection)
     */
    startThreatHunting() {
        // Periodic threat hunting
        setInterval(() => {
            this.huntForThreats();
        }, 30000); // Every 30 seconds
    }

    /**
     * Hunt for threats proactively
     */
    async huntForThreats() {
        const hunts = [
            this.huntForRateAnomalies(),
            this.huntForPatternSequences(),
            this.huntForDataExfiltration(),
            this.huntForCoordinatedAttacks()
        ];

        const results = await Promise.all(hunts);

        for (const threats of results) {
            if (threats.length > 0) {
                this.handleThreats(threats);
            }
        }
    }

    /**
     * Hunt for rate anomalies
     */
    huntForRateAnomalies() {
        const threats = [];
        const now = Date.now();

        for (const [userId, profile] of this.baseline.userProfiles) {
            const timeSinceLastSeen = now - new Date(profile.lastSeen).getTime();

            if (timeSinceLastSeen < 60000) { // Active in last minute
                const queryRate = profile.queryCount / (timeSinceLastSeen / 60000);

                if (queryRate > this.baseline.normalQueryRate * this.thresholds.queryRateMultiplier) {
                    threats.push({
                        type: 'RATE_ANOMALY',
                        severity: 'MEDIUM',
                        userId,
                        queryRate,
                        category: 'DOS'
                    });
                }
            }
        }

        return threats;
    }

    /**
     * Hunt for suspicious pattern sequences
     */
    huntForPatternSequences() {
        const threats = [];

        // Look for patterns that indicate systematic probing
        const recentThreats = this.state.threats.slice(-100); // Last 100 threats

        // Group by user/session
        const sequences = new Map();
        for (const threat of recentThreats) {
            const key = threat.userId || 'anonymous';
            if (!sequences.has(key)) {
                sequences.set(key, []);
            }
            sequences.get(key).push(threat);
        }

        // Analyze sequences
        for (const [userId, userThreats] of sequences) {
            if (userThreats.length >= this.thresholds.suspiciousPatternCount) {
                const categories = new Set(userThreats.map(t => t.threats[0]?.category));

                if (categories.size >= 3) {
                    threats.push({
                        type: 'SYSTEMATIC_PROBING',
                        severity: 'HIGH',
                        userId,
                        techniqueCount: categories.size,
                        category: 'RECONNAISSANCE'
                    });
                }
            }
        }

        return threats;
    }

    /**
     * Hunt for data exfiltration attempts
     */
    huntForDataExfiltration() {
        const threats = [];

        // Look for patterns indicating data extraction
        for (const [userId, profile] of this.baseline.userProfiles) {
            if (profile.patterns.filter(p => p.includes('extract')).length > 5) {
                threats.push({
                    type: 'DATA_EXFILTRATION_ATTEMPT',
                    severity: 'CRITICAL',
                    userId,
                    category: 'DATA_LEAK'
                });
            }
        }

        return threats;
    }

    /**
     * Hunt for coordinated attacks
     */
    huntForCoordinatedAttacks() {
        const threats = [];

        // Look for similar attacks from different sources
        const recentThreats = this.state.threats.slice(-50);
        const threatGroups = new Map();

        for (const threat of recentThreats) {
            const key = threat.threats[0]?.type || 'unknown';
            if (!threatGroups.has(key)) {
                threatGroups.set(key, []);
            }
            threatGroups.get(key).push(threat);
        }

        for (const [threatType, group] of threatGroups) {
            if (group.length > 10) {
                const uniqueUsers = new Set(group.map(t => t.userId || 'anonymous')).size;

                if (uniqueUsers > 3) {
                    threats.push({
                        type: 'COORDINATED_ATTACK',
                        severity: 'CRITICAL',
                        threatType,
                        sourceCount: uniqueUsers,
                        category: 'COORDINATED'
                    });
                }
            }
        }

        return threats;
    }

    /**
     * Handle detected threats
     */
    handleThreats(threats) {
        for (const threat of threats) {
            // Log threat
            console.log(`🚨 Threat detected: ${threat.type} [${threat.severity}]`);

            // Store in active alerts
            this.state.activeAlerts.push(threat);

            // Emit threat event
            this.emit('threat', threat);

            // Update metrics
            if (!this.state.metrics.threatsByCategory[threat.category]) {
                this.state.metrics.threatsByCategory[threat.category] = 0;
            }
            this.state.metrics.threatsByCategory[threat.category]++;
        }
    }

    /**
     * Trigger incident response
     */
    triggerIncidentResponse(analysis) {
        const incident = {
            id: this.generateIncidentId(),
            timestamp: new Date().toISOString(),
            severity: 'CRITICAL',
            analysis,
            response: 'AUTOMATED',
            actions: []
        };

        // Determine response actions
        if (analysis.riskScore > 0.95) {
            incident.actions.push('BLOCK_USER');
            incident.actions.push('ALERT_ADMIN');
        } else if (analysis.riskScore > 0.9) {
            incident.actions.push('RATE_LIMIT');
            incident.actions.push('ENHANCED_MONITORING');
        }

        // Emit incident
        this.emit('incident', incident);

        console.log(`🚨 INCIDENT: ${incident.id} - Automated response triggered`);
    }

    /**
     * Update monitoring metrics
     */
    updateMetrics(analysis) {
        // Update detection rate
        if (analysis.threats.length > 0) {
            this.state.metrics.detectionRate++;
        }

        // Update average response time (if available)
        if (analysis.responseTime) {
            const alpha = 0.1; // Smoothing factor
            this.state.metrics.avgResponseTime =
                (1 - alpha) * this.state.metrics.avgResponseTime +
                alpha * analysis.responseTime;
        }
    }

    // Helper methods

    detectEncodedContent(text) {
        // Base64 pattern
        if (/^[A-Za-z0-9+/]+=*$/.test(text.trim())) return true;

        // Hex pattern
        if (/^[0-9A-Fa-f]+$/.test(text.trim()) && text.length % 2 === 0) return true;

        // URL encoding
        if (/%[0-9A-Fa-f]{2}/.test(text)) return true;

        return false;
    }

    identifyEncoding(text) {
        if (/^[A-Za-z0-9+/]+=*$/.test(text.trim())) return 'base64';
        if (/^[0-9A-Fa-f]+$/.test(text.trim())) return 'hex';
        if (/%[0-9A-Fa-f]{2}/.test(text)) return 'url';
        return 'unknown';
    }

    detectContextSwitch(text) {
        const patterns = [
            /new context/i,
            /forget everything/i,
            /start over/i,
            /reset/i,
            /ignore above/i
        ];
        return patterns.some(p => p.test(text));
    }

    detectRoleConfusion(text) {
        const patterns = [
            /you are now/i,
            /act as/i,
            /pretend to be/i,
            /roleplay/i,
            /imagine you're/i
        ];
        return patterns.some(p => p.test(text));
    }

    detectInstructionOverride(text) {
        const patterns = [
            /override/i,
            /bypass/i,
            /ignore instructions/i,
            /disable safety/i,
            /turn off/i
        ];
        return patterns.some(p => p.test(text));
    }

    calculatePatternConfidence(text, pattern) {
        // Simple confidence based on match clarity
        const match = text.match(pattern);
        if (!match) return 0;

        // Exact match gets high confidence
        if (match[0] === text) return 100;

        // Partial match gets medium confidence
        return 70;
    }

    getRiskSeverity(score) {
        if (score > 0.8) return 'CRITICAL';
        if (score > 0.6) return 'HIGH';
        if (score > 0.4) return 'MEDIUM';
        if (score > 0.2) return 'LOW';
        return 'INFO';
    }

    generateIncidentId() {
        return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get current monitoring status
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            totalQueries: this.state.totalQueries,
            activeAlerts: this.state.activeAlerts.length,
            threatCount: this.state.threats.length,
            metrics: this.state.metrics,
            userProfiles: this.baseline.userProfiles.size
        };
    }

    /**
     * Generate threat report
     */
    generateThreatReport() {
        const report = {
            timestamp: new Date().toISOString(),
            monitoringDuration: this.getMonitoringDuration(),
            summary: {
                totalQueries: this.state.totalQueries,
                totalThreats: this.state.threats.length,
                activeAlerts: this.state.activeAlerts.length,
                detectionRate: `${((this.state.metrics.detectionRate / this.state.totalQueries) * 100).toFixed(2)}%`
            },
            threatsByCategory: this.state.metrics.threatsByCategory,
            topThreats: this.getTopThreats(),
            riskTrend: this.calculateRiskTrend(),
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    getMonitoringDuration() {
        // Calculate monitoring duration
        return '00:00:00'; // Placeholder
    }

    getTopThreats() {
        // Get most common threats
        const threatCounts = {};
        for (const threat of this.state.threats) {
            const type = threat.threats[0]?.type || 'unknown';
            threatCounts[type] = (threatCounts[type] || 0) + 1;
        }

        return Object.entries(threatCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }

    calculateRiskTrend() {
        // Calculate if risk is increasing or decreasing
        if (this.state.threats.length < 10) return 'INSUFFICIENT_DATA';

        const recent = this.state.threats.slice(-10);
        const older = this.state.threats.slice(-20, -10);

        const recentAvgRisk = recent.reduce((sum, t) => sum + (t.riskScore || 0), 0) / recent.length;
        const olderAvgRisk = older.reduce((sum, t) => sum + (t.riskScore || 0), 0) / older.length;

        if (recentAvgRisk > olderAvgRisk * 1.2) return 'INCREASING';
        if (recentAvgRisk < olderAvgRisk * 0.8) return 'DECREASING';
        return 'STABLE';
    }

    generateRecommendations() {
        const recommendations = [];

        // Based on threat patterns
        if (this.state.metrics.threatsByCategory['INJECTION'] > 10) {
            recommendations.push('Strengthen input validation and sanitization');
        }

        if (this.state.metrics.threatsByCategory['DATA_LEAK'] > 5) {
            recommendations.push('Implement PII detection and redaction');
        }

        if (this.state.metrics.threatsByCategory['DOS'] > 10) {
            recommendations.push('Enhance rate limiting and resource management');
        }

        if (this.state.activeAlerts.length > 5) {
            recommendations.push('Review and respond to active security alerts');
        }

        return recommendations;
    }
}

module.exports = BlueTeamMonitor;