// Security Audit Framework JavaScript

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeSecurityMaturityAssessment();
    initializeCalculations();
    
    // Initialize auto-save
    function initAutoSave() {
        console.log('Checking for AutoSave...', typeof window.AutoSave);
        if (window.AutoSave) {
            window.autoSave = new AutoSave('security-audit', 15000);
            console.log("✅ Auto-save initialized for security-audit");
            return true;
        }
        console.log('AutoSave not yet available');
        return false;
    }
    
    if (!initAutoSave()) {
        // Try again after a longer delay for bundle to load
        setTimeout(() => {
            if (!initAutoSave()) {
                // Try one more time
                setTimeout(() => {
                    if (!initAutoSave()) {
                        console.log("❌ AutoSave not found for security-audit!");
                    }
                }, 1000);
            }
        }, 500);
    }    
    // Check if there's data in URL first, then localStorage
    if (!loadFromURL()) {
        loadSavedData();
    }
});

// Tab Navigation
function initializeTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Initialize Security Maturity Assessment with NIST/ISO Framework Questions
function initializeSecurityMaturityAssessment() {
    const assessmentContainer = document.getElementById('maturity-assessment-container');
    if (!assessmentContainer) return;
    
    const securityDimensions = {
        'Identity & Access Management': {
            framework: 'NIST CSF',
            questions: [
                { id: 'iam_mfa', text: 'Do you have Multi-Factor Authentication (MFA) implemented across all systems?', weight: 0.25 },
                { id: 'iam_rbac', text: 'Is Role-Based Access Control (RBAC) properly configured?', weight: 0.2 },
                { id: 'iam_pam', text: 'Do you have Privileged Access Management (PAM) in place?', weight: 0.2 },
                { id: 'iam_lifecycle', text: 'Is user lifecycle management automated (joiner/mover/leaver)?', weight: 0.15 },
                { id: 'iam_reviews', text: 'Are regular access reviews conducted?', weight: 0.2 }
            ]
        },
        'Network Security': {
            framework: 'ISO 27001',
            questions: [
                { id: 'network_segmentation', text: 'Is network segmentation properly implemented?', weight: 0.25 },
                { id: 'network_monitoring', text: 'Do you have comprehensive network monitoring?', weight: 0.2 },
                { id: 'network_firewall', text: 'Are firewalls properly configured and maintained?', weight: 0.2 },
                { id: 'network_zerotrust', text: 'Have you implemented Zero Trust architecture principles?', weight: 0.2 },
                { id: 'network_intrusion', text: 'Is Intrusion Detection/Prevention System (IDS/IPS) deployed?', weight: 0.15 }
            ]
        },
        'Data Protection': {
            framework: 'GDPR/HIPAA',
            questions: [
                { id: 'data_encryption', text: 'Is data encrypted at rest and in transit?', weight: 0.25 },
                { id: 'data_classification', text: 'Do you have a data classification scheme?', weight: 0.2 },
                { id: 'data_dlp', text: 'Is Data Loss Prevention (DLP) implemented?', weight: 0.2 },
                { id: 'data_backup', text: 'Are regular secure backups maintained?', weight: 0.15 },
                { id: 'data_retention', text: 'Are data retention policies enforced?', weight: 0.2 }
            ]
        },
        'Vulnerability Management': {
            framework: 'NIST CSF',
            questions: [
                { id: 'vuln_scanning', text: 'Do you conduct regular vulnerability scans?', weight: 0.25 },
                { id: 'vuln_patching', text: 'Is patch management systematic and timely?', weight: 0.25 },
                { id: 'vuln_pentesting', text: 'Are regular penetration tests conducted?', weight: 0.2 },
                { id: 'vuln_remediation', text: 'Is vulnerability remediation tracked and prioritized?', weight: 0.15 },
                { id: 'vuln_reporting', text: 'Are vulnerability metrics reported to management?', weight: 0.15 }
            ]
        },
        'Incident Response': {
            framework: 'NIST SP 800-61',
            questions: [
                { id: 'ir_plan', text: 'Do you have a documented incident response plan?', weight: 0.25 },
                { id: 'ir_team', text: 'Is there a trained incident response team?', weight: 0.2 },
                { id: 'ir_tools', text: 'Are incident response tools and procedures in place?', weight: 0.2 },
                { id: 'ir_testing', text: 'Do you regularly test incident response procedures?', weight: 0.15 },
                { id: 'ir_communication', text: 'Are communication plans defined for incidents?', weight: 0.2 }
            ]
        },
        'Compliance & Governance': {
            framework: 'SOC 2/ISO 27001',
            questions: [
                { id: 'compliance_framework', text: 'Do you follow established security frameworks?', weight: 0.2 },
                { id: 'compliance_policies', text: 'Are security policies regularly updated?', weight: 0.2 },
                { id: 'compliance_training', text: 'Is security awareness training mandatory?', weight: 0.2 },
                { id: 'compliance_audits', text: 'Are regular security audits conducted?', weight: 0.2 },
                { id: 'compliance_metrics', text: 'Are security metrics tracked and reported?', weight: 0.2 }
            ]
        }
    };
    
    let html = '<div class="maturity-questions">';
    
    Object.keys(securityDimensions).forEach((dimension, index) => {
        const dimensionData = securityDimensions[dimension];
        html += `
            <div class="dimension-section">
                <div class="dimension-header">
                    <h3>${dimension} <span class="framework-badge">${dimensionData.framework}</span></h3>
                    <div class="dimension-score" id="dimension-score-${index}">0%</div>
                </div>
                <div class="dimension-questions">
        `;
        
        dimensionData.questions.forEach(question => {
            html += `
                <div class="question-row">
                    <div class="question-text">${question.text}</div>
                    <div class="question-input">
                        <select id="${question.id}" onchange="calculateSecurityMaturity()">
                            <option value="0">Not Implemented</option>
                            <option value="1">Basic</option>
                            <option value="2">Managed</option>
                            <option value="3">Defined</option>
                            <option value="4">Optimized</option>
                        </select>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    html += `
        <div class="overall-maturity-score">
            <h3>Overall Security Maturity Score</h3>
            <div class="score-display">
                <div class="score-card">
                    <div class="score-label">Maturity Level</div>
                    <div class="score-value" id="overall-maturity">0%</div>
                </div>
                <div class="score-card">
                    <div class="score-label">Security Posture</div>
                    <div class="score-value" id="security-posture">Initial</div>
                </div>
                <div class="score-card">
                    <div class="score-label">Risk Level</div>
                    <div class="score-value critical" id="risk-level">High</div>
                </div>
            </div>
        </div>
    `;
    
    assessmentContainer.innerHTML = html;
    
    // Store dimension data for calculations
    window.securityDimensions = securityDimensions;
}

// Calculate Security Maturity Score
// Calculate OWASP Top 10 Score
function calculateOWASPScore() {
    let score = 0;
    let count = 0;
    
    const owaspFields = [
        'owasp-access', 'owasp-crypto', 'owasp-injection', 'owasp-design',
        'owasp-config', 'owasp-components', 'owasp-auth', 'owasp-integrity',
        'owasp-logging', 'owasp-ssrf'
    ];
    
    owaspFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
            score += parseInt(element.value);
            count++;
        }
    });
    
    return count > 0 ? Math.round(score / count) : 0;
}

// Calculate Blue Team Score
function calculateBlueTeamScore() {
    let score = 0;
    let count = 0;
    
    const blueFields = [
        'blue-detection', 'blue-coverage', 'blue-response', 'blue-mttr',
        'blue-hunting', 'blue-intelligence', 'blue-siem', 'blue-automation',
        'blue-forensics', 'blue-purple'
    ];
    
    blueFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
            score += parseInt(element.value);
            count++;
        }
    });
    
    return count > 0 ? Math.round(score / count) : 0;
}

function calculateSecurityMaturity() {
    if (!window.securityDimensions) return;
    
    let totalScore = 0;
    let dimensionCount = 0;
    const dimensionScores = [];
    
    Object.keys(window.securityDimensions).forEach((dimension, index) => {
        const dimensionData = window.securityDimensions[dimension];
        let dimensionScore = 0;
        let weightSum = 0;
        
        dimensionData.questions.forEach(question => {
            const element = document.getElementById(question.id);
            if (element) {
                const value = parseInt(element.value) || 0;
                dimensionScore += value * question.weight;
                weightSum += question.weight;
            }
        });
        
        if (weightSum > 0) {
            dimensionScore = (dimensionScore / weightSum) * 25; // Scale to 0-100
            dimensionScores.push(dimensionScore);
            totalScore += dimensionScore;
            dimensionCount++;
        }
        
        // Update dimension score display
        const dimensionScoreElement = document.getElementById(`dimension-score-${index}`);
        if (dimensionScoreElement) {
            dimensionScoreElement.textContent = Math.round(dimensionScore) + '%';
            dimensionScoreElement.className = 'dimension-score ' + getSecurityLevel(dimensionScore);
        }
    });
    
    const overallScore = dimensionCount > 0 ? totalScore / dimensionCount : 0;
    
    // Update overall displays
    const overallMaturityElement = document.getElementById('overall-maturity');
    if (overallMaturityElement) {
        overallMaturityElement.textContent = Math.round(overallScore) + '%';
    }
    
    const securityPostureElement = document.getElementById('security-posture');
    if (securityPostureElement) {
        securityPostureElement.textContent = getMaturityLevel(overallScore);
    }
    
    const riskLevelElement = document.getElementById('risk-level');
    if (riskLevelElement) {
        riskLevelElement.textContent = getRiskLevel(overallScore);
        riskLevelElement.className = 'score-value ' + getSecurityLevel(100 - overallScore);
    }
}

// Security level helper functions
function getSecurityLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
}

function getMaturityLevel(score) {
    if (score >= 80) return 'Optimized';
    if (score >= 60) return 'Defined';
    if (score >= 40) return 'Managed';
    if (score >= 20) return 'Basic';
    return 'Initial';
}

function getRiskLevel(score) {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'High';
    return 'Critical';
}

// Initialize Calculations
function initializeCalculations() {
    updateVulnerabilityStats();
    updateComplianceStats();
    updateIAMStats();
    
    // Add listeners for OWASP and Blue Team fields
    document.querySelectorAll('[id^="owasp-"], [id^="blue-"]').forEach(select => {
        select.addEventListener('change', () => {
            if (select.id.startsWith('owasp-')) {
                const score = calculateOWASPScore();
                console.log('OWASP Score:', score);
            } else if (select.id.startsWith('blue-')) {
                const score = calculateBlueTeamScore();
                console.log('Blue Team Score:', score);
            }
        });
    });
    updateNetworkSecurityStats();
    updateDataProtectionStats();
    updateIncidentResponseStats();
    updateCloudSecurityStats();
    updateRiskStats();
}

// Vulnerability Assessment Functions
function addVulnerabilityRow() {
    const tbody = document.getElementById('vulnerability-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="CVE-2024-XXXX"></td>
        <td>
            <select>
                <option>Critical</option>
                <option>High</option>
                <option selected>Medium</option>
                <option>Low</option>
                <option>Info</option>
            </select>
        </td>
        <td><input type="number" placeholder="9.0" step="0.1" min="0" max="10" onchange="updateVulnerabilityStats()"></td>
        <td><input type="text" placeholder="Description"></td>
        <td>
            <select onchange="updateVulnerabilityStats()">
                <option>Identified</option>
                <option>In Progress</option>
                <option>Testing</option>
                <option>Resolved</option>
            </select>
        </td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this); updateVulnerabilityStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateVulnerabilityStats() {
    const rows = document.querySelectorAll('#vulnerability-tbody tr');
    let total = 0, critical = 0, high = 0, resolved = 0;
    let totalCvss = 0, cvssCount = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            total++;
            const severity = row.children[1].querySelector('select').value;
            const cvss = parseFloat(row.children[2].querySelector('input').value) || 0;
            const status = row.children[4].querySelector('select').value;
            
            if (severity === 'Critical') critical++;
            if (severity === 'High') high++;
            if (status === 'Resolved') resolved++;
            
            if (cvss > 0) {
                totalCvss += cvss;
                cvssCount++;
            }
        }
    });
    
    document.getElementById('total-vulns').textContent = total;
    document.getElementById('critical-vulns').textContent = critical;
    document.getElementById('avg-cvss').textContent = cvssCount > 0 ? (totalCvss / cvssCount).toFixed(1) : '0.0';
    document.getElementById('resolved-rate').textContent = total > 0 ? Math.round((resolved / total) * 100) + '%' : '0%';
}

// Compliance Mapping Functions
function addComplianceRow() {
    const tbody = document.getElementById('compliance-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <select>
                <option>GDPR</option>
                <option>HIPAA</option>
                <option>SOC 2</option>
                <option>ISO 27001</option>
                <option>PCI DSS</option>
            </select>
        </td>
        <td><input type="text" placeholder="Control ID"></td>
        <td><input type="text" placeholder="Control description"></td>
        <td>
            <select onchange="updateComplianceStats()">
                <option>Compliant</option>
                <option>Partial</option>
                <option>Non-Compliant</option>
                <option>Not Applicable</option>
            </select>
        </td>
        <td><input type="text" placeholder="Evidence/Notes"></td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this); updateComplianceStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateComplianceStats() {
    const rows = document.querySelectorAll('#compliance-tbody tr');
    let total = 0, compliant = 0, partial = 0, nonCompliant = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            const status = row.children[3].querySelector('select').value;
            if (status !== 'Not Applicable') {
                total++;
                if (status === 'Compliant') compliant++;
                else if (status === 'Partial') partial++;
                else if (status === 'Non-Compliant') nonCompliant++;
            }
        }
    });
    
    document.getElementById('compliance-rate').textContent = total > 0 ? Math.round((compliant / total) * 100) + '%' : '0%';
    document.getElementById('partial-compliance').textContent = partial;
    document.getElementById('non-compliance').textContent = nonCompliant;
    document.getElementById('total-controls').textContent = total;
}

// IAM Functions
function addIAMRow() {
    const tbody = document.getElementById('iam-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="System/Application"></td>
        <td>
            <select onchange="updateIAMStats()">
                <option>Yes</option>
                <option>No</option>
                <option>Partial</option>
            </select>
        </td>
        <td>
            <select onchange="updateIAMStats()">
                <option>Yes</option>
                <option>No</option>
                <option>Planned</option>
            </select>
        </td>
        <td>
            <select onchange="updateIAMStats()">
                <option>RBAC</option>
                <option>ABAC</option>
                <option>Basic</option>
                <option>None</option>
            </select>
        </td>
        <td><input type="number" placeholder="90" min="0" max="365" onchange="updateIAMStats()"></td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this); updateIAMStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateIAMStats() {
    const rows = document.querySelectorAll('#iam-tbody tr');
    let total = 0, mfaEnabled = 0, ssoEnabled = 0;
    let totalPasswordAge = 0, passwordCount = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            total++;
            const mfa = row.children[1].querySelector('select').value;
            const sso = row.children[2].querySelector('select').value;
            const passwordAge = parseInt(row.children[4].querySelector('input').value) || 0;
            
            if (mfa === 'Yes') mfaEnabled++;
            if (sso === 'Yes') ssoEnabled++;
            
            if (passwordAge > 0) {
                totalPasswordAge += passwordAge;
                passwordCount++;
            }
        }
    });
    
    document.getElementById('mfa-coverage').textContent = total > 0 ? Math.round((mfaEnabled / total) * 100) + '%' : '0%';
    document.getElementById('sso-coverage').textContent = total > 0 ? Math.round((ssoEnabled / total) * 100) + '%' : '0%';
    document.getElementById('avg-password-age').textContent = passwordCount > 0 ? Math.round(totalPasswordAge / passwordCount) + ' days' : '0 days';
    document.getElementById('total-systems').textContent = total;
}

// Network Security Functions
function addNetworkSecurityRow() {
    const tbody = document.getElementById('network-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Network segment"></td>
        <td>
            <select onchange="updateNetworkSecurityStats()">
                <option>DMZ</option>
                <option>Internal</option>
                <option>Management</option>
                <option>Guest</option>
            </select>
        </td>
        <td>
            <select onchange="updateNetworkSecurityStats()">
                <option>Yes</option>
                <option>No</option>
                <option>Partial</option>
            </select>
        </td>
        <td>
            <select onchange="updateNetworkSecurityStats()">
                <option>Yes</option>
                <option>No</option>
            </select>
        </td>
        <td>
            <select onchange="updateNetworkSecurityStats()">
                <option>Implemented</option>
                <option>Partial</option>
                <option>Planned</option>
                <option>None</option>
            </select>
        </td>
        <td><input type="text" placeholder="Notes"></td>
        <td><button class="remove-btn" onclick="removeRow(this); updateNetworkSecurityStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateNetworkSecurityStats() {
    const rows = document.querySelectorAll('#network-tbody tr');
    let total = 0, segmented = 0, monitoring = 0, zeroTrust = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            total++;
            const segmentation = row.children[2].querySelector('select').value;
            const monitoringStatus = row.children[3].querySelector('select').value;
            const ztStatus = row.children[4].querySelector('select').value;
            
            if (segmentation === 'Yes') segmented++;
            if (monitoringStatus === 'Yes') monitoring++;
            if (ztStatus === 'Implemented') zeroTrust++;
        }
    });
    
    document.getElementById('segmentation-coverage').textContent = total > 0 ? Math.round((segmented / total) * 100) + '%' : '0%';
    document.getElementById('monitoring-coverage').textContent = total > 0 ? Math.round((monitoring / total) * 100) + '%' : '0%';
    document.getElementById('zero-trust-coverage').textContent = total > 0 ? Math.round((zeroTrust / total) * 100) + '%' : '0%';
    document.getElementById('total-segments').textContent = total;
}

// Data Protection Functions
function addDataProtectionRow() {
    const tbody = document.getElementById('data-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Data store/system"></td>
        <td>
            <select>
                <option>Public</option>
                <option>Internal</option>
                <option>Confidential</option>
                <option>Restricted</option>
            </select>
        </td>
        <td>
            <select onchange="updateDataProtectionStats()">
                <option>Yes</option>
                <option>No</option>
                <option>Partial</option>
            </select>
        </td>
        <td>
            <select onchange="updateDataProtectionStats()">
                <option>Yes</option>
                <option>No</option>
            </select>
        </td>
        <td>
            <select onchange="updateDataProtectionStats()">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>None</option>
            </select>
        </td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this); updateDataProtectionStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateDataProtectionStats() {
    const rows = document.querySelectorAll('#data-tbody tr');
    let total = 0, encrypted = 0, dlpEnabled = 0, backedUp = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            total++;
            const encryption = row.children[2].querySelector('select').value;
            const dlp = row.children[3].querySelector('select').value;
            const backup = row.children[4].querySelector('select').value;
            
            if (encryption === 'Yes') encrypted++;
            if (dlp === 'Yes') dlpEnabled++;
            if (backup !== 'None') backedUp++;
        }
    });
    
    document.getElementById('encryption-coverage').textContent = total > 0 ? Math.round((encrypted / total) * 100) + '%' : '0%';
    document.getElementById('dlp-coverage').textContent = total > 0 ? Math.round((dlpEnabled / total) * 100) + '%' : '0%';
    document.getElementById('backup-coverage').textContent = total > 0 ? Math.round((backedUp / total) * 100) + '%' : '0%';
    document.getElementById('total-datastores').textContent = total;
}

// Incident Response Functions
function addIncidentRow() {
    const tbody = document.getElementById('incident-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Incident ID"></td>
        <td>
            <select>
                <option>Malware</option>
                <option>Phishing</option>
                <option>Data Breach</option>
                <option>DDoS</option>
                <option>Insider Threat</option>
                <option>Other</option>
            </select>
        </td>
        <td>
            <select>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
            </select>
        </td>
        <td><input type="datetime-local" onchange="updateIncidentResponseStats()"></td>
        <td><input type="datetime-local" onchange="updateIncidentResponseStats()"></td>
        <td>
            <select onchange="updateIncidentResponseStats()">
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this); updateIncidentResponseStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateIncidentResponseStats() {
    const rows = document.querySelectorAll('#incident-tbody tr');
    let total = 0, resolved = 0;
    let totalMttr = 0, mttrCount = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            total++;
            const detected = row.children[3].querySelector('input').value;
            const resolvedTime = row.children[4].querySelector('input').value;
            const status = row.children[5].querySelector('select').value;
            
            if (status === 'Resolved' || status === 'Closed') resolved++;
            
            if (detected && resolvedTime) {
                const detectedDate = new Date(detected);
                const resolvedDate = new Date(resolvedTime);
                const mttr = (resolvedDate - detectedDate) / (1000 * 60 * 60); // hours
                
                if (mttr >= 0) {
                    totalMttr += mttr;
                    mttrCount++;
                }
            }
        }
    });
    
    document.getElementById('total-incidents').textContent = total;
    document.getElementById('resolved-incidents').textContent = resolved;
    document.getElementById('avg-mttr').textContent = mttrCount > 0 ? Math.round(totalMttr / mttrCount) + 'h' : '0h';
    document.getElementById('incident-rate').textContent = total > 0 ? Math.round((resolved / total) * 100) + '%' : '0%';
}

// Cloud Security Functions
function addCloudSecurityRow() {
    const tbody = document.getElementById('cloud-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Service/Resource"></td>
        <td>
            <select>
                <option>AWS</option>
                <option>Azure</option>
                <option>GCP</option>
                <option>Multi-Cloud</option>
            </select>
        </td>
        <td>
            <select>
                <option>Compute</option>
                <option>Storage</option>
                <option>Database</option>
                <option>Network</option>
                <option>Identity</option>
            </select>
        </td>
        <td><input type="number" placeholder="0" min="0" onchange="updateCloudSecurityStats()"></td>
        <td>
            <select onchange="updateCloudSecurityStats()">
                <option>Compliant</option>
                <option>Non-Compliant</option>
                <option>Unknown</option>
            </select>
        </td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this); updateCloudSecurityStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateCloudSecurityStats() {
    const rows = document.querySelectorAll('#cloud-tbody tr');
    let totalFindings = 0, compliantResources = 0, totalResources = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            totalResources++;
            const findings = parseInt(row.children[3].querySelector('input').value) || 0;
            const compliance = row.children[4].querySelector('select').value;
            
            totalFindings += findings;
            if (compliance === 'Compliant') compliantResources++;
        }
    });
    
    document.getElementById('total-findings').textContent = totalFindings;
    document.getElementById('compliant-resources').textContent = totalResources > 0 ? Math.round((compliantResources / totalResources) * 100) + '%' : '0%';
    document.getElementById('cloud-resources').textContent = totalResources;
    document.getElementById('avg-findings').textContent = totalResources > 0 ? Math.round(totalFindings / totalResources) : '0';
}

// Risk Register Functions
function addRiskRow() {
    const tbody = document.getElementById('risk-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Risk description"></td>
        <td>
            <select>
                <option>Technical</option>
                <option>Operational</option>
                <option>Compliance</option>
                <option>Strategic</option>
            </select>
        </td>
        <td>
            <select onchange="updateRiskScore(this)">
                <option value="1">Low (1)</option>
                <option value="2">Medium (2)</option>
                <option value="3" selected>High (3)</option>
                <option value="4">Very High (4)</option>
            </select>
        </td>
        <td>
            <select onchange="updateRiskScore(this)">
                <option value="1">Minor (1)</option>
                <option value="2">Moderate (2)</option>
                <option value="3" selected>Major (3)</option>
                <option value="4">Catastrophic (4)</option>
            </select>
        </td>
        <td class="risk-score">9</td>
        <td><input type="text" placeholder="Mitigation plan"></td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this); updateRiskStats();">Remove</button></td>
    `;
    tbody.appendChild(newRow);
    updateRiskStats();
}

function updateRiskScore(element) {
    const row = element.closest('tr');
    const probability = parseInt(row.children[2].querySelector('select').value) || 0;
    const impact = parseInt(row.children[3].querySelector('select').value) || 0;
    const riskScore = probability * impact;
    
    row.children[4].textContent = riskScore;
    row.children[4].className = 'risk-score ' + getRiskScoreLevel(riskScore);
    
    updateRiskStats();
}

function getRiskScoreLevel(score) {
    if (score >= 12) return 'critical';
    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
}

function updateRiskStats() {
    const rows = document.querySelectorAll('#risk-tbody tr');
    let total = 0, critical = 0, high = 0, medium = 0, low = 0;
    let totalScore = 0;
    
    rows.forEach(row => {
        if (row.children.length > 0) {
            total++;
            const riskScore = parseInt(row.children[4].textContent) || 0;
            totalScore += riskScore;
            
            if (riskScore >= 12) critical++;
            else if (riskScore >= 8) high++;
            else if (riskScore >= 4) medium++;
            else low++;
        }
    });
    
    document.getElementById('total-risks').textContent = total;
    document.getElementById('critical-risks').textContent = critical;
    document.getElementById('high-risks').textContent = high;
    document.getElementById('avg-risk-score').textContent = total > 0 ? (totalScore / total).toFixed(1) : '0.0';
}

// Generic remove row function
function removeRow(button) {
    button.closest('tr').remove();
}

// Export to Excel
async function exportToExcel() {
    try {
        // Show loading overlay
        if (window.LoadingOverlay) {
            LoadingOverlay.show('📊 Generating Excel file...');
        }
        
        const wb = XLSX.utils.book_new();
        
        // Export each tab as a worksheet
        const tabs = [
            { id: 'vulnerability-tbody', name: 'Vulnerabilities' },
            { id: 'compliance-tbody', name: 'Compliance' },
            { id: 'iam-tbody', name: 'IAM' },
            { id: 'network-tbody', name: 'Network Security' },
            { id: 'data-tbody', name: 'Data Protection' },
            { id: 'incident-tbody', name: 'Incidents' },
            { id: 'cloud-tbody', name: 'Cloud Security' },
            { id: 'risk-tbody', name: 'Risk Register' }
        ];
        
        tabs.forEach(tab => {
            const table = document.getElementById(tab.id);
            if (table) {
                const ws = XLSX.utils.table_to_sheet(table.closest('table'));
                XLSX.utils.book_append_sheet(wb, ws, tab.name);
            }
        });
        
        // Add summary sheet
        const summaryData = [
            ['Security Audit Summary', ''],
            ['Generated on', new Date().toLocaleDateString()],
            ['', ''],
            ['Metric', 'Value'],
            ['Total Vulnerabilities', document.getElementById('total-vulns')?.textContent || '0'],
            ['Critical Vulnerabilities', document.getElementById('critical-vulns')?.textContent || '0'],
            ['Compliance Rate', document.getElementById('compliance-rate')?.textContent || '0%'],
            ['MFA Coverage', document.getElementById('mfa-coverage')?.textContent || '0%'],
            ['Total Incidents', document.getElementById('total-incidents')?.textContent || '0'],
            ['Critical Risks', document.getElementById('critical-risks')?.textContent || '0']
        ];
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        
        XLSX.writeFile(wb, 'security-audit-report.xlsx');
        
        // Hide loading and show success
        if (window.LoadingOverlay) {
            LoadingOverlay.hide();
        }
        if (window.notify) {
            window.notify.show('✅ Excel file downloaded successfully!', 'success');
        }
    } catch (error) {
        // Hide loading and show error
        if (window.LoadingOverlay) {
            LoadingOverlay.hide();
        }
        if (window.notify) {
            window.notify.show('❌ Export failed: ' + error.message, 'error');
        }
    }
}

// Save Progress
function saveProgress() {
    // Use the auto-save system's manual save
    if (window.autoSave && window.autoSave.manualSave) {
        window.autoSave.manualSave();
        return;
    }
    // Fallback to original implementation
    const data = collectAllData();
    localStorage.setItem('securityAuditData', JSON.stringify(data));
    
    // Show success notification
    if (window.notify) {
        window.notify.show('✅ Progress saved successfully!', 'success');
    }
}

// Share Results Function
function shareResults() {
    const data = collectAllData();
    const link = generateShareableLink(data);
    showLinkModal(link);
}

// Make restoreData globally accessible for auto-save
window.restoreData = function restoreData(data) {
    if (!data) return;
    
    try {
        // Restore maturity assessment scores
        if (data.maturityAssessment) {
            Object.keys(data.maturityAssessment).forEach(questionId => {
                const element = document.getElementById(questionId);
                if (element) {
                    element.value = data.maturityAssessment[questionId];
                }
            });
            calculateSecurityMaturity();
        }
        
        // Restore form inputs by ID
        if (data.formInputs) {
            Object.keys(data.formInputs).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = data.formInputs[id];
                }
            });
        }
        
        // Recalculate all scores
        setTimeout(() => {
            calculateSecurityMaturity();
            updateVulnerabilityStats();
            updateComplianceStats();
            updateIAMStats();
            updateIncidentResponseStats();
            updateRiskStats();
        }, 200);
    } catch (error) {
        console.error('Error restoring data:', error);
    }
}

// Load Saved Data
function loadSavedData() {
    const savedData = localStorage.getItem('securityAuditData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('Loading saved data...', data);
            
            // Use the restoreData function
            window.restoreData(data);
            
            // Show success message
            showDataLoadedMessage();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function showDataLoadedMessage() {
    const message = document.createElement('div');
    message.className = 'alert alert-success';
    message.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 1000; padding: 1rem 2rem; background: #10b981; color: white; border-radius: 8px; animation: slideIn 0.3s;';
    message.textContent = '✓ Previous progress loaded successfully!';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
}

// Load from URL
function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
        try {
            const data = JSON.parse(atob(dataParam));
            populateAllData(data);
            return true;
        } catch (e) {
            console.error('Error loading data from URL:', e);
        }
    }
    return false;
}

// Make collectAllData globally accessible for auto-save
window.collectAllData = function collectAllData() {
    const data = {
        formInputs: {},
        timestamp: new Date().toISOString()
    };
    
    // Collect all form inputs by ID
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(element => {
        if (element.id) {
            data.formInputs[element.id] = element.value;
        }
    });
    
    // Collect maturity assessment data
    if (window.securityDimensions) {
        data.maturityAssessment = {};
        Object.keys(window.securityDimensions).forEach(dimension => {
            window.securityDimensions[dimension].questions.forEach(question => {
                const element = document.getElementById(question.id);
                if (element) {
                    data.maturityAssessment[question.id] = element.value;
                }
            });
        });
    }
    
    // Collect table data
    const tables = ['vulnerability-tbody', 'compliance-tbody', 'iam-tbody', 
                   'network-tbody', 'data-tbody', 'incident-tbody', 
                   'cloud-tbody', 'risk-tbody'];
    
    tables.forEach(tableId => {
        const tbody = document.getElementById(tableId);
        if (tbody) {
            data[tableId] = [];
            tbody.querySelectorAll('tr').forEach(row => {
                const rowData = [];
                row.querySelectorAll('input, select').forEach(input => {
                    rowData.push(input.value);
                });
                if (rowData.length > 0) {
                    data[tableId].push(rowData);
                }
            });
        }
    });
    
    return data;
}

// Populate all form data
function populateAllData(data) {
    // Populate maturity assessment
    if (data.maturityAssessment) {
        Object.keys(data.maturityAssessment).forEach(questionId => {
            const element = document.getElementById(questionId);
            if (element) {
                element.value = data.maturityAssessment[questionId];
            }
        });
        calculateSecurityMaturity();
    }
    
    // Populate table data
    Object.keys(data).forEach(key => {
        if (key.endsWith('-tbody') && Array.isArray(data[key])) {
            const tbody = document.getElementById(key);
            if (tbody) {
                // Clear existing rows except the first one
                while (tbody.children.length > 1) {
                    tbody.removeChild(tbody.lastChild);
                }
                
                // Populate data
                data[key].forEach((rowData, index) => {
                    if (index === 0 && tbody.children.length > 0) {
                        // Update first row
                        const row = tbody.children[0];
                        const inputs = row.querySelectorAll('input, select');
                        inputs.forEach((input, i) => {
                            if (rowData[i] !== undefined) {
                                input.value = rowData[i];
                            }
                        });
                    } else {
                        // Add new row
                        const addFunctionName = key.replace('-tbody', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + 'Row';
                        const addFunctionMapping = {
                            'vulnerabilityRow': addVulnerabilityRow,
                            'complianceRow': addComplianceRow,
                            'iamRow': addIAMRow,
                            'networkRow': addNetworkSecurityRow,
                            'dataRow': addDataProtectionRow,
                            'incidentRow': addIncidentRow,
                            'cloudRow': addCloudSecurityRow,
                            'riskRow': addRiskRow
                        };
                        
                        if (addFunctionMapping[addFunctionName]) {
                            addFunctionMapping[addFunctionName]();
                            
                            // Populate the new row
                            const newRow = tbody.lastElementChild;
                            const inputs = newRow.querySelectorAll('input, select');
                            inputs.forEach((input, i) => {
                                if (rowData[i] !== undefined) {
                                    input.value = rowData[i];
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    
    // Update all calculations
    initializeCalculations();
}

// Generate Report
function generateReport() {
    const reportWindow = window.open('', '_blank');
    const reportContent = generateReportHTML();
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
}

function generateReportHTML() {
    const currentDate = new Date().toLocaleDateString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Security Audit Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #dc2626; color: white; }
                .critical { color: #dc2626; font-weight: bold; }
                .high { color: #ef4444; font-weight: bold; }
                .medium { color: #f59e0b; font-weight: bold; }
                .low { color: #10b981; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔒 Security Audit Report</h1>
                <p>Generated on: ${currentDate}</p>
            </div>
            
            <div class="section">
                <h2>Executive Summary</h2>
                <div class="metric">
                    <strong>Total Vulnerabilities:</strong> ${document.getElementById('total-vulns')?.textContent || '0'}
                </div>
                <div class="metric critical">
                    <strong>Critical Vulnerabilities:</strong> ${document.getElementById('critical-vulns')?.textContent || '0'}
                </div>
                <div class="metric">
                    <strong>Compliance Rate:</strong> ${document.getElementById('compliance-rate')?.textContent || '0%'}
                </div>
                <div class="metric">
                    <strong>MFA Coverage:</strong> ${document.getElementById('mfa-coverage')?.textContent || '0%'}
                </div>
            </div>
            
            <div class="section">
                <h2>Risk Assessment</h2>
                <div class="metric">
                    <strong>Total Risks:</strong> ${document.getElementById('total-risks')?.textContent || '0'}
                </div>
                <div class="metric critical">
                    <strong>Critical Risks:</strong> ${document.getElementById('critical-risks')?.textContent || '0'}
                </div>
                <div class="metric">
                    <strong>Average Risk Score:</strong> ${document.getElementById('avg-risk-score')?.textContent || '0.0'}
                </div>
            </div>
            
            <div class="section">
                <h2>Recommendations</h2>
                <ul>
                    <li>Address all critical vulnerabilities immediately</li>
                    <li>Implement MFA across all systems</li>
                    <li>Enhance network segmentation</li>
                    <li>Improve incident response procedures</li>
                    <li>Regular security awareness training</li>
                </ul>
            </div>
        </body>
        </html>
    `;
}

// Reset Calculator
function resetCalculator() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.removeItem('securityAuditData');
        
        // Clear auto-save if available
        if (window.autoSave) {
            window.autoSave.clearSaved();
        }
        
        // Show notification
        if (window.notify) {
            window.notify.show('🔄 Calculator reset successfully', 'info');
        }
        
        location.reload();
    }
}

// URL Sharing Functions
function generateShareableLink(data) {
    const compressed = compressData(data);
    const encoded = btoa(compressed);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?data=${encoded}`;
}

function compressData(data) {
    const compressed = {
        m: {}, // maturity scores
        v: [], // vulnerability data
        c: [], // compliance data
        i: [], // iam data
        r: [], // risk data
        t: new Date().toISOString().split('T')[0]
    };
    
    // Compress maturity assessment data
    if (data.maturityAssessment) {
        Object.keys(data.maturityAssessment).forEach(key => {
            compressed.m[key] = data.maturityAssessment[key];
        });
    }
    
    // Compress vulnerability data (limit to 10 items)
    if (data['vulnerability-tbody']) {
        data['vulnerability-tbody'].slice(0, 10).forEach(item => {
            compressed.v.push({
                s: item[1], // severity
                c: item[2], // cvss
                st: item[4] // status
            });
        });
    }
    
    return JSON.stringify(compressed);
}

function showLinkModal(link) {
    const existingModal = document.getElementById('link-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'link-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
            <h3 style="margin-top: 0; color: #dc2626;">Share Your Security Assessment</h3>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">Your progress has been saved! Share this link to let others view your assessment or continue from where you left off.</p>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Shareable Link:</label>
                <input type="text" id="share-link" value="${link}" readonly 
                       style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 0.875rem;">
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button onclick="closeModal()" 
                        style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; background: white; border-radius: 8px; cursor: pointer;">Cancel</button>
                <button onclick="shareViaEmail('${encodeURIComponent(link)}')" 
                        style="padding: 0.75rem 1.5rem; border: 1px solid #dc2626; background: #dc2626; color: white; border-radius: 8px; cursor: pointer;">Email</button>
                <button onclick="copyLink()" 
                        style="padding: 0.75rem 1.5rem; border: none; background: #dc2626; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">Copy Link</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function copyLink() {
    const linkInput = document.getElementById('share-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#dc2626';
        }, 2000);
    } catch (err) {
        navigator.clipboard.writeText(linkInput.value);
    }
}

function shareViaEmail(link) {
    const subject = 'Security Audit Assessment - Saved Progress';
    const body = `Here's my Security Audit Assessment progress:\n\n${decodeURIComponent(link)}\n\nClick the link to view or continue the assessment.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function closeModal() {
    const modal = document.getElementById('link-modal');
    if (modal) modal.remove();
}

// Print functionality
window.addEventListener('beforeprint', function() {
    // Make all tabs visible for printing
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'block';
    });
});

window.addEventListener('afterprint', function() {
    // Restore tab visibility
    document.querySelectorAll('.tab-content').forEach((tab, index) => {
        if (index === 0 || tab.classList.contains('active')) {
            tab.style.display = 'block';
        } else {
            tab.style.display = 'none';
        }
    });
});

// Export functions to global scope for HTML onclick handlers
window.addVulnerabilityRow = addVulnerabilityRow;
window.addComplianceRow = addComplianceRow;
window.addIAMRow = addIAMRow;
window.addNetworkSecurityRow = addNetworkSecurityRow;
window.addDataProtectionRow = addDataProtectionRow;
window.addIncidentRow = addIncidentRow;
window.addCloudSecurityRow = addCloudSecurityRow;
window.addRiskRow = addRiskRow;
window.removeRow = removeRow;
window.updateRiskScore = updateRiskScore;
window.exportToExcel = exportToExcel;
window.saveProgress = saveProgress;
window.shareResults = shareResults;
window.resetCalculator = resetCalculator;
window.generateReport = generateReport;
window.calculateSecurityMaturity = calculateSecurityMaturity;
window.generateShareableLink = generateShareableLink;
window.compressData = compressData;
window.showLinkModal = showLinkModal;
window.copyLink = copyLink;
window.shareViaEmail = shareViaEmail;
window.closeModal = closeModal;