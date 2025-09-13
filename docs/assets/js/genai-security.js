// GenAI Security Framework Calculator
// Comprehensive security assessment for Generative AI systems

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeGenAISecurity();
    setupEventListeners();
    loadSavedData();
    calculateAllScores();
    
    // Initialize auto-save
    function initAutoSave() {
        if (window.AutoSave) {
            window.autoSave = new AutoSave('genai-security', 15000);
            console.log("✅ Auto-save initialized for genai-security");
            return true;
        }
        return false;
    }
    
    if (!initAutoSave()) {
        // Try again after delay for bundle to load
        setTimeout(() => {
            if (!initAutoSave()) {
                // Try one more time
                setTimeout(() => {
                    if (!initAutoSave()) {
                        console.log("⚠️ AutoSave not available for genai-security");
                    }
                }, 1000);
            }
        }, 500);
    }
});

// Global state
let genaiSecurityData = {
    promptSecurity: {},
    modelSecurity: {},
    dataPrivacy: {},
    hallucination: {},
    ethicalAI: {},
    governance: {},
    supplyChain: {},
    incidentResponse: {},
    owaspLLM: {},
    aiBlueTeam: {},
    overallScore: 0,
    recommendations: []
};

// Initialize the framework
function initializeGenAISecurity() {
    console.log('🛡️ GenAI Security Framework initialized');
    
    // Set initial values if needed
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked === undefined) {
            checkbox.checked = false;
        }
    });
    
    // Initialize tooltips
    initializeTooltips();
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Auto-calculate on input change
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('change', function() {
            calculateAllScores();
            autoSave();
        });
    });
}

