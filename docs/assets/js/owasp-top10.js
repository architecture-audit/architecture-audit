// OWASP Top 10 Security Assessment Calculator
// Adaptive assessment for Web, API, and LLM contexts

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeOWASP();
    setupEventListeners();
    loadSavedData();
    switchContext(); // Set initial context
});

// Global state
let owaspData = {
    context: 'web',
    scores: {},
    recommendations: []
};

// Context-specific weights
const contextWeights = {
    web: {
        injection: 0.15,
        auth: 0.12,
        exposure: 0.12,
        xxe: 0.08,
        access: 0.12,
        config: 0.10,
        xss: 0.10,
        deserialization: 0.06,
        components: 0.08,
        monitoring: 0.07
    },
    api: {
        injection: 0.12,
        auth: 0.15,
        exposure: 0.15,
        xxe: 0.10,
        access: 0.15,
        config: 0.08,
        xss: 0.05,
        deserialization: 0.05,
        components: 0.08,
        monitoring: 0.07
    },
    llm: {
        injection: 0.20, // Prompt injection is critical
        auth: 0.10,
        exposure: 0.15, // Data leakage
        xxe: 0.08,
        access: 0.12,
        config: 0.10,
        xss: 0.08,
        deserialization: 0.05,
        components: 0.07,
        monitoring: 0.05
    },
    comprehensive: {
        injection: 0.15,
        auth: 0.12,
        exposure: 0.13,
        xxe: 0.09,
        access: 0.13,
        config: 0.09,
        xss: 0.08,
        deserialization: 0.06,
        components: 0.08,
        monitoring: 0.07
    }
};

// Initialize the framework
function initializeOWASP() {
    console.log('OWASP Top 10 Assessment initialized');
    
    // Set up tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
}

// Set up event listeners
function setupEventListeners() {
    // Add change listeners to all inputs
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function() {
            saveProgress();
            calculateOWASPScore();
        });
    });
}

// Switch context (Web, API, LLM, Comprehensive)
function switchContext() {
    const context = document.getElementById('assessment-context').value;
    owaspData.context = context;
    
    // Update context info
    const contextInfo = {
        web: 'Assessing traditional web application vulnerabilities',
        api: 'Evaluating API-specific security concerns',
        llm: 'Analyzing AI/LLM system security risks',
        comprehensive: 'Complete assessment across all contexts'
    };
    
    document.getElementById('context-info').textContent = contextInfo[context];
    
    // Show/hide context-specific sections
    document.querySelectorAll('.context-section').forEach(section => {
        section.style.display = 'none';
    });
    
    if (context === 'comprehensive') {
        // Show all sections
        document.querySelectorAll('.context-section').forEach(section => {
            section.style.display = 'block';
        });
    } else {
        // Show specific context sections
        document.querySelectorAll(`.${context}-context`).forEach(section => {
            section.style.display = 'block';
        });
    }
    
    // Recalculate scores
    calculateOWASPScore();
}

// Switch tabs
function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

// Calculate OWASP Score
function calculateOWASPScore() {
    const context = owaspData.context;
    const weights = contextWeights[context];
    let categoryScores = {};
    
    // A01: Injection
    categoryScores.injection = calculateInjectionScore(context);
    
    // A02: Authentication
    categoryScores.auth = calculateAuthScore(context);
    
    // A03: Data Exposure
    categoryScores.exposure = calculateExposureScore(context);
    
    // A04: XXE/SSRF
    categoryScores.xxe = calculateXXEScore(context);
    
    // A05: Access Control
    categoryScores.access = calculateAccessScore(context);
    
    // A06: Security Misconfiguration
    categoryScores.config = calculateConfigScore(context);
    
    // A07: XSS
    categoryScores.xss = calculateXSSScore(context);
    
    // A08: Deserialization
    categoryScores.deserialization = calculateDeserializationScore(context);
    
    // A09: Vulnerable Components
    categoryScores.components = calculateComponentsScore(context);
    
    // A10: Monitoring
    categoryScores.monitoring = calculateMonitoringScore(context);
    
    // Calculate weighted overall score
    let overallScore = 0;
    for (let category in categoryScores) {
        overallScore += categoryScores[category] * weights[category];
    }
    
    owaspData.scores = categoryScores;
    
    // Update display
    updateScoreDisplay(overallScore, categoryScores);
    generateRecommendations(categoryScores, context);
    
    return overallScore;
}

