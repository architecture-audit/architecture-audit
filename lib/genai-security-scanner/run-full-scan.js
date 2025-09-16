#!/usr/bin/env node

/**
 * Full scanner demonstration - runs all security tests
 */

const GenAISecurityScanner = require('./index');
const chalk = require('chalk');

async function runFullScan() {
    console.log(chalk.blue.bold('\n═══════════════════════════════════════════════════'));
    console.log(chalk.blue.bold('    GenAI Security Scanner - Full System Scan'));
    console.log(chalk.blue.bold('═══════════════════════════════════════════════════\n'));

    try {
        // Create scanner with comprehensive config
        const scanner = new GenAISecurityScanner({
            mode: 'comprehensive',
            verbose: true,
            provider: 'openai',  // Will use mock if no API key
            systemProfile: {
                industry: 'financial',
                dataClassification: 'pii',
                userBase: 50000,
                publicFacing: true
            }
        });

        console.log(chalk.green('✅ Scanner initialized\n'));

        // Run full security scan
        console.log(chalk.yellow('Starting comprehensive security scan...\n'));
        const results = await scanner.scan();

        // Display results
        console.log(chalk.blue.bold('\n╔══════════════════════════════════════════════════╗'));
        console.log(chalk.blue.bold('║            SECURITY SCAN RESULTS                 ║'));
        console.log(chalk.blue.bold('╚══════════════════════════════════════════════════╝\n'));

        // Overall risk score
        const riskLevel = results.riskScore >= 75 ? chalk.red('CRITICAL') :
                         results.riskScore >= 50 ? chalk.yellow('HIGH') :
                         results.riskScore >= 25 ? chalk.cyan('MEDIUM') :
                         chalk.green('LOW');

        console.log(chalk.bold('Overall Risk Score: ') + riskLevel + ` (${results.riskScore.toFixed(1)}%)`);
        console.log(chalk.bold('Confidence: ') + `${results.confidence}%`);
        console.log(chalk.bold('Model Type: ') + (results.fingerprint?.modelType || 'Unknown'));
        console.log(chalk.bold('Scan Duration: ') + `${results.scanDuration}ms\n`);

        // Vulnerability breakdown
        console.log(chalk.yellow.bold('Vulnerability Detection Results:'));
        console.log(chalk.gray('─'.repeat(50)));

        const vulnResults = results.vulnerabilities || {};
        const vulnNames = {
            promptInjection: 'Prompt Injection',
            jailbreak: 'Jailbreak Attempts',
            dataLeakage: 'Data Leakage',
            modelExtraction: 'Model Extraction',
            adversarialInputs: 'Adversarial Inputs',
            biasDetection: 'Bias & Fairness',
            outputManipulation: 'Output Manipulation',
            behavioralAnomaly: 'Behavioral Anomalies'
        };

        for (const [key, name] of Object.entries(vulnNames)) {
            const vuln = vulnResults[key];
            if (vuln) {
                const severity = vuln.rate >= 50 ? chalk.red('●') :
                               vuln.rate >= 25 ? chalk.yellow('●') :
                               vuln.rate >= 10 ? chalk.cyan('●') :
                               chalk.green('●');

                console.log(`${severity} ${name.padEnd(25)} ${vuln.rate.toFixed(1)}% (confidence: ${vuln.confidence || 0}%)`);

                if (vuln.details) {
                    console.log(chalk.gray(`  └─ ${vuln.details}`));
                }
            }
        }

        // Threat Intelligence
        if (results.analysis?.threatIntelligence) {
            console.log(chalk.yellow.bold('\nThreat Intelligence:'));
            console.log(chalk.gray('─'.repeat(50)));
            const ti = results.analysis.threatIntelligence;
            console.log(`Current Threat Level: ${ti.currentThreatLevel}`);
            if (ti.activeCampaigns?.length > 0) {
                console.log(`Active Campaigns: ${ti.activeCampaigns.join(', ')}`);
            }
            if (ti.emergingThreats?.length > 0) {
                console.log(`Emerging Threats: ${ti.emergingThreats.map(t => t.name).join(', ')}`);
            }
        }

        // Top recommendations
        if (results.analysis?.mitigationPriorities) {
            console.log(chalk.yellow.bold('\nTop Security Recommendations:'));
            console.log(chalk.gray('─'.repeat(50)));

            const priorities = results.analysis.mitigationPriorities.slice(0, 5);
            priorities.forEach((item, i) => {
                const icon = item.priority === 'critical' ? chalk.red('🔴') :
                           item.priority === 'high' ? chalk.yellow('🟡') :
                           chalk.blue('🔵');
                console.log(`${icon} ${i + 1}. ${item.vulnerability}: ${item.mitigation}`);
            });
        }

        // OWASP LLM Top 10 Coverage
        console.log(chalk.yellow.bold('\nOWASP LLM Top 10 Coverage:'));
        console.log(chalk.gray('─'.repeat(50)));
        const owaspCoverage = {
            'LLM01': 'Prompt Injection',
            'LLM02': 'Insecure Output Handling',
            'LLM03': 'Training Data Poisoning',
            'LLM04': 'Model Denial of Service',
            'LLM05': 'Supply Chain Vulnerabilities',
            'LLM06': 'Sensitive Information Disclosure',
            'LLM07': 'Insecure Plugin Design',
            'LLM08': 'Excessive Agency',
            'LLM09': 'Overreliance',
            'LLM10': 'Model Theft'
        };

        const tested = ['LLM01', 'LLM02', 'LLM06', 'LLM10'];
        for (const [id, name] of Object.entries(owaspCoverage)) {
            const status = tested.includes(id) ? chalk.green('✓ Tested') : chalk.gray('○ Not tested');
            console.log(`${status} ${id}: ${name}`);
        }

        // Export options
        console.log(chalk.blue.bold('\n╔══════════════════════════════════════════════════╗'));
        console.log(chalk.blue.bold('║            EXPORT & REPORTING                    ║'));
        console.log(chalk.blue.bold('╚══════════════════════════════════════════════════╝\n'));

        // Save results to file
        const fs = require('fs');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = `./scan-report-${timestamp}.json`;

        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(chalk.green(`✅ Full report saved to: ${reportPath}`));

        // Generate summary
        const summary = {
            timestamp: new Date().toISOString(),
            riskScore: results.riskScore,
            criticalFindings: Object.entries(vulnResults)
                .filter(([_, v]) => v.rate >= 50)
                .map(([k, v]) => ({ type: k, severity: v.rate })),
            recommendations: results.analysis?.mitigationPriorities?.slice(0, 3) || []
        };

        const summaryPath = `./scan-summary-${timestamp}.json`;
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log(chalk.green(`✅ Summary saved to: ${summaryPath}`));

        console.log(chalk.blue.bold('\n═══════════════════════════════════════════════════'));
        console.log(chalk.green.bold('       Security Scan Complete!'));
        console.log(chalk.blue.bold('═══════════════════════════════════════════════════\n'));

    } catch (error) {
        console.error(chalk.red('\n❌ Scan failed:'), error.message);
        console.error(chalk.gray('Stack trace:'), error.stack);
        process.exit(1);
    }
}

// Run the scan
runFullScan();