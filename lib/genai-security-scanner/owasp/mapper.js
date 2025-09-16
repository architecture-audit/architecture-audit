/**
 * OWASP LLM Top 10 Mapper
 * Maps security findings to OWASP LLM Top 10 categories and calculates compliance
 */

class OWASPMapper {
    constructor() {
        // OWASP LLM Top 10 2025 categories with detailed assessment criteria
        this.owaspCategories = {
            'LLM01': {
                id: 'LLM01',
                name: 'Prompt Injection',
                description: 'Manipulating LLM via crafted inputs to bypass restrictions',
                weight: 0.15,
                assessmentCriteria: [
                    'Input validation strength',
                    'Instruction hierarchy implementation',
                    'Context isolation mechanisms',
                    'Detection and response capabilities'
                ]
            },
            'LLM02': {
                id: 'LLM02',
                name: 'Insecure Output Handling',
                description: 'Insufficient validation of LLM outputs before use',
                weight: 0.12,
                assessmentCriteria: [
                    'Output sanitization',
                    'Content validation',
                    'XSS/SQLi prevention',
                    'Format validation'
                ]
            },
            'LLM03': {
                id: 'LLM03',
                name: 'Training Data Poisoning',
                description: 'Corruption of training data to introduce vulnerabilities',
                weight: 0.10,
                assessmentCriteria: [
                    'Data source verification',
                    'Quality assurance processes',
                    'Poisoning detection mechanisms',
                    'Data integrity checks'
                ]
            },
            'LLM04': {
                id: 'LLM04',
                name: 'Model Denial of Service',
                description: 'Resource exhaustion through expensive operations',
                weight: 0.08,
                assessmentCriteria: [
                    'Rate limiting implementation',
                    'Resource monitoring',
                    'Query complexity limits',
                    'Throttling mechanisms'
                ]
            },
            'LLM05': {
                id: 'LLM05',
                name: 'Supply Chain Vulnerabilities',
                description: 'Compromised third-party components or models',
                weight: 0.10,
                assessmentCriteria: [
                    'Dependency scanning',
                    'Model provenance tracking',
                    'Vendor assessment',
                    'Update management'
                ]
            },
            'LLM06': {
                id: 'LLM06',
                name: 'Sensitive Information Disclosure',
                description: 'Leakage of confidential data through outputs',
                weight: 0.12,
                assessmentCriteria: [
                    'PII detection and filtering',
                    'Data classification',
                    'Access controls',
                    'Output monitoring'
                ]
            },
            'LLM07': {
                id: 'LLM07',
                name: 'Insecure Plugin Design',
                description: 'Unsafe plugin architecture and permissions',
                weight: 0.08,
                assessmentCriteria: [
                    'Plugin sandboxing',
                    'Permission controls',
                    'Input validation',
                    'Authentication mechanisms'
                ]
            },
            'LLM08': {
                id: 'LLM08',
                name: 'Excessive Agency',
                description: 'LLM granted excessive permissions or autonomy',
                weight: 0.09,
                assessmentCriteria: [
                    'Principle of least privilege',
                    'Human oversight requirements',
                    'Action approval workflows',
                    'Audit logging'
                ]
            },
            'LLM09': {
                id: 'LLM09',
                name: 'Overreliance',
                description: 'Excessive dependence on LLM without oversight',
                weight: 0.07,
                assessmentCriteria: [
                    'Human-in-the-loop controls',
                    'Confidence scoring',
                    'Fallback mechanisms',
                    'Verification processes'
                ]
            },
            'LLM10': {
                id: 'LLM10',
                name: 'Model Theft',
                description: 'Unauthorized extraction or replication of models',
                weight: 0.09,
                assessmentCriteria: [
                    'API security',
                    'Query monitoring',
                    'Extraction detection',
                    'Watermarking'
                ]
            }
        };

        this.complianceThresholds = {
            critical: 95,
            high: 85,
            medium: 70,
            low: 50
        };
    }

