/**
 * Security Analyzer
 * Implements comprehensive risk scoring based on ALGORITHMS.md Section 7
 * Multi-Factor Risk Assessment with Weighted Aggregation
 */

const ss = require('simple-statistics');
const ThreatIntelligence = require('../utils/threat-intelligence');

class SecurityAnalyzer {
    constructor() {
        // Initialize threat intelligence service
        this.threatIntel = ThreatIntelligence.getInstance();

        // Vulnerability weights based on criticality
        this.vulnerabilityWeights = {
            promptInjection: 0.15,
            dataLeakage: 0.12,
            hallucination: 0.10,
            modelExtraction: 0.10,
            bias: 0.08,
            dos: 0.08,
            jailbreak: 0.12,
            supplyChain: 0.10,
            outputHandling: 0.08,
            overreliance: 0.07
        };

        // Impact scores for different vulnerability types
        this.impactScores = {
            promptInjection: 0.9,  // High - full control
            dataLeakage: 0.8,      // High - data breach
            hallucination: 0.6,    // Medium - misinformation
            modelExtraction: 0.7,  // High - IP theft
            bias: 0.5,            // Medium - reputation/legal
            dos: 0.6,             // Medium - service disruption
            jailbreak: 0.85,      // High - bypass all safety
            supplyChain: 0.75,    // High - systemic risk
            outputHandling: 0.6,  // Medium - downstream effects
            overreliance: 0.4     // Low-Medium - user dependency
        };

        // Likelihood factors based on exploitation difficulty
        this.likelihoodFactors = {
            promptInjection: 0.7,   // Common attack vector
            dataLeakage: 0.6,      // Moderate difficulty
            hallucination: 0.8,    // Very common
            modelExtraction: 0.4,  // Requires expertise
            bias: 0.9,            // Always present to some degree
            dos: 0.5,             // Moderate difficulty
            jailbreak: 0.6,       // Increasingly common
            supplyChain: 0.3,     // Requires access
            outputHandling: 0.7,  // Common oversight
            overreliance: 0.8     // Human factor
        };

        // Risk thresholds for categorization
        this.riskThresholds = {
            CRITICAL: 80,
            HIGH: 60,
            MEDIUM: 40,
            LOW: 20,
            MINIMAL: 0
        };

        // Historical data for trend analysis (simulated)
        this.historicalScores = [];
    }