// Tab switching
function switchTab(tabId) {
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// Calculate Prompt Security Score
function calculatePromptSecurity() {
    let score = 0;
    let factors = 0;
    
    // Sanitization level
    const sanitization = parseInt(document.getElementById('prompt-sanitization').value);
    score += sanitization * 0.2;
    factors++;
    
    // Injection detection rate
    const detection = parseInt(document.getElementById('injection-detection').value);
    score += detection * 0.25;
    factors++;
    
    // Context protection
    const context = parseInt(document.getElementById('context-protection').value);
    score += context * 0.15;
    factors++;
    
    // Defense mechanisms (checkboxes)
    const defenses = document.querySelectorAll('#prompt-security .checkbox-group input:checked').length;
    const totalDefenses = document.querySelectorAll('#prompt-security .checkbox-group input').length;
    score += (defenses / totalDefenses) * 100 * 0.2;
    factors++;
    
    // Update frequency
    const updates = parseInt(document.getElementById('defense-updates').value);
    score += updates * 0.1;
    factors++;
    
    // Response time
    const responseTime = parseInt(document.getElementById('response-time').value);
    const responseScore = Math.max(0, 100 - (responseTime * 5));
    score += responseScore * 0.1;
    factors++;
    
    // Calculate final score
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('prompt-security-score').textContent = finalScore + '%';
    document.getElementById('prompt-security-score').className = getScoreClass(finalScore);
    
    // Update risk level
    let riskLevel = 'Critical';
    if (finalScore >= 80) riskLevel = 'Low';
    else if (finalScore >= 60) riskLevel = 'Medium';
    else if (finalScore >= 40) riskLevel = 'High';
    
    document.getElementById('prompt-risk-level').textContent = riskLevel;
    document.getElementById('prompt-risk-level').className = 'score-value ' + getRiskClass(riskLevel);
    
    // Update compliance
    let compliance = 'Non-Compliant';
    if (finalScore >= 75) compliance = 'Compliant';
    else if (finalScore >= 50) compliance = 'Partial';
    
    document.getElementById('prompt-compliance').textContent = compliance;
    
    genaiSecurityData.promptSecurity = { score: finalScore, risk: riskLevel, compliance };
    return finalScore;
}

// Calculate Model Security Score
function calculateModelSecurity() {
    let score = 0;
    
    // Weight encryption
    score += parseInt(document.getElementById('weight-encryption').value) * 0.15;
    
    // Access control
    score += parseInt(document.getElementById('model-access-control').value) * 0.2;
    
    // Model versioning
    score += parseInt(document.getElementById('model-versioning').value) * 0.1;
    
    // Anti-extraction measures
    const extractionMeasures = document.querySelectorAll('#model-security .checkbox-group input:checked').length;
    score += (extractionMeasures / 5) * 100 * 0.2;
    
    // API security
    score += parseInt(document.getElementById('api-security').value) * 0.15;
    
    // Model verification
    score += parseInt(document.getElementById('model-verification').value) * 0.1;
    
    // Dependency scanning
    score += parseInt(document.getElementById('dependency-scanning').value) * 0.1;
    
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('model-security-score').textContent = finalScore + '%';
    document.getElementById('model-security-score').className = getScoreClass(finalScore);
    
    // Vulnerability count (simulated based on score)
    const vulns = Math.max(0, Math.round((100 - finalScore) / 10));
    document.getElementById('model-vulnerabilities').textContent = vulns;
    document.getElementById('model-vulnerabilities').className = vulns > 5 ? 'score-value critical' : 'score-value';
    
    // Protection level
    let protection = 'Weak';
    if (finalScore >= 80) protection = 'Strong';
    else if (finalScore >= 60) protection = 'Moderate';
    
    document.getElementById('model-protection').textContent = protection;
    
    genaiSecurityData.modelSecurity = { score: finalScore, vulnerabilities: vulns, protection };
    return finalScore;
}

// Calculate Data Privacy Score
function calculateDataPrivacy() {
    let score = 0;
    
    // PII detection methods
    const piiMethods = document.querySelectorAll('#data-privacy .checkbox-group input:checked').length;
    score += (piiMethods / 8) * 100 * 0.2;
    
    // Redaction strategy
    score += parseInt(document.getElementById('redaction-strategy').value) * 0.15;
    
    // Retention policy
    const retentionDays = parseInt(document.getElementById('retention-days').value);
    const retentionScore = retentionDays <= 90 ? 100 : Math.max(0, 100 - ((retentionDays - 90) / 10));
    score += retentionScore * 0.1;
    
    // Consent mechanisms
    const consentChecks = document.querySelectorAll('#data-privacy .checkbox-group input:checked').length;
    score += (consentChecks / 11) * 100 * 0.2;
    
    // Audit frequency
    score += parseInt(document.getElementById('privacy-audit').value) * 0.15;
    
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('privacy-score').textContent = finalScore + '%';
    document.getElementById('privacy-score').className = getScoreClass(finalScore);
    
    // Compliance level
    let compliance = 'Non-Compliant';
    if (finalScore >= 85) compliance = 'Full';
    else if (finalScore >= 60) compliance = 'Partial';
    
    document.getElementById('privacy-compliance').textContent = compliance;
    
    // PII risk
    let risk = 'High';
    if (finalScore >= 80) risk = 'Low';
    else if (finalScore >= 60) risk = 'Medium';
    
    document.getElementById('pii-risk').textContent = risk;
    document.getElementById('pii-risk').className = 'score-value ' + getRiskClass(risk);
    
    genaiSecurityData.dataPrivacy = { score: finalScore, compliance, risk };
    return finalScore;
}

// Calculate Hallucination Control Score
function calculateHallucination() {
    let score = 0;
    
    // Detection methods
    const detectionMethods = document.querySelectorAll('#hallucination .checkbox-group input:checked').length;
    score += (detectionMethods / 9) * 100 * 0.25;
    
    // Detection accuracy
    const accuracy = parseInt(document.getElementById('detection-accuracy').value);
    score += accuracy * 0.2;
    
    // Temperature control
    score += parseInt(document.getElementById('temperature-control').value) * 0.1;
    
    // Validation process
    score += parseInt(document.getElementById('validation-process').value) * 0.2;
    
    // Feedback loop
    score += parseInt(document.getElementById('feedback-loop').value) * 0.15;
    
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('accuracy-score').textContent = finalScore + '%';
    document.getElementById('accuracy-score').className = getScoreClass(finalScore);
    
    // Hallucination rate (inverse of score)
    const hallucinationRate = Math.max(5, 100 - finalScore);
    document.getElementById('hallucination-rate').textContent = hallucinationRate + '%';
    document.getElementById('hallucination-rate').className = hallucinationRate > 30 ? 'score-value critical' : 'score-value';
    
    // Confidence level
    let confidence = 'Low';
    if (finalScore >= 80) confidence = 'High';
    else if (finalScore >= 60) confidence = 'Medium';
    
    document.getElementById('confidence-level').textContent = confidence;
    
    genaiSecurityData.hallucination = { score: finalScore, rate: hallucinationRate, confidence };
    return finalScore;
}

// Calculate Ethical AI Score
function calculateEthicalAI() {
    let score = 0;
    
    // Bias testing methods
    const biasMethods = document.querySelectorAll('#ethical-ai .checkbox-group input:checked').length;
    score += (biasMethods / 11) * 100 * 0.25;
    
    // Testing frequency
    score += parseInt(document.getElementById('bias-testing-freq').value) * 0.15;
    
    // Documentation level
    score += parseInt(document.getElementById('documentation-level').value) * 0.15;
    
    // Ethics review
    score += parseInt(document.getElementById('ethics-review').value) * 0.2;
    
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('ethics-score').textContent = finalScore + '%';
    document.getElementById('ethics-score').className = getScoreClass(finalScore);
    
    // Bias risk
    let biasRisk = 'High';
    if (finalScore >= 80) biasRisk = 'Low';
    else if (finalScore >= 60) biasRisk = 'Medium';
    
    document.getElementById('bias-risk').textContent = biasRisk;
    document.getElementById('bias-risk').className = 'score-value ' + getRiskClass(biasRisk);
    
    // Transparency level
    let transparency = 'Low';
    if (finalScore >= 75) transparency = 'High';
    else if (finalScore >= 50) transparency = 'Medium';
    
    document.getElementById('transparency-level').textContent = transparency;
    
    genaiSecurityData.ethicalAI = { score: finalScore, biasRisk, transparency };
    return finalScore;
}

// Calculate Governance Score
function calculateGovernance() {
    let score = 0;
    
    // Governance components
    const components = document.querySelectorAll('#governance .checkbox-group input:checked').length;
    score += (components / 9) * 100 * 0.25;
    
    // Policy maturity
    score += parseInt(document.getElementById('policy-maturity').value) * 0.2;
    
    // Compliance monitoring
    score += parseInt(document.getElementById('compliance-monitoring').value) * 0.15;
    
    // Risk assessment frequency
    score += parseInt(document.getElementById('risk-assessment-freq').value) * 0.2;
    
    // Risk register
    score += parseInt(document.getElementById('risk-register').value) * 0.2;
    
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('governance-score').textContent = finalScore + '%';
    document.getElementById('governance-score').className = getScoreClass(finalScore);
    
    // Compliance status
    let compliance = 'Non-Compliant';
    if (finalScore >= 75) compliance = 'Compliant';
    else if (finalScore >= 50) compliance = 'Partial';
    
    document.getElementById('governance-compliance').textContent = compliance;
    
    // Maturity level
    let maturity = 'Initial';
    if (finalScore >= 80) maturity = 'Advanced';
    else if (finalScore >= 60) maturity = 'Defined';
    else if (finalScore >= 40) maturity = 'Developing';
    
    document.getElementById('governance-maturity').textContent = maturity;
    
    genaiSecurityData.governance = { score: finalScore, compliance, maturity };
    return finalScore;
}

// Calculate Supply Chain Score
function calculateSupplyChain() {
    let score = 0;
    
    // Model provenance
    const provenance = document.querySelectorAll('#supply-chain .checkbox-group input:checked').length;
    score += (provenance / 4) * 100 * 0.2;
    
    // Update management
    score += parseInt(document.getElementById('update-management').value) * 0.15;
    
    // Data validation
    score += parseInt(document.getElementById('data-validation').value) * 0.2;
    
    // Poisoning detection
    score += parseInt(document.getElementById('poisoning-detection').value) * 0.15;
    
    // Vulnerability scanning
    score += parseInt(document.getElementById('vuln-scanning').value) * 0.15;
    
    // License compliance
    score += parseInt(document.getElementById('license-compliance').value) * 0.15;
    
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('supply-chain-score').textContent = finalScore + '%';
    document.getElementById('supply-chain-score').className = getScoreClass(finalScore);
    
    // Risk exposure
    let risk = 'High';
    if (finalScore >= 80) risk = 'Low';
    else if (finalScore >= 60) risk = 'Medium';
    
    document.getElementById('supply-risk').textContent = risk;
    document.getElementById('supply-risk').className = 'score-value ' + getRiskClass(risk);
    
    // Integrity level
    let integrity = 'Low';
    if (finalScore >= 75) integrity = 'High';
    else if (finalScore >= 50) integrity = 'Medium';
    
    document.getElementById('integrity-level').textContent = integrity;
    
    genaiSecurityData.supplyChain = { score: finalScore, risk, integrity };
    return finalScore;
}

// Calculate Incident Response Score
function calculateIncidentResponse() {
    let score = 0;
    
    // Response plan components
    const components = document.querySelectorAll('#incident-response .checkbox-group input:checked').length;
    score += (components / 12) * 100 * 0.25;
    
    // Training frequency
    score += parseInt(document.getElementById('training-frequency').value) * 0.15;
    
    // Response time
    score += parseInt(document.getElementById('response-time-avg').value) * 0.2;
    
    // Post-incident review
    score += parseInt(document.getElementById('post-incident').value) * 0.2;
    
    const finalScore = Math.round(score);
    
    // Update display
    document.getElementById('readiness-score').textContent = finalScore + '%';
    document.getElementById('readiness-score').className = getScoreClass(finalScore);
    
    // Response capability
    let capability = 'Weak';
    if (finalScore >= 80) capability = 'Strong';
    else if (finalScore >= 60) capability = 'Moderate';
    
    document.getElementById('response-capability').textContent = capability;
    
    // Recovery time
    let recovery = '> 24 hrs';
    if (finalScore >= 80) recovery = '< 2 hrs';
    else if (finalScore >= 60) recovery = '< 8 hrs';
    else if (finalScore >= 40) recovery = '< 24 hrs';
    
    document.getElementById('recovery-time').textContent = recovery;
    
    genaiSecurityData.incidentResponse = { score: finalScore, capability, recovery };
    return finalScore;
}

// Calculate OWASP LLM Top 10 Score
function calculateOWASPLLM() {
    let score = 0;
    let count = 0;
    
    const owaspFields = [
        'owasp-llm01', 'owasp-llm02', 'owasp-llm03', 'owasp-llm04',
        'owasp-llm05', 'owasp-llm06', 'owasp-llm07', 'owasp-llm08',
        'owasp-llm09', 'owasp-llm10'
    ];
    
    owaspFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
            score += parseInt(element.value);
            count++;
        }
    });
    
    const finalScore = count > 0 ? Math.round(score / count) : 0;
    genaiSecurityData.owaspLLM = { score: finalScore };
    return finalScore;
}