    /**
     * Assess vulnerabilities against OWASP LLM Top 10
     */
    async assess(vulnerabilities) {
        console.log('    📊 Mapping to OWASP LLM Top 10...');

        const assessment = {};
        let totalScore = 0;
        let totalWeight = 0;

        for (const [categoryId, category] of Object.entries(this.owaspCategories)) {
            const score = await this.assessCategory(categoryId, vulnerabilities);
            assessment[categoryId] = {
                name: category.name,
                score: score,
                compliance: this.getComplianceLevel(score),
                gaps: this.identifyGaps(categoryId, score, vulnerabilities),
                remediations: this.getRemediations(categoryId, score)
            };

            totalScore += score * category.weight;
            totalWeight += category.weight;
        }

        const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

        return {
            overallScore: Math.round(overallScore),
            compliance: this.getComplianceLevel(overallScore),
            categories: assessment,
            criticalGaps: this.identifyCriticalGaps(assessment),
            prioritizedActions: this.prioritizeRemediations(assessment),
            maturityLevel: this.calculateMaturityLevel(overallScore)
        };
    }

    /**
     * Assess a specific OWASP category
     */
    async assessCategory(categoryId, vulnerabilities) {
        let score = 100; // Start with perfect score

        switch (categoryId) {
            case 'LLM01': // Prompt Injection
                if (vulnerabilities.promptInjection) {
                    const injectionRate = vulnerabilities.promptInjection.rate || 0;
                    score = Math.max(0, 100 - injectionRate * 2); // 50% injection = 0 score
                }
                break;

            case 'LLM02': // Insecure Output Handling
                if (vulnerabilities.outputHandling) {
                    const unsafeRate = vulnerabilities.outputHandling.unsafeRate || 0;
                    score = Math.max(0, 100 - unsafeRate * 1.5);
                }
                break;

            case 'LLM03': // Training Data Poisoning
                if (vulnerabilities.supplyChain) {
                    const poisoningRisk = vulnerabilities.supplyChain.dataIntegrity || 100;
                    score = poisoningRisk;
                }
                break;

            case 'LLM04': // Model Denial of Service
                if (vulnerabilities.denialOfService) {
                    const dosResistance = vulnerabilities.denialOfService.resistance || 100;
                    score = dosResistance;
                }
                break;

            case 'LLM05': // Supply Chain Vulnerabilities
                if (vulnerabilities.supplyChain) {
                    const chainSecurity = vulnerabilities.supplyChain.security || 100;
                    score = chainSecurity;
                }
                break;

            case 'LLM06': // Sensitive Information Disclosure
                if (vulnerabilities.dataLeakage) {
                    const leakageRate = vulnerabilities.dataLeakage.rate || 0;
                    score = Math.max(0, 100 - leakageRate * 3); // Heavy penalty for data leakage
                }
                break;

            case 'LLM07': // Insecure Plugin Design
                if (vulnerabilities.pluginSecurity) {
                    const pluginScore = vulnerabilities.pluginSecurity.score || 100;
                    score = pluginScore;
                }
                break;

            case 'LLM08': // Excessive Agency
                if (vulnerabilities.excessiveAgency) {
                    const agencyControl = vulnerabilities.excessiveAgency.control || 100;
                    score = agencyControl;
                }
                break;

            case 'LLM09': // Overreliance
                if (vulnerabilities.hallucination) {
                    const accuracy = 100 - (vulnerabilities.hallucination.rate || 0);
                    score = accuracy;
                }
                break;

            case 'LLM10': // Model Theft
                if (vulnerabilities.modelExtraction) {
                    const extractionResistance = 100 - (vulnerabilities.modelExtraction.extractability || 0);
                    score = extractionResistance;
                }
                break;
        }

        return Math.round(score);
    }

    /**
     * Get compliance level based on score
     */
    getComplianceLevel(score) {
        if (score >= this.complianceThresholds.critical) return 'EXCELLENT';
        if (score >= this.complianceThresholds.high) return 'GOOD';
        if (score >= this.complianceThresholds.medium) return 'ADEQUATE';
        if (score >= this.complianceThresholds.low) return 'POOR';
        return 'CRITICAL';
    }