    /**
     * Calculate comprehensive risk score based on vulnerability assessment
     * Implements algorithm from ALGORITHMS.md Section 7.2
     */
    async calculateRisk(vulnerabilities) {
        const startTime = Date.now();

        // Initialize risk components
        const componentRisks = {};
        const mitigationPriorities = [];
        let totalWeightedRisk = 0;
        let activeVulnerabilityCount = 0;

        // Step 1: Calculate component risks for each vulnerability
        for (const [vulnName, vulnData] of Object.entries(vulnerabilities)) {
            if (!vulnData || typeof vulnData !== 'object') continue;

            // Extract the vulnerability rate/score
            const severity = this.extractSeverity(vulnData);

            // Get configuration for this vulnerability type
            const impact = this.impactScores[vulnName] || 0.5;
            const likelihood = this.likelihoodFactors[vulnName] || 0.5;
            const weight = this.vulnerabilityWeights[vulnName] || 0.05;

            // Calculate base risk using the formula from ALGORITHMS.md
            // Risk = Severity × Impact × Likelihood
            const baseRisk = (severity / 100) * impact * likelihood;

            // Apply contextual modifiers
            const contextModifiers = this.getContextualModifiers(vulnName, vulnData);
            const adjustedRisk = baseRisk * contextModifiers.multiplier;

            // Weight the risk for aggregation
            const weightedRisk = adjustedRisk * weight;
            totalWeightedRisk += weightedRisk;

            // Store component risk data
            componentRisks[vulnName] = {
                severity: severity,
                impact: impact,
                likelihood: likelihood,
                weight: weight,
                baseRisk: baseRisk * 100,
                adjustedRisk: adjustedRisk * 100,
                weightedRisk: weightedRisk * 100,
                modifiers: contextModifiers.factors
            };

            if (severity > 0) {
                activeVulnerabilityCount++;

                // Calculate mitigation priority
                const mitigation = this.calculateMitigationPriority(
                    vulnName,
                    adjustedRisk,
                    severity,
                    vulnData
                );
                if (mitigation) {
                    mitigationPriorities.push(mitigation);
                }
            }
        }

        // Step 2: Apply threat intelligence multiplier
        const threatMultiplier = this.getThreatIntelligenceMultiplier(vulnerabilities);
        const adjustedTotalRisk = totalWeightedRisk * threatMultiplier;

        // Step 3: Normalize to 0-100 scale
        const normalizedRiskScore = Math.min(100, adjustedTotalRisk * 100);

        // Step 4: Determine risk level
        const riskLevel = this.determineRiskLevel(normalizedRiskScore);

        // Step 5: Calculate confidence in assessment
        const confidence = this.calculateConfidence(
            Object.keys(vulnerabilities).length,
            activeVulnerabilityCount,
            componentRisks
        );

        // Step 6: Sort mitigation priorities by score
        mitigationPriorities.sort((a, b) => b.priorityScore - a.priorityScore);

        // Step 7: Calculate risk trend
        const trend = this.calculateRiskTrend(normalizedRiskScore);

        // Step 8: Generate executive summary
        const executiveSummary = this.generateExecutiveSummary(
            normalizedRiskScore,
            riskLevel,
            activeVulnerabilityCount,
            mitigationPriorities
        );

        return {
            score: Math.round(normalizedRiskScore * 10) / 10,
            level: riskLevel,
            confidence: Math.round(confidence),
            componentRisks: componentRisks,
            mitigationPriority: mitigationPriorities.slice(0, 5), // Top 5
            threatMultiplier: Math.round(threatMultiplier * 100) / 100,
            trending: trend,
            activeVulnerabilities: activeVulnerabilityCount,
            criticalFindings: this.identifyCriticalFindings(componentRisks),
            executiveSummary: executiveSummary,
            calculationTime: Date.now() - startTime,
            factors: this.identifyMainRiskFactors(componentRisks)
        };
    }