// Calculate AI Blue Team Score
function calculateAIBlueTeam() {
    let score = 0;
    let count = 0;
    
    const blueFields = [
        'ai-perf-monitoring', 'ai-drift-detection', 'ai-data-quality',
        'ai-adversarial-detection', 'ai-evasion-protection', 'ai-red-team',
        'ai-incident-response', 'ai-model-forensics', 'ai-threat-intel',
        'ai-recovery-time'
    ];
    
    blueFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
            score += parseInt(element.value);
            count++;
        }
    });
    
    const finalScore = count > 0 ? Math.round(score / count) : 0;
    genaiSecurityData.aiBlueTeam = { score: finalScore };
    return finalScore;
}

// Calculate all scores
function calculateAllScores() {
    const scores = {
        prompt: calculatePromptSecurity(),
        model: calculateModelSecurity(),
        privacy: calculateDataPrivacy(),
        hallucination: calculateHallucination(),
        ethical: calculateEthicalAI(),
        governance: calculateGovernance(),
        supply: calculateSupplyChain(),
        incident: calculateIncidentResponse(),
        owaspLLM: calculateOWASPLLM(),
        aiBlueTeam: calculateAIBlueTeam()
    };
    
    // Calculate overall score
    const overallScore = Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );
    
    genaiSecurityData.overallScore = overallScore;
    
    // Update summary
    updateSummary(scores, overallScore);
    
    // Generate recommendations
    generateRecommendations(scores);
    
    return overallScore;
}

