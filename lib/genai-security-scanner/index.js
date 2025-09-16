/**
 * GenAI Security Scanner - Main Entry Point
 * Automatically detects and measures security parameters for any LLM system
 */

const ScannerCore = require('./core/scanner');
const SecurityAnalyzer = require('./core/security-analyzer');
const OWASPMapper = require('./owasp/mapper');
const BlueTeamMonitor = require('./blueteam/monitor');
const ReportGenerator = require('./reports/generator');

class GenAISecurityScanner {
    constructor(config = {}) {
        this.config = {
            target: config.target || null,
            apiKey: config.apiKey || process.env.LLM_API_KEY,
            mode: config.mode || 'comprehensive', // quick, standard, comprehensive
            parallel: config.parallel !== false,
            timeout: config.timeout || 30000,
            verbose: config.verbose || false,
            realtime: config.realtime || false,
            outputFormat: config.outputFormat || 'json', // json, html, pdf
            customTests: config.customTests || [],
            autoDetect: config.autoDetect !== false // Auto-detect LLM type and params
        };

        this.scanner = new ScannerCore(this.config);
        this.analyzer = new SecurityAnalyzer();
        this.owaspMapper = new OWASPMapper();
        this.monitor = config.realtime ? new BlueTeamMonitor(this.config) : null;
        this.reportGenerator = new ReportGenerator();

        this.results = {
            timestamp: new Date().toISOString(),
            target: this.config.target,
            status: 'initialized',
            findings: {},
            metrics: {},
            compliance: {},
            recommendations: []
        };
    }

    /**
     * Run comprehensive security scan
     * Automatically discovers and measures all security parameters
     */
    async scan() {
        console.log('🔍 Starting GenAI Security Scan...');
        this.results.status = 'scanning';

        try {
            // Phase 1: System Fingerprinting
            console.log('📋 Phase 1: System Fingerprinting');
            const systemInfo = await this.scanner.fingerprint();
            this.results.systemInfo = systemInfo;

            // Phase 2: Automated Parameter Discovery
            console.log('🔎 Phase 2: Parameter Discovery');
            const parameters = await this.discoverSecurityParameters();
            this.results.discoveredParameters = parameters;

            // Phase 3: Vulnerability Testing
            console.log('🛡️ Phase 3: Vulnerability Testing');
            const vulnerabilities = await this.testVulnerabilities();
            this.results.vulnerabilities = vulnerabilities;

            // Phase 4: OWASP LLM Top 10 Mapping
            console.log('📊 Phase 4: OWASP Compliance Check');
            const owaspCompliance = await this.owaspMapper.assess(vulnerabilities);
            this.results.compliance.owasp = owaspCompliance;

            // Phase 5: Risk Analysis
            console.log('⚠️ Phase 5: Risk Analysis');
            const riskProfile = await this.analyzer.calculateRisk(vulnerabilities);
            this.results.riskProfile = riskProfile;

            // Phase 6: Generate Recommendations
            console.log('💡 Phase 6: Generating Recommendations');
            this.results.recommendations = await this.generateRecommendations();

            this.results.status = 'completed';
            this.results.completedAt = new Date().toISOString();

            return this.results;

        } catch (error) {
            this.results.status = 'error';
            this.results.error = error.message;
            throw error;
        }
    }

    /**
     * Discover security parameters automatically
     */
    async discoverSecurityParameters() {
        const parameters = {
            promptSecurity: {
                injectionRate: null,
                jailbreakResistance: null,
                contextIsolation: null,
                instructionHierarchy: null
            },
            dataPrivacy: {
                piiLeakage: null,
                memorization: null,
                dataRetention: null,
                consentMechanism: null
            },
            modelSecurity: {
                extractionResistance: null,
                weightProtection: null,
                accessControl: null,
                versionControl: null
            },
            outputSafety: {
                hallucinationRate: null,
                factualAccuracy: null,
                toxicityScore: null,
                biasDetection: null
            },
            operationalSecurity: {
                rateLimit: null,
                authenticationStrength: null,
                loggingCapability: null,
                incidentResponse: null
            },
            ethicalAI: {
                fairnessMetrics: null,
                transparencyLevel: null,
                explainability: null,
                humanOversight: null
            },
            supplyChain: {
                modelProvenance: null,
                dependencyVulnerabilities: null,
                dataSourceValidation: null,
                updateManagement: null
            }
        };

        // Automatically test and measure each parameter
        for (const category in parameters) {
            console.log(`  Testing ${category}...`);
            for (const param in parameters[category]) {
                parameters[category][param] = await this.scanner.measureParameter(category, param);
            }
        }

        return parameters;
    }

    /**
     * Test for specific vulnerabilities
     */
    async testVulnerabilities() {
        const tests = {
            promptInjection: await this.scanner.testPromptInjection(),
            jailbreak: await this.scanner.testJailbreak(),
            dataLeakage: await this.scanner.testDataLeakage(),
            modelExtraction: await this.scanner.testModelExtraction(),
            hallucination: await this.scanner.testHallucination(),
            bias: await this.scanner.testBias(),
            denialOfService: await this.scanner.testDoS(),
            supplyChain: await this.scanner.testSupplyChain()
        };

        return tests;
    }

    /**
     * Generate actionable recommendations
     */
    async generateRecommendations() {
        const recommendations = [];
        const { vulnerabilities, riskProfile, compliance } = this.results;

        // Critical vulnerabilities
        if (vulnerabilities.promptInjection.rate > 10) {
            recommendations.push({
                severity: 'CRITICAL',
                category: 'Prompt Security',
                issue: `High prompt injection success rate: ${vulnerabilities.promptInjection.rate}%`,
                recommendation: 'Implement multi-layer input validation and instruction hierarchy',
                effort: 'Medium',
                impact: 'High'
            });
        }

        // OWASP compliance gaps
        for (const [item, score] of Object.entries(compliance.owasp)) {
            if (score < 70) {
                recommendations.push({
                    severity: 'HIGH',
                    category: 'OWASP Compliance',
                    issue: `${item} compliance: ${score}%`,
                    recommendation: this.owaspMapper.getRemediation(item),
                    effort: 'Variable',
                    impact: 'High'
                });
            }
        }

        return recommendations.sort((a, b) =>
            this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity)
        );
    }

    /**
     * Start real-time monitoring
     */
    startMonitoring(callback) {
        if (!this.monitor) {
            this.monitor = new BlueTeamMonitor(this.config);
        }

        this.monitor.on('threat', (threat) => {
            console.log(`🚨 Threat Detected: ${threat.type}`);
            if (callback) callback(threat);
        });

        this.monitor.start();
        console.log('👁️ Real-time monitoring started');
    }

    /**
     * Generate report in specified format
     */
    async generateReport(format = 'json') {
        return this.reportGenerator.generate(this.results, format);
    }

    /**
     * Get severity score for sorting
     */
    getSeverityScore(severity) {
        const scores = {
            'CRITICAL': 4,
            'HIGH': 3,
            'MEDIUM': 2,
            'LOW': 1,
            'INFO': 0
        };
        return scores[severity] || 0;
    }
}

module.exports = GenAISecurityScanner;