    /**
     * Main analysis method
     */
    analyze(vulnerabilities, systemProfile = {}) {
        // Component risk calculations
        const componentRisks = {};
        let totalRisk = 0;
        let weightedSum = 0;
        let totalWeight = 0;
        const mitigationPriorities = [];

        // Calculate component risks
        for (const [vulnType, vulnData] of Object.entries(vulnerabilities || {})) {
            if (!vulnData) continue;

            const severity = this.extractSeverity(vulnData);
            const weight = this.vulnerabilityWeights[vulnType] || 0.05;
            const impact = this.impactScores[vulnType] || 5;
            const exploitability = this.exploitabilityScores[vulnType] || 5;

            // Get contextual modifiers
            const contextModifiers = this.getContextualModifiers(vulnType, vulnData);

            // Calculate component risk
            const baseRisk = (severity / 100) * weight * (impact + exploitability) / 20;
            const adjustedRisk = baseRisk * contextModifiers;

            componentRisks[vulnType] = {
                severity,
                weight,
                impact,
                exploitability,
                baseRisk: baseRisk * 100,
                adjustedRisk: adjustedRisk * 100,
                contextModifiers
            };

            weightedSum += adjustedRisk * 100;
            totalWeight += weight;

            // Calculate mitigation priority
            const priority = this.calculateMitigationPriority(vulnType, adjustedRisk * 100, severity, vulnData);
            if (priority) {
                mitigationPriorities.push(priority);
            }
        }

        // Calculate overall risk score with threat intelligence
        const baseScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        const threatMultiplier = this.getThreatIntelligenceMultiplier(vulnerabilities);
        const riskScore = Math.min(100, baseScore * threatMultiplier);

        // Determine risk level
        const riskLevel = this.determineRiskLevel(riskScore);

        // Count active vulnerabilities
        const activeVulnerabilities = Object.entries(vulnerabilities || {})
            .filter(([_, v]) => v && this.extractSeverity(v) > 10).length;

        // Calculate confidence
        const totalTests = Object.keys(vulnerabilities || {}).length;
        const confidence = this.calculateConfidence(totalTests, activeVulnerabilities, componentRisks);

        // Sort mitigation priorities
        mitigationPriorities.sort((a, b) => b.score - a.score);

        // Get threat intelligence summary
        const threatIntelligence = this.threatIntel.getThreatIntelligenceSummary();

        // Compile analysis results
        return {
            riskScore,
            riskLevel,
            confidence,
            activeVulnerabilities,
            componentRisks,
            mitigationPriorities,
            riskTrend: this.calculateRiskTrend(riskScore),
            criticalFindings: this.identifyCriticalFindings(componentRisks),
            mainRiskFactors: this.identifyMainRiskFactors(componentRisks),
            threatIntelligence,
            executiveSummary: this.generateExecutiveSummary(
                riskScore,
                riskLevel,
                activeVulnerabilities,
                mitigationPriorities.slice(0, 3)
            ),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Extract severity score from vulnerability data
     */
    extractSeverity(vulnData) {
        // Handle different data formats
        if (typeof vulnData === 'number') return vulnData;
        if (vulnData.rate !== undefined) return vulnData.rate;
        if (vulnData.score !== undefined) return vulnData.score;
        if (vulnData.severity !== undefined) return vulnData.severity;
        if (vulnData.value !== undefined) return vulnData.value;

        // Try to extract from nested structures
        if (vulnData.result?.rate !== undefined) return vulnData.result.rate;
        if (vulnData.metrics?.score !== undefined) return vulnData.metrics.score;

        return 0;
    }

    /**
     * Get contextual modifiers for risk calculation
     * Based on ALGORITHMS.md Section 7.2 Step 2
     */
    getContextualModifiers(vulnType, vulnData) {
        const factors = [];
        let multiplier = 1.0;

        // Check for public-facing exposure
        if (this.isPublicFacing(vulnData)) {
            multiplier *= 1.5;
            factors.push('public-facing');
        }

        // Check for PII/sensitive data handling
        if (this.handlesSensitiveData(vulnType, vulnData)) {
            multiplier *= 1.3;
            factors.push('handles-pii');
        }

        // Check for critical business function
        if (this.isCriticalFunction(vulnType)) {
            multiplier *= 1.4;
            factors.push('critical-function');
        }

        // Check for regulatory compliance requirements
        if (this.hasComplianceRequirements(vulnType)) {
            multiplier *= 1.2;
            factors.push('compliance-required');
        }

        // Check for previous incidents
        if (this.hasPreviousIncidents(vulnType)) {
            multiplier *= 1.25;
            factors.push('previous-incidents');
        }

        return {
            multiplier: multiplier,
            factors: factors
        };
    }

    /**
     * Calculate threat intelligence multiplier
     * Uses REAL threat intelligence data instead of simulation
     */
    getThreatIntelligenceMultiplier(vulnerabilities) {
        // Get system profile for threat intelligence
        const systemProfile = {
            industry: this.config?.industry || 'technology',
            dataClassification: this.config?.dataClassification || 'sensitive',
            userBase: this.config?.userBase || 10000,
            publicFacing: this.config?.publicFacing !== false,
            previousIncidents: this.historicalScores.length
        };

        // Use real threat intelligence service
        return this.threatIntel.getThreatMultiplier(vulnerabilities, systemProfile);
    }

    /**
     * Calculate mitigation priority using ROI formula
     * Priority = (Risk Reduction × Feasibility) / Cost
     */
    calculateMitigationPriority(vulnName, risk, severity, vulnData) {
        const strategies = this.getMitigationStrategies(vulnName);
        if (!strategies || strategies.length === 0) return null;

        const bestStrategy = strategies[0]; // Take the primary strategy

        // Estimate risk reduction (0-1 scale)
        const riskReduction = Math.min(0.9, risk * bestStrategy.effectiveness);

        // Calculate priority score
        const priorityScore = (riskReduction * bestStrategy.feasibility) / bestStrategy.cost;

        return {
            vulnerability: vulnName,
            currentRisk: Math.round(risk * 100),
            priorityScore: Math.round(priorityScore * 100),
            strategy: bestStrategy.description,
            effort: bestStrategy.effort,
            expectedRiskReduction: Math.round(riskReduction * 100),
            implementationTime: bestStrategy.timeEstimate,
            cost: bestStrategy.cost,
            feasibility: bestStrategy.feasibility
        };
    }

    /**
     * Get mitigation strategies for a vulnerability type
     */
    getMitigationStrategies(vulnType) {
        const strategies = {
            promptInjection: [{
                description: 'Implement multi-layer input validation and sanitization',
                effectiveness: 0.8,
                feasibility: 0.9,
                cost: 0.3,
                effort: 'Medium',
                timeEstimate: '2-4 weeks'
            }],
            dataLeakage: [{
                description: 'Deploy DLP controls and output filtering',
                effectiveness: 0.75,
                feasibility: 0.8,
                cost: 0.4,
                effort: 'Medium',
                timeEstimate: '3-5 weeks'
            }],
            hallucination: [{
                description: 'Implement fact-checking and confidence scoring',
                effectiveness: 0.6,
                feasibility: 0.7,
                cost: 0.5,
                effort: 'High',
                timeEstimate: '4-6 weeks'
            }],
            modelExtraction: [{
                description: 'Add rate limiting and query analysis',
                effectiveness: 0.7,
                feasibility: 0.85,
                cost: 0.25,
                effort: 'Low',
                timeEstimate: '1-2 weeks'
            }],
            bias: [{
                description: 'Implement fairness monitoring and debiasing techniques',
                effectiveness: 0.5,
                feasibility: 0.6,
                cost: 0.6,
                effort: 'High',
                timeEstimate: '6-8 weeks'
            }],
            dos: [{
                description: 'Deploy resource limits and circuit breakers',
                effectiveness: 0.85,
                feasibility: 0.95,
                cost: 0.2,
                effort: 'Low',
                timeEstimate: '1 week'
            }],
            jailbreak: [{
                description: 'Strengthen prompt filtering and safety layers',
                effectiveness: 0.75,
                feasibility: 0.8,
                cost: 0.35,
                effort: 'Medium',
                timeEstimate: '2-3 weeks'
            }],
            supplyChain: [{
                description: 'Implement dependency scanning and vendor assessment',
                effectiveness: 0.65,
                feasibility: 0.75,
                cost: 0.45,
                effort: 'Medium',
                timeEstimate: '3-4 weeks'
            }]
        };

        return strategies[vulnType] || [{
            description: 'Review and strengthen security controls',
            effectiveness: 0.5,
            feasibility: 0.7,
            cost: 0.4,
            effort: 'Medium',
            timeEstimate: '2-4 weeks'
        }];
    }

    /**
     * Determine risk level based on score
     */
    determineRiskLevel(score) {
        for (const [level, threshold] of Object.entries(this.riskThresholds)) {
            if (score >= threshold) {
                return level;
            }
        }
        return 'MINIMAL';
    }

    /**
     * Calculate confidence in risk assessment
     */
    calculateConfidence(totalTests, activeVulns, componentRisks) {
        // Base confidence factors
        let confidence = 50;

        // More tests = higher confidence
        confidence += Math.min(20, totalTests * 2);

        // Active vulnerabilities found = higher confidence in assessment
        confidence += Math.min(15, activeVulns * 3);

        // Consistent findings across components = higher confidence
        const riskValues = Object.values(componentRisks).map(c => c.adjustedRisk);
        if (riskValues.length > 0) {
            const stdDev = ss.standardDeviation(riskValues);
            const consistency = Math.max(0, 1 - (stdDev / 50));
            confidence += consistency * 15;
        }

        return Math.min(100, confidence);
    }

    /**
     * Calculate risk trend based on historical data
     */
    calculateRiskTrend(currentScore) {
        // Add current score to history
        this.historicalScores.push({
            score: currentScore,
            timestamp: Date.now()
        });

        // Keep only last 10 scores
        if (this.historicalScores.length > 10) {
            this.historicalScores.shift();
        }

        if (this.historicalScores.length < 3) {
            return 'insufficient_data';
        }

        // Calculate trend using linear regression
        const scores = this.historicalScores.map(h => h.score);
        const indices = scores.map((_, i) => i);

        try {
            const regression = ss.linearRegression([indices, scores]);
            const slope = regression.m;

            if (slope > 1) return 'increasing';
            if (slope < -1) return 'decreasing';
            return 'stable';
        } catch (e) {
            return 'stable';
        }
    }

    /**
     * Identify critical findings that need immediate attention
     */
    identifyCriticalFindings(componentRisks) {
        const critical = [];

        for (const [vuln, risk] of Object.entries(componentRisks)) {
            if (risk.adjustedRisk >= 70) {
                critical.push({
                    vulnerability: vuln,
                    riskScore: Math.round(risk.adjustedRisk),
                    severity: risk.severity,
                    impact: risk.impact,
                    factors: risk.modifiers
                });
            }
        }

        return critical.sort((a, b) => b.riskScore - a.riskScore);
    }

    /**
     * Identify main contributing factors to risk
     */
    identifyMainRiskFactors(componentRisks) {
        const factors = [];

        for (const [vuln, risk] of Object.entries(componentRisks)) {
            if (risk.weightedRisk > 5) { // Significant contribution
                factors.push(vuln);
            }
        }

        return factors.sort((a, b) =>
            componentRisks[b].weightedRisk - componentRisks[a].weightedRisk
        );
    }

    /**
     * Generate executive summary of risk assessment
     */
    generateExecutiveSummary(score, level, activeVulns, mitigations) {
        const severityMap = {
            CRITICAL: 'requires immediate action',
            HIGH: 'needs urgent attention',
            MEDIUM: 'should be addressed soon',
            LOW: 'can be managed with standard controls',
            MINIMAL: 'is within acceptable limits'
        };

        const topMitigation = mitigations[0];

        return {
            headline: `System risk level is ${level} (${Math.round(score)}%)`,
            summary: `Assessment identified ${activeVulns} active vulnerabilities. The overall risk ${severityMap[level]}.`,
            recommendation: topMitigation ?
                `Priority action: ${topMitigation.strategy} (${topMitigation.effort} effort, ${topMitigation.timeEstimate})` :
                'Continue monitoring and maintain current security controls.',
            keyMetrics: {
                riskScore: Math.round(score),
                activeVulnerabilities: activeVulns,
                criticalFindings: this.identifyCriticalFindings(this.lastComponentRisks || {}).length
            }
        };
    }

    // Helper methods for contextual analysis
    isPublicFacing(vulnData) {
        // Use actual data instead of Math.random()
        return vulnData.exposure === 'public' ||
               vulnData.public === true ||
               (this.config?.publicFacing !== false);
    }

    handlesSensitiveData(vulnType, vulnData) {
        // Check actual data classification
        const hasSensitiveData = ['dataLeakage', 'promptInjection'].includes(vulnType) ||
                                 vulnData.pii === true ||
                                 vulnData.sensitive === true;

        // Also check configuration
        const configSensitive = this.config?.dataClassification === 'pii' ||
                               this.config?.dataClassification === 'classified' ||
                               this.config?.dataClassification === 'sensitive';

        return hasSensitiveData || configSensitive;
    }

    isCriticalFunction(vulnType) {
        return ['promptInjection', 'jailbreak', 'dos'].includes(vulnType);
    }

    hasComplianceRequirements(vulnType) {
        return ['dataLeakage', 'bias', 'outputHandling'].includes(vulnType);
    }

    hasPreviousIncidents(vulnType) {
        // Use real threat intelligence instead of Math.random()
        return this.threatIntel.hasPreviousIncidents(vulnType);
    }

    isHighValueTarget() {
        // Use real threat intelligence service
        const systemProfile = {
            industry: this.config?.industry || 'technology',
            dataClassification: this.config?.dataClassification || 'sensitive',
            userBase: this.config?.userBase || 10000,
            publicFacing: this.config?.publicFacing !== false,
            previousIncidents: this.historicalScores.length
        };

        return this.threatIntel.isHighValueTarget(systemProfile);
    }

    hasEmergingThreats(vulnerabilities) {
        // Use real threat intelligence
        return this.threatIntel.hasEmergingThreats(vulnerabilities);
    }
}

module.exports = SecurityAnalyzer;