// Update summary section
function updateSummary(scores, overallScore) {
    // Update overall score
    document.getElementById('overall-score').textContent = overallScore + '%';
    
    // Update individual scores
    document.getElementById('summary-prompt').textContent = scores.prompt + '%';
    document.getElementById('summary-model').textContent = scores.model + '%';
    document.getElementById('summary-privacy').textContent = scores.privacy + '%';
    document.getElementById('summary-hallucination').textContent = scores.hallucination + '%';
    document.getElementById('summary-ethical').textContent = scores.ethical + '%';
    document.getElementById('summary-governance').textContent = scores.governance + '%';
    document.getElementById('summary-supply').textContent = scores.supply + '%';
    document.getElementById('summary-incident').textContent = scores.incident + '%';
    
    // Calculate risk distribution
    let critical = 0, high = 0, medium = 0, low = 0;
    
    Object.values(scores).forEach(score => {
        if (score < 40) critical++;
        else if (score < 60) high++;
        else if (score < 80) medium++;
        else low++;
    });
    
    document.getElementById('critical-risks').textContent = critical;
    document.getElementById('high-risks').textContent = high;
    document.getElementById('medium-risks').textContent = medium;
    document.getElementById('low-risks').textContent = low;
}

// Generate recommendations
function generateRecommendations(scores) {
    const recommendations = [];
    
    // Check each area and add recommendations
    if (scores.prompt < 60) {
        recommendations.push({
            priority: 'critical',
            text: 'Implement advanced prompt injection defenses and jailbreak prevention mechanisms'
        });
    }
    
    if (scores.model < 60) {
        recommendations.push({
            priority: 'critical',
            text: 'Enhance model security with encryption, access controls, and extraction defenses'
        });
    }
    
    if (scores.privacy < 70) {
        recommendations.push({
            priority: 'high',
            text: 'Strengthen PII detection and implement comprehensive data privacy controls'
        });
    }
    
    if (scores.hallucination < 70) {
        recommendations.push({
            priority: 'high',
            text: 'Deploy hallucination detection and mitigation strategies including RAG'
        });
    }
    
    if (scores.ethical < 60) {
        recommendations.push({
            priority: 'high',
            text: 'Establish ethical AI guidelines and bias detection frameworks'
        });
    }
    
    if (scores.governance < 70) {
        recommendations.push({
            priority: 'medium',
            text: 'Develop comprehensive AI governance policies and compliance procedures'
        });
    }
    
    if (scores.supply < 60) {
        recommendations.push({
            priority: 'high',
            text: 'Secure AI supply chain with model verification and dependency scanning'
        });
    }
    
    if (scores.incident < 70) {
        recommendations.push({
            priority: 'medium',
            text: 'Create AI-specific incident response playbooks and conduct regular drills'
        });
    }
    
    // Sort by priority
    recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Display recommendations
    const container = document.getElementById('recommendations-list');
    container.innerHTML = recommendations.map(rec => 
        `<div class="recommendation-item ${rec.priority}">${rec.text}</div>`
    ).join('');
    
    genaiSecurityData.recommendations = recommendations;
}