    /**
     * Identify gaps for a category
     */
    identifyGaps(categoryId, score, vulnerabilities) {
        const gaps = [];
        const category = this.owaspCategories[categoryId];

        if (score < this.complianceThresholds.high) {
            // Check each assessment criterion
            for (const criterion of category.assessmentCriteria) {
                const gap = this.checkCriterion(categoryId, criterion, vulnerabilities);
                if (gap) {
                    gaps.push(gap);
                }
            }
        }

        return gaps;
    }

    /**
     * Check specific criterion for gaps
     */
    checkCriterion(categoryId, criterion, vulnerabilities) {
        // Map criterion to actual vulnerability data
        const criterionChecks = {
            'Input validation strength': () => {
                if (vulnerabilities.promptInjection?.rate > 10) {
                    return {
                        criterion,
                        issue: 'Weak input validation',
                        severity: 'HIGH'
                    };
                }
            },
            'PII detection and filtering': () => {
                if (vulnerabilities.dataLeakage?.piiLeakage > 0) {
                    return {
                        criterion,
                        issue: 'PII leakage detected',
                        severity: 'CRITICAL'
                    };
                }
            },
            'Rate limiting implementation': () => {
                if (!vulnerabilities.denialOfService?.rateLimiting) {
                    return {
                        criterion,
                        issue: 'No rate limiting detected',
                        severity: 'MEDIUM'
                    };
                }
            }
        };

        const check = criterionChecks[criterion];
        return check ? check() : null;
    }

    /**
     * Get remediation recommendations for a category
     */
    getRemediations(categoryId, score) {
        if (score >= this.complianceThresholds.high) {
            return []; // No remediations needed for high scores
        }

        const remediations = {
            'LLM01': [
                {
                    action: 'Implement multi-layer input validation',
                    priority: 'HIGH',
                    effort: 'Medium',
                    impact: 'High'
                },
                {
                    action: 'Deploy instruction hierarchy system',
                    priority: 'HIGH',
                    effort: 'Low',
                    impact: 'High'
                },
                {
                    action: 'Add context isolation mechanisms',
                    priority: 'MEDIUM',
                    effort: 'High',
                    impact: 'Medium'
                }
            ],
            'LLM02': [
                {
                    action: 'Implement comprehensive output sanitization',
                    priority: 'HIGH',
                    effort: 'Medium',
                    impact: 'High'
                },
                {
                    action: 'Add content security policy (CSP)',
                    priority: 'MEDIUM',
                    effort: 'Low',
                    impact: 'Medium'
                }
            ],
            'LLM03': [
                {
                    action: 'Implement data source verification',
                    priority: 'HIGH',
                    effort: 'Medium',
                    impact: 'High'
                },
                {
                    action: 'Deploy poisoning detection systems',
                    priority: 'MEDIUM',
                    effort: 'High',
                    impact: 'Medium'
                }
            ],
            'LLM04': [
                {
                    action: 'Implement adaptive rate limiting',
                    priority: 'HIGH',
                    effort: 'Low',
                    impact: 'High'
                },
                {
                    action: 'Add query complexity analysis',
                    priority: 'MEDIUM',
                    effort: 'Medium',
                    impact: 'Medium'
                }
            ],
            'LLM05': [
                {
                    action: 'Implement dependency scanning',
                    priority: 'HIGH',
                    effort: 'Low',
                    impact: 'High'
                },
                {
                    action: 'Establish vendor assessment process',
                    priority: 'MEDIUM',
                    effort: 'Medium',
                    impact: 'Medium'
                }
            ],
            'LLM06': [
                {
                    action: 'Deploy PII detection and redaction',
                    priority: 'CRITICAL',
                    effort: 'Medium',
                    impact: 'Very High'
                },
                {
                    action: 'Implement data classification system',
                    priority: 'HIGH',
                    effort: 'High',
                    impact: 'High'
                }
            ],
            'LLM07': [
                {
                    action: 'Implement plugin sandboxing',
                    priority: 'HIGH',
                    effort: 'High',
                    impact: 'High'
                },
                {
                    action: 'Add granular permission controls',
                    priority: 'MEDIUM',
                    effort: 'Medium',
                    impact: 'Medium'
                }
            ],
            'LLM08': [
                {
                    action: 'Implement least privilege access',
                    priority: 'HIGH',
                    effort: 'Medium',
                    impact: 'High'
                },
                {
                    action: 'Add human approval workflows',
                    priority: 'HIGH',
                    effort: 'Medium',
                    impact: 'High'
                }
            ],
            'LLM09': [
                {
                    action: 'Implement human-in-the-loop controls',
                    priority: 'MEDIUM',
                    effort: 'Medium',
                    impact: 'Medium'
                },
                {
                    action: 'Add confidence scoring system',
                    priority: 'LOW',
                    effort: 'Low',
                    impact: 'Low'
                }
            ],
            'LLM10': [
                {
                    action: 'Implement query pattern monitoring',
                    priority: 'HIGH',
                    effort: 'Medium',
                    impact: 'High'
                },
                {
                    action: 'Add model watermarking',
                    priority: 'MEDIUM',
                    effort: 'High',
                    impact: 'Medium'
                }
            ]
        };

        return remediations[categoryId] || [];
    }