// Calculate individual category scores
function calculateInjectionScore(context) {
    let score = 0;
    let count = 0;
    
    if (context === 'web' || context === 'comprehensive') {
        const webSanitization = getSelectValue('web-input-sanitization');
        const webTesting = getSelectValue('web-sqli-testing');
        if (webSanitization !== null) { score += webSanitization; count++; }
        if (webTesting !== null) { score += webTesting; count++; }
    }
    
    if (context === 'api' || context === 'comprehensive') {
        const apiSchema = getSelectValue('api-schema-validation');
        const apiGraphQL = getSelectValue('api-graphql-prevention');
        if (apiSchema !== null) { score += apiSchema; count++; }
        if (apiGraphQL !== null) { score += apiGraphQL; count++; }
    }
    
    if (context === 'llm' || context === 'comprehensive') {
        const llmPrompt = getSelectValue('llm-prompt-injection');
        const llmSystem = getSelectValue('llm-system-prompt');
        const llmIndirect = getSelectValue('llm-indirect-injection');
        if (llmPrompt !== null) { score += llmPrompt; count++; }
        if (llmSystem !== null) { score += llmSystem; count++; }
        if (llmIndirect !== null) { score += llmIndirect; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateAuthScore(context) {
    let score = 0;
    let count = 0;
    
    if (context === 'web' || context === 'comprehensive') {
        const password = getSelectValue('web-password-policy');
        const mfa = getSelectValue('web-mfa');
        if (password !== null) { score += password; count++; }
        if (mfa !== null) { score += mfa; count++; }
    }
    
    if (context === 'api' || context === 'comprehensive') {
        const apiKey = getSelectValue('api-key-management');
        const oauth = getSelectValue('api-oauth');
        if (apiKey !== null) { score += apiKey; count++; }
        if (oauth !== null) { score += oauth; count++; }
    }
    
    if (context === 'llm' || context === 'comprehensive') {
        const llmAuth = getSelectValue('llm-api-auth');
        const llmContext = getSelectValue('llm-context-isolation');
        if (llmAuth !== null) { score += llmAuth; count++; }
        if (llmContext !== null) { score += llmContext; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateExposureScore(context) {
    let score = 0;
    let count = 0;
    
    if (context === 'web' || context === 'comprehensive') {
        const restEncryption = getSelectValue('web-encryption-rest');
        const transitEncryption = getSelectValue('web-encryption-transit');
        if (restEncryption !== null) { score += restEncryption; count++; }
        if (transitEncryption !== null) { score += transitEncryption; count++; }
    }
    
    if (context === 'api' || context === 'comprehensive') {
        const apiFiltering = getSelectValue('api-data-filtering');
        const apiPII = getSelectValue('api-pii-detection');
        if (apiFiltering !== null) { score += apiFiltering; count++; }
        if (apiPII !== null) { score += apiPII; count++; }
    }
    
    if (context === 'llm' || context === 'comprehensive') {
        const trainingPII = getSelectValue('llm-training-pii');
        const inversion = getSelectValue('llm-inversion-prevention');
        const membership = getSelectValue('llm-membership-protection');
        if (trainingPII !== null) { score += trainingPII; count++; }
        if (inversion !== null) { score += inversion; count++; }
        if (membership !== null) { score += membership; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateXXEScore(context) {
    let score = 0;
    let count = 0;
    
    if (context === 'web' || context === 'comprehensive') {
        const xxe = getSelectValue('web-xxe-prevention');
        const fileVal = getSelectValue('web-file-validation');
        if (xxe !== null) { score += xxe; count++; }
        if (fileVal !== null) { score += fileVal; count++; }
    }
    
    if (context === 'api' || context === 'comprehensive') {
        const urlVal = getSelectValue('api-url-validation');
        const networkIso = getSelectValue('api-network-isolation');
        if (urlVal !== null) { score += urlVal; count++; }
        if (networkIso !== null) { score += networkIso; count++; }
    }
    
    if (context === 'llm' || context === 'comprehensive') {
        const pluginVal = getSelectValue('llm-plugin-validation');
        const toolAccess = getSelectValue('llm-tool-access');
        if (pluginVal !== null) { score += pluginVal; count++; }
        if (toolAccess !== null) { score += toolAccess; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateAccessScore(context) {
    let score = 0;
    let count = 0;
    
    if (context === 'web' || context === 'comprehensive') {
        const authModel = getSelectValue('web-auth-model');
        const idor = getSelectValue('web-idor-prevention');
        if (authModel !== null) { score += authModel; count++; }
        if (idor !== null) { score += idor; count++; }
    }
    
    if (context === 'api' || context === 'comprehensive') {
        const objectAuth = getSelectValue('api-object-auth');
        const functionAuth = getSelectValue('api-function-auth');
        if (objectAuth !== null) { score += objectAuth; count++; }
        if (functionAuth !== null) { score += functionAuth; count++; }
    }
    
    if (context === 'llm' || context === 'comprehensive') {
        const modelAccess = getSelectValue('llm-model-access');
        const dataAccess = getSelectValue('llm-data-access');
        if (modelAccess !== null) { score += modelAccess; count++; }
        if (dataAccess !== null) { score += dataAccess; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateConfigScore(context) {
    let score = 0;
    let count = 0;
    
    // Common configuration items
    const headers = getSelectValue('config-headers');
    const defaults = getSelectValue('config-defaults');
    const errors = getSelectValue('config-errors');
    
    if (headers !== null) { score += headers; count++; }
    if (defaults !== null) { score += defaults; count++; }
    if (errors !== null) { score += errors; count++; }
    
    if (context === 'llm' || context === 'comprehensive') {
        const versioning = getSelectValue('llm-versioning');
        const parameters = getSelectValue('llm-parameters');
        if (versioning !== null) { score += versioning; count++; }
        if (parameters !== null) { score += parameters; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateXSSScore(context) {
    let score = 0;
    let count = 0;
    
    if (context === 'web' || context === 'comprehensive') {
        const htmlEncoding = getSelectValue('web-html-encoding');
        const domXSS = getSelectValue('web-dom-xss');
        if (htmlEncoding !== null) { score += htmlEncoding; count++; }
        if (domXSS !== null) { score += domXSS; count++; }
    }
    
    if (context === 'llm' || context === 'comprehensive') {
        const outputSan = getSelectValue('llm-output-sanitization');
        const codeSec = getSelectValue('llm-code-security');
        if (outputSan !== null) { score += outputSan; count++; }
        if (codeSec !== null) { score += codeSec; count++; }
    }
    
    // API context has minimal XSS concerns
    if (context === 'api') {
        return 75; // Baseline score for APIs
    }
    
    return count > 0 ? score / count : 0;
}

function calculateDeserializationScore(context) {
    let score = 0;
    let count = 0;
    
    const controls = getSelectValue('deserial-controls');
    const validation = getSelectValue('deserial-validation');
    
    if (controls !== null) { score += controls; count++; }
    if (validation !== null) { score += validation; count++; }
    
    if (context === 'llm' || context === 'comprehensive') {
        const modelIntegrity = getSelectValue('llm-model-integrity');
        if (modelIntegrity !== null) { score += modelIntegrity; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateComponentsScore(context) {
    let score = 0;
    let count = 0;
    
    const scanning = getSelectValue('comp-scanning');
    const updates = getSelectValue('comp-updates');
    const sbom = getSelectValue('comp-sbom');
    
    if (scanning !== null) { score += scanning; count++; }
    if (updates !== null) { score += updates; count++; }
    if (sbom !== null) { score += sbom; count++; }
    
    if (context === 'llm' || context === 'comprehensive') {
        const provenance = getSelectValue('llm-provenance');
        const dataVal = getSelectValue('llm-data-validation');
        if (provenance !== null) { score += provenance; count++; }
        if (dataVal !== null) { score += dataVal; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

function calculateMonitoringScore(context) {
    let score = 0;
    let count = 0;
    
    const logging = getSelectValue('mon-logging');
    const detection = getSelectValue('mon-detection');
    const response = getSelectValue('mon-response');
    
    if (logging !== null) { score += logging; count++; }
    if (detection !== null) { score += detection; count++; }
    if (response !== null) { score += response; count++; }
    
    if (context === 'llm' || context === 'comprehensive') {
        const promptLog = getSelectValue('llm-prompt-logging');
        const anomaly = getSelectValue('llm-anomaly');
        const hallucination = getSelectValue('llm-hallucination');
        if (promptLog !== null) { score += promptLog; count++; }
        if (anomaly !== null) { score += anomaly; count++; }
        if (hallucination !== null) { score += hallucination; count++; }
    }
    
    return count > 0 ? score / count : 0;
}

// Helper function to get select value
function getSelectValue(id) {
    const element = document.getElementById(id);
    if (element && element.value !== '') {
        return parseInt(element.value);
    }
    return null;
}

// Update score display
function updateScoreDisplay(overallScore, categoryScores) {
    // Update overall score
    document.getElementById('overall-score').textContent = Math.round(overallScore);
    
    // Update risk level
    let riskLevel = 'Critical';
    let riskClass = 'critical';
    if (overallScore >= 80) {
        riskLevel = 'Low';
        riskClass = 'success';
    } else if (overallScore >= 60) {
        riskLevel = 'Medium';
        riskClass = 'warning';
    } else if (overallScore >= 40) {
        riskLevel = 'High';
        riskClass = 'warning';
    }
    
    const riskElement = document.getElementById('risk-level');
    riskElement.textContent = riskLevel;
    riskElement.className = `score-value ${riskClass}`;
    
    // Update compliance score
    document.getElementById('compliance-score').textContent = `${Math.round(overallScore)}%`;
    
    // Update context type
    const contextMap = {
        web: 'Web App',
        api: 'API',
        llm: 'AI/LLM',
        comprehensive: 'All'
    };
    document.getElementById('context-type').textContent = contextMap[owaspData.context];
    
    // Update category breakdown
    const categoryNames = {
        injection: 'A01: Injection',
        auth: 'A02: Authentication',
        exposure: 'A03: Data Exposure',
        xxe: 'A04: XXE/SSRF',
        access: 'A05: Access Control',
        config: 'A06: Misconfiguration',
        xss: 'A07: XSS',
        deserialization: 'A08: Deserialization',
        components: 'A09: Components',
        monitoring: 'A10: Monitoring'
    };
    
    let breakdownHTML = '';
    for (let category in categoryScores) {
        const score = Math.round(categoryScores[category]);
        let scoreClass = score >= 75 ? 'success' : score >= 50 ? 'warning' : 'critical';
        breakdownHTML += `
            <div class="category-score-item">
                <span>${categoryNames[category]}</span>
                <span class="${scoreClass}">${score}%</span>
            </div>
        `;
    }
    
    document.getElementById('category-breakdown').innerHTML = breakdownHTML;
}

// Generate recommendations
function generateRecommendations(categoryScores, context) {
    const recommendations = [];
    
    // Check each category and add recommendations for low scores
    if (categoryScores.injection < 50) {
        if (context === 'llm' || context === 'comprehensive') {
            recommendations.push({
                priority: 'critical',
                text: '🚨 CRITICAL: Implement comprehensive prompt injection defenses including input validation, output filtering, and prompt guards'
            });
        } else {
            recommendations.push({
                priority: 'critical',
                text: '🚨 CRITICAL: Implement parameterized queries and input validation to prevent injection attacks'
            });
        }
    }
    
    if (categoryScores.auth < 50) {
        recommendations.push({
            priority: 'high',
            text: '⚠️ HIGH: Strengthen authentication with MFA, secure session management, and proper credential storage'
        });
    }
    
    if (categoryScores.exposure < 50) {
        if (context === 'llm' || context === 'comprehensive') {
            recommendations.push({
                priority: 'high',
                text: '⚠️ HIGH: Implement PII detection and filtering in training data and model outputs'
            });
        } else {
            recommendations.push({
                priority: 'high',
                text: '⚠️ HIGH: Encrypt sensitive data at rest and in transit, implement proper key management'
            });
        }
    }
    
    if (categoryScores.access < 50) {
        recommendations.push({
            priority: 'high',
            text: '⚠️ HIGH: Implement proper authorization checks at object and function levels'
        });
    }
    
    if (categoryScores.monitoring < 50) {
        recommendations.push({
            priority: 'medium',
            text: '📊 MEDIUM: Implement comprehensive logging, monitoring, and incident response procedures'
        });
    }
    
    if (categoryScores.components < 50) {
        recommendations.push({
            priority: 'medium',
            text: '📦 MEDIUM: Implement dependency scanning and maintain an updated SBOM'
        });
    }
    
    // Display recommendations
    let recHTML = '';
    recommendations.sort((a, b) => {
        const priority = { critical: 0, high: 1, medium: 2 };
        return priority[a.priority] - priority[b.priority];
    });
    
    recommendations.forEach(rec => {
        recHTML += `<div class="recommendation-item ${rec.priority}">${rec.text}</div>`;
    });
    
    if (recommendations.length === 0) {
        recHTML = '<div class="recommendation-item">✅ Good security posture! Continue regular assessments and updates.</div>';
    }
    
    document.getElementById('recommendations-list').innerHTML = recHTML;
    owaspData.recommendations = recommendations;
}

// Save progress to localStorage
function saveProgress() {
    const formData = {};
    document.querySelectorAll('select').forEach(select => {
        if (select.value) {
            formData[select.id] = select.value;
        }
    });
    
    localStorage.setItem('owaspAssessment', JSON.stringify({
        context: owaspData.context,
        formData: formData,
        timestamp: new Date().toISOString()
    }));
}

// Load saved data
function loadSavedData() {
    const saved = localStorage.getItem('owaspAssessment');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Restore context
        if (data.context) {
            document.getElementById('assessment-context').value = data.context;
            owaspData.context = data.context;
        }
        
        // Restore form values
        if (data.formData) {
            for (let id in data.formData) {
                const element = document.getElementById(id);
                if (element) {
                    element.value = data.formData[id];
                }
            }
        }
        
        // Recalculate scores
        calculateOWASPScore();
    }
}

// Export results
function exportResults() {
    const results = {
        assessment: 'OWASP Top 10 Security Assessment',
        context: owaspData.context,
        date: new Date().toISOString(),
        overallScore: Math.round(calculateOWASPScore()),
        categoryScores: owaspData.scores,
        recommendations: owaspData.recommendations
    };
    
    // Create Excel workbook
    if (typeof XLSX !== 'undefined') {
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
            ['OWASP Top 10 Assessment Results'],
            [''],
            ['Assessment Context', owaspData.context.toUpperCase()],
            ['Date', new Date().toLocaleDateString()],
            ['Overall Score', results.overallScore],
            ['Risk Level', results.overallScore >= 80 ? 'Low' : results.overallScore >= 60 ? 'Medium' : results.overallScore >= 40 ? 'High' : 'Critical'],
            [''],
            ['Category Scores'],
            ...Object.entries(results.categoryScores).map(([key, value]) => [key.toUpperCase(), Math.round(value)])
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws, 'Summary');
        
        // Recommendations sheet
        const recData = [
            ['Recommendations'],
            [''],
            ...results.recommendations.map(r => [r.priority.toUpperCase(), r.text])
        ];
        
        const ws2 = XLSX.utils.aoa_to_sheet(recData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Recommendations');
        
        // Download
        XLSX.writeFile(wb, `OWASP_Top10_Assessment_${owaspData.context}_${new Date().getTime()}.xlsx`);
    } else {
        // Fallback to JSON download
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OWASP_Top10_Assessment_${owaspData.context}_${new Date().getTime()}.json`;
        a.click();
    }
}

// Reset assessment
function resetAssessment() {
    if (confirm('Are you sure you want to reset the entire assessment? This cannot be undone.')) {
        localStorage.removeItem('owaspAssessment');
        document.querySelectorAll('select').forEach(select => {
            select.value = select.options[0].value;
        });
        owaspData = {
            context: 'web',
            scores: {},
            recommendations: []
        };
        document.getElementById('assessment-context').value = 'web';
        switchContext();
        calculateOWASPScore();
    }
}

// Make functions available globally
window.switchContext = switchContext;
window.calculateOWASPScore = calculateOWASPScore;
window.exportResults = exportResults;
window.saveProgress = saveProgress;
window.resetAssessment = resetAssessment;