// Helper functions
function getScoreClass(score) {
    if (score >= 80) return 'score-value success';
    if (score >= 60) return 'score-value warning';
    return 'score-value critical';
}

function getRiskClass(risk) {
    const riskClasses = {
        'Low': 'success',
        'Medium': 'warning',
        'High': 'critical',
        'Critical': 'critical'
    };
    return riskClasses[risk] || '';
}

// Save progress
function saveProgress() {
    // Use auto-save if available
    if (window.autoSave && window.autoSave.manualSave) {
        window.autoSave.manualSave();
        return;
    }
    
    try {
        // Fallback to manual save
        // Collect all form data
        const formData = {
            timestamp: new Date().toISOString(),
            scores: genaiSecurityData,
            inputs: {}
        };
        
        // Save all inputs
        document.querySelectorAll('input, select').forEach(element => {
            if (element.type === 'checkbox') {
                formData.inputs[element.id || element.name] = element.checked;
            } else {
                formData.inputs[element.id || element.name] = element.value;
            }
        });
        
        localStorage.setItem('genai_security_assessment', JSON.stringify(formData));
        
        if (window.notify) {
            window.notify.show('✅ Progress saved successfully!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Save failed:', error);
        if (window.notify) {
            window.notify.show('❌ Failed to save progress', 'error');
        }
        return false;
    }
}

// Load saved data
function loadSavedData() {
    try {
        const saved = localStorage.getItem('genai_security_assessment');
        if (!saved) return false;
        
        const data = JSON.parse(saved);
        
        // Restore inputs
        Object.entries(data.inputs).forEach(([key, value]) => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
        
        // Show notification
        if (window.notify) {
            const timeAgo = getTimeAgo(new Date(data.timestamp));
            window.notify.show(`✅ Loaded assessment from ${timeAgo}`, 'info');
        }
        
        return true;
    } catch (error) {
        console.error('Load failed:', error);
        return false;
    }
}

// Auto-save
let autoSaveTimer;
function autoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveProgress();
    }, 2000);
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [name, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value);
        if (interval >= 1) {
            return interval === 1 ? `1 ${name} ago` : `${interval} ${name}s ago`;
        }
    }
    return 'just now';
}