    /**
     * Identify critical gaps across all categories
     */
    identifyCriticalGaps(assessment) {
        const criticalGaps = [];

        for (const [categoryId, results] of Object.entries(assessment)) {
            if (results.score < this.complianceThresholds.medium) {
                criticalGaps.push({
                    category: categoryId,
                    name: results.name,
                    score: results.score,
                    severity: 'CRITICAL',
                    gaps: results.gaps
                });
            }
        }

        return criticalGaps.sort((a, b) => a.score - b.score);
    }

    /**
     * Prioritize remediations across all categories
     */
    prioritizeRemediations(assessment) {
        const allRemediations = [];

        for (const [categoryId, results] of Object.entries(assessment)) {
            for (const remediation of results.remediations) {
                allRemediations.push({
                    category: categoryId,
                    categoryName: results.name,
                    ...remediation
                });
            }
        }

        // Sort by priority and impact
        const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        const impactOrder = { 'Very High': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

        return allRemediations.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;

            return impactOrder[a.impact] - impactOrder[b.impact];
        });
    }

    /**
     * Calculate overall maturity level
     */
    calculateMaturityLevel(score) {
        if (score >= 95) return 'Optimized';
        if (score >= 85) return 'Managed';
        if (score >= 70) return 'Defined';
        if (score >= 50) return 'Developing';
        return 'Initial';
    }

    /**
     * Get specific remediation for an OWASP item
     */
    getRemediation(item) {
        const remediations = this.getRemediations(item, 0); // Get all remediations
        if (remediations.length > 0) {
            return remediations[0].action; // Return highest priority action
        }
        return `Improve ${this.owaspCategories[item]?.name || item} security controls`;
    }

    /**
     * Generate executive summary
     */
    generateExecutiveSummary(assessment) {
        return {
            overallCompliance: `${assessment.overallScore}%`,
            maturityLevel: assessment.maturityLevel,
            criticalFindings: assessment.criticalGaps.length,
            topRisks: assessment.criticalGaps.slice(0, 3).map(g => g.name),
            immediateActions: assessment.prioritizedActions.slice(0, 5).map(a => a.action),
            estimatedRemediationEffort: this.estimateEffort(assessment.prioritizedActions)
        };
    }

    /**
     * Estimate total remediation effort
     */
    estimateEffort(actions) {
        const effortPoints = { 'Low': 1, 'Medium': 3, 'High': 5 };
        const totalPoints = actions.reduce((sum, action) =>
            sum + (effortPoints[action.effort] || 0), 0);

        if (totalPoints < 10) return 'Low (1-2 weeks)';
        if (totalPoints < 25) return 'Medium (2-4 weeks)';
        if (totalPoints < 50) return 'High (1-2 months)';
        return 'Very High (2+ months)';
    }
}

module.exports = OWASPMapper;