// Export to Excel
async function exportToExcel() {
    try {
        if (window.loadingOverlay) {
            window.loadingOverlay.show('Generating Excel report...');
        }
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
            ['GenAI Security Assessment Report'],
            ['Generated:', new Date().toLocaleString()],
            [''],
            ['Overall Score:', genaiSecurityData.overallScore + '%'],
            [''],
            ['Area', 'Score', 'Status'],
            ['Prompt Security', genaiSecurityData.promptSecurity.score + '%', genaiSecurityData.promptSecurity.risk],
            ['Model Security', genaiSecurityData.modelSecurity.score + '%', genaiSecurityData.modelSecurity.protection],
            ['Data Privacy', genaiSecurityData.dataPrivacy.score + '%', genaiSecurityData.dataPrivacy.compliance],
            ['Hallucination Control', genaiSecurityData.hallucination.score + '%', genaiSecurityData.hallucination.confidence],
            ['Ethical AI', genaiSecurityData.ethicalAI.score + '%', genaiSecurityData.ethicalAI.transparency],
            ['Governance', genaiSecurityData.governance.score + '%', genaiSecurityData.governance.maturity],
            ['Supply Chain', genaiSecurityData.supplyChain.score + '%', genaiSecurityData.supplyChain.integrity],
            ['Incident Response', genaiSecurityData.incidentResponse.score + '%', genaiSecurityData.incidentResponse.capability]
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
        
        // Recommendations sheet
        const recData = [
            ['Recommendations'],
            ['Priority', 'Recommendation']
        ];
        
        genaiSecurityData.recommendations.forEach(rec => {
            recData.push([rec.priority.toUpperCase(), rec.text]);
        });
        
        const recSheet = XLSX.utils.aoa_to_sheet(recData);
        XLSX.utils.book_append_sheet(wb, recSheet, 'Recommendations');
        
        // Download file
        XLSX.writeFile(wb, `GenAI_Security_Assessment_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        if (window.loadingOverlay) {
            window.loadingOverlay.hide();
        }
        
        if (window.notify) {
            window.notify.show('✅ Excel report downloaded successfully!', 'success');
        }
    } catch (error) {
        console.error('Export failed:', error);
        if (window.loadingOverlay) {
            window.loadingOverlay.hide();
        }
        if (window.notify) {
            window.notify.show('❌ Export failed: ' + error.message, 'error');
        }
    }
}

// Generate PDF report
function generateReport() {
    // Create report content
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <html>
        <head>
            <title>GenAI Security Assessment Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                h1 { color: #6366f1; }
                h2 { color: #8b5cf6; margin-top: 30px; }
                .score { font-size: 24px; font-weight: bold; color: #6366f1; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f8fafc; }
                .critical { color: #ef4444; }
                .high { color: #f59e0b; }
                .medium { color: #3b82f6; }
                .low { color: #10b981; }
            </style>
        </head>
        <body>
            <h1>GenAI Security Assessment Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            
            <h2>Overall Score</h2>
            <p class="score">${genaiSecurityData.overallScore}%</p>
            
            <h2>Assessment Results</h2>
            <table>
                <tr><th>Area</th><th>Score</th><th>Status</th></tr>
                <tr><td>Prompt Security</td><td>${genaiSecurityData.promptSecurity.score}%</td><td>${genaiSecurityData.promptSecurity.risk}</td></tr>
                <tr><td>Model Security</td><td>${genaiSecurityData.modelSecurity.score}%</td><td>${genaiSecurityData.modelSecurity.protection}</td></tr>
                <tr><td>Data Privacy</td><td>${genaiSecurityData.dataPrivacy.score}%</td><td>${genaiSecurityData.dataPrivacy.compliance}</td></tr>
                <tr><td>Hallucination Control</td><td>${genaiSecurityData.hallucination.score}%</td><td>${genaiSecurityData.hallucination.confidence}</td></tr>
                <tr><td>Ethical AI</td><td>${genaiSecurityData.ethicalAI.score}%</td><td>${genaiSecurityData.ethicalAI.transparency}</td></tr>
                <tr><td>Governance</td><td>${genaiSecurityData.governance.score}%</td><td>${genaiSecurityData.governance.maturity}</td></tr>
                <tr><td>Supply Chain</td><td>${genaiSecurityData.supplyChain.score}%</td><td>${genaiSecurityData.supplyChain.integrity}</td></tr>
                <tr><td>Incident Response</td><td>${genaiSecurityData.incidentResponse.score}%</td><td>${genaiSecurityData.incidentResponse.capability}</td></tr>
            </table>
            
            <h2>Recommendations</h2>
            <ul>
                ${genaiSecurityData.recommendations.map(rec => 
                    `<li class="${rec.priority}">[${rec.priority.toUpperCase()}] ${rec.text}</li>`
                ).join('')}
            </ul>
            
            <p style="margin-top: 50px; text-align: center; color: #6366f1;">
                Built by an Architect, Built for Architects
            </p>
        </body>
        </html>
    `);
    
    setTimeout(() => {
        reportWindow.print();
    }, 500);
}

// Share results
function shareResults() {
    const shareData = btoa(JSON.stringify(genaiSecurityData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${shareData}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        if (window.notify) {
            window.notify.show('🔗 Share link copied to clipboard!', 'success');
        }
    }).catch(() => {
        prompt('Copy this link to share:', shareUrl);
    });
}

// Reset calculator
function resetCalculator() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        // Clear all inputs
        document.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else if (input.type === 'number') {
                input.value = input.min || 0;
            } else {
                input.value = '';
            }
        });
        
        // Reset selects
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Clear localStorage
        localStorage.removeItem('genai_security_assessment');
        
        // Recalculate
        calculateAllScores();
        
        if (window.notify) {
            window.notify.show('🔄 Assessment reset successfully', 'info');
        }
    }
}

// Initialize tooltips
function initializeTooltips() {
    // Add helpful tooltips to complex fields
    const tooltips = {
        'prompt-sanitization': 'Level of input filtering and validation applied to prompts',
        'injection-detection': 'Percentage of known injection attacks successfully detected',
        'context-protection': 'Protection mechanisms for context window manipulation',
        'defense-updates': 'How frequently defense patterns are updated',
        'weight-encryption': 'Encryption status of model weights at rest and in transit',
        'model-access-control': 'Access control model for model endpoints',
        'api-security': 'Security level of API endpoints serving the model',
        'redaction-strategy': 'Method for handling and redacting sensitive information',
        'detection-accuracy': 'Accuracy of hallucination detection mechanisms',
        'temperature-control': 'Control over model temperature for output consistency',
        'bias-testing-freq': 'Frequency of bias testing and evaluation',
        'policy-maturity': 'Maturity level of AI governance policies',
        'poisoning-detection': 'Detection capabilities for data poisoning attacks',
        'training-frequency': 'Frequency of incident response training'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });
}

// Load shared data if present
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
        try {
            const data = JSON.parse(atob(sharedData));
            genaiSecurityData = data;
            
            // Update display
            calculateAllScores();
            
            if (window.notify) {
                window.notify.show('✅ Loaded shared assessment data', 'success');
            }
        } catch (error) {
            console.error('Failed to load shared data:', error);
        }
    }
});

// Export functions to global scope
window.exportToExcel = exportToExcel;
window.saveProgress = saveProgress;
window.shareResults = shareResults;
window.generateReport = generateReport;
window.resetCalculator = resetCalculator;