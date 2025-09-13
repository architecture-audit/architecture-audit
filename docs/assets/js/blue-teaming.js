// Blue Team Security Assessment Calculator
// Comprehensive defensive security assessment for Traditional IT, Cloud, and AI/ML environments

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeBlueTeaming();
    setupEventListeners();
    loadSavedData();
    switchContext(); // Set initial context
});

// Global state
let blueTeamData = {
    context: 'traditional',
    scores: {},
    recommendations: []
};

// Context-specific weights for different environments
const contextWeights = {
    traditional: {
        detection: 0.20,
        response: 0.18,
        hunting: 0.15,
        siem: 0.17,
        forensics: 0.15,
        purple: 0.15
    },
    cloud: {
        detection: 0.22,
        response: 0.18,
        hunting: 0.15,
        siem: 0.18,
        forensics: 0.12,
        purple: 0.15
    },
    aiml: {
        detection: 0.25, // Critical for AI/ML monitoring
        response: 0.18,
        hunting: 0.15,
        siem: 0.17,
        forensics: 0.10,
        purple: 0.15
    },
    hybrid: {
        detection: 0.21,
        response: 0.18,
        hunting: 0.15,
        siem: 0.18,
        forensics: 0.13,
        purple: 0.15
    }
};

// Maturity level definitions
const maturityLevels = {
    0: { name: 'Reactive', description: 'Ad-hoc, reactive security operations', class: 'reactive' },
    25: { name: 'Managed', description: 'Basic processes and tools implemented', class: 'managed' },
    50: { name: 'Defined', description: 'Structured and documented processes', class: 'defined' },
    75: { name: 'Quantitative', description: 'Measured and optimized operations', class: 'quantitative' },
    100: { name: 'Optimizing', description: 'Continuous improvement and innovation', class: 'optimizing' }
};

// Comprehensive recommendations database
const recommendationsDatabase = {
    detection: {
        critical: [
            "Deploy EDR/XDR solutions across all endpoints with 95%+ coverage",
            "Implement network detection and response (NDR) for east-west traffic monitoring",
            "Establish 24/7 security operations center (SOC) monitoring",
            "Deploy cloud security posture management (CSPM) for multi-cloud environments",
            "Implement AI/ML model monitoring and drift detection capabilities"
        ],
        high: [
            "Enhance behavioral analytics and anomaly detection capabilities",
            "Implement container and Kubernetes security monitoring",
            "Deploy deception technology and honeypots",
            "Establish threat intelligence feeds integration",
            "Implement user and entity behavior analytics (UEBA)"
        ],
        medium: [
            "Optimize alert tuning and reduce false positives",
            "Implement DNS monitoring and analytics",
            "Deploy file integrity monitoring (FIM)",
            "Enhance email security monitoring",
            "Implement certificate and TLS monitoring"
        ],
        low: [
            "Implement asset discovery and inventory management",
            "Deploy vulnerability scanning and assessment",
            "Enhance log collection and retention policies",
            "Implement configuration compliance monitoring",
            "Deploy shadow IT discovery capabilities"
        ]
    },
    response: {
        critical: [
            "Develop and test comprehensive incident response playbooks",
            "Establish dedicated incident response team with 24/7 availability",
            "Implement automated containment and isolation capabilities",
            "Create executive crisis communication plans",
            "Establish legal and regulatory compliance procedures"
        ],
        high: [
            "Implement SOAR platform for response orchestration",
            "Develop threat-specific response procedures",
            "Establish evidence collection and chain of custody procedures",
            "Create business continuity and disaster recovery integration",
            "Implement threat intelligence-driven response"
        ],
        medium: [
            "Enhance cross-functional coordination and communication",
            "Implement response metrics and KPI tracking",
            "Develop tabletop exercise program",
            "Create vendor and third-party coordination procedures",
            "Implement post-incident review and lessons learned process"
        ],
        low: [
            "Document standard operating procedures (SOPs)",
            "Create incident classification and prioritization framework",
            "Implement response team training and certification",
            "Establish communication templates and procedures",
            "Create incident documentation and reporting templates"
        ]
    },
    hunting: {
        critical: [
            "Establish dedicated threat hunting team with advanced skills",
            "Implement threat hunting platform with comprehensive data access",
            "Develop hypothesis-driven hunting methodology",
            "Establish threat intelligence integration and analysis",
            "Create custom detection rules from hunting findings"
        ],
        high: [
            "Implement behavioral analytics and statistical modeling",
            "Develop adversary emulation and TTPs analysis",
            "Establish hunting metrics and effectiveness measurement",
            "Create threat landscape and attribution analysis",
            "Implement collaborative hunting with external partners"
        ],
        medium: [
            "Enhance data visualization and hunting dashboards",
            "Implement hunting automation and orchestration",
            "Develop hunting playbooks and procedures",
            "Create threat hunting training and certification program",
            "Establish hunting research and development capabilities"
        ],
        low: [
            "Document hunting processes and methodologies",
            "Implement basic hunting tools and techniques",
            "Create hunting team structure and responsibilities",
            "Establish hunting data sources and access",
            "Implement hunting result tracking and validation"
        ]
    },
    siem: {
        critical: [
            "Deploy comprehensive SIEM with all critical log sources",
            "Implement advanced correlation rules and analytics",
            "Establish real-time monitoring and alerting",
            "Deploy SOAR platform for automated response",
            "Implement threat intelligence integration"
        ],
        high: [
            "Enhance UEBA capabilities and user risk scoring",
            "Implement advanced persistent threat (APT) detection",
            "Deploy machine learning-based anomaly detection",
            "Establish security metrics and KPI dashboards",
            "Implement cross-platform security orchestration"
        ],
        medium: [
            "Optimize log parsing and normalization",
            "Implement advanced search and investigation capabilities",
            "Enhance reporting and compliance automation",
            "Deploy security data lake architecture",
            "Implement log retention and archival policies"
        ],
        low: [
            "Standardize log formats and collection methods",
            "Implement basic correlation rules and alerts",
            "Create SIEM administration and maintenance procedures",
            "Establish log source inventory and coverage assessment",
            "Implement SIEM backup and disaster recovery"
        ]
    },
    forensics: {
        critical: [
            "Establish dedicated digital forensics laboratory",
            "Develop comprehensive forensic investigation procedures",
            "Implement automated evidence collection and preservation",
            "Establish legal-grade chain of custody processes",
            "Create forensic analysis and reporting capabilities"
        ],
        high: [
            "Implement memory forensics and live analysis capabilities",
            "Develop malware analysis and reverse engineering capabilities",
            "Establish timeline reconstruction and correlation analysis",
            "Implement network forensics and packet analysis",
            "Create mobile and IoT forensics capabilities"
        ],
        medium: [
            "Enhance forensic tool integration and automation",
            "Implement cloud forensics and virtualization analysis",
            "Develop forensic case management and tracking",
            "Create forensic training and certification program",
            "Establish forensic quality assurance and validation"
        ],
        low: [
            "Document forensic procedures and methodologies",
            "Implement basic forensic tools and techniques",
            "Create evidence handling and storage procedures",
            "Establish forensic team structure and responsibilities",
            "Implement forensic tool validation and calibration"
        ]
    },
    purple: {
        critical: [
            "Establish regular purple team exercise program",
            "Implement MITRE ATT&CK framework-based testing",
            "Develop threat actor emulation capabilities",
            "Create red-blue team collaboration framework",
            "Establish purple team metrics and assessment"
        ],
        high: [
            "Implement automated adversary simulation platforms",
            "Develop custom attack scenario development",
            "Establish continuous security validation program",
            "Create purple team training and skill development",
            "Implement gap analysis and remediation tracking"
        ],
        medium: [
            "Enhance exercise planning and coordination",
            "Implement exercise documentation and reporting",
            "Create stakeholder communication and engagement",
            "Establish vendor and tool validation testing",
            "Implement knowledge sharing and lessons learned"
        ],
        low: [
            "Document purple team processes and procedures",
            "Create basic attack simulation capabilities",
            "Establish exercise scheduling and resource allocation",
            "Implement basic red-blue team coordination",
            "Create purple team charter and governance"
        ]
    }
};

// Initialize the application
function initializeBlueTeaming() {
    console.log('Initializing Blue Team Security Assessment...');
    
    // Initialize tabs
    setupTabs();
    
    // Initialize form elements
    initializeFormElements();
    
    // Set default values
    resetToDefaults();
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Form changes
    document.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT' && e.target.id !== 'assessment-context') {
            saveFormData();
            // Auto-calculate on changes (optional)
            // calculateBlueTeamScore();
        }
    });
    
    // Context switching
    const contextSelect = document.getElementById('assessment-context');
    if (contextSelect) {
        contextSelect.addEventListener('change', switchContext);
    }
}

// Setup tabs functionality
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Update URL hash
    window.location.hash = tabName;
    
    // Remove active class from all tabs and content
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    const activeTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);
    
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeContent.classList.add('active');
    }
}

// Switch context (Traditional IT, Cloud, AI/ML, Hybrid)
function switchContext() {
    const contextSelect = document.getElementById('assessment-context');
    const contextInfo = document.getElementById('context-info');
    
    if (!contextSelect) return;
    
    const selectedContext = contextSelect.value;
    blueTeamData.context = selectedContext;
    
    // Update context info text
    const contextTexts = {
        traditional: 'Assessing traditional IT defensive operations',
        cloud: 'Assessing cloud-native security operations',
        aiml: 'Assessing AI/ML security monitoring and operations',
        hybrid: 'Assessing hybrid multi-environment operations'
    };
    
    if (contextInfo) {
        contextInfo.textContent = contextTexts[selectedContext] || contextTexts.traditional;
    }
    
    // Show/hide context-specific sections
    showContextSections(selectedContext);
    
    // Save context change
    saveFormData();
    
    console.log('Context switched to:', selectedContext);
}

// Show context-specific sections
function showContextSections(context) {
    const contextSections = document.querySelectorAll('.context-section');
    
    contextSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show sections for current context
    const activeContextSections = document.querySelectorAll(`.${context}-context`);
    activeContextSections.forEach(section => {
        section.style.display = 'block';
        section.classList.add('active');
    });
    
    // Always show non-context-specific sections
    const genericSections = document.querySelectorAll('.context-section:not(.traditional-context):not(.cloud-context):not(.aiml-context):not(.hybrid-context)');
    genericSections.forEach(section => {
        section.style.display = 'block';
        section.classList.add('active');
    });
}

// Initialize form elements
function initializeFormElements() {
    // Initialize all select elements with default values
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        if (select.id !== 'assessment-context') {
            select.value = '0'; // Default to lowest maturity
        }
    });
}

// Calculate Blue Team maturity score
function calculateBlueTeamScore() {
    const context = blueTeamData.context;
    const weights = contextWeights[context];
    
    // Calculate category scores
    const categoryScores = {
        detection: calculateCategoryScore('detection'),
        response: calculateCategoryScore('response'),
        hunting: calculateCategoryScore('hunting'),
        siem: calculateCategoryScore('siem'),
        forensics: calculateCategoryScore('forensics'),
        purple: calculateCategoryScore('purple')
    };
    
    // Calculate overall weighted score
    let overallScore = 0;
    for (const [category, score] of Object.entries(categoryScores)) {
        overallScore += score * weights[category];
    }
    
    // Store scores
    blueTeamData.scores = {
        overall: Math.round(overallScore),
        categories: categoryScores
    };
    
    // Generate recommendations
    generateRecommendations();
    
    // Update UI
    updateScoreDisplay();
    updateCategoryBreakdown();
    updateRecommendations();
    
    console.log('Blue Team Assessment Results:', blueTeamData.scores);
}

// Calculate score for a specific category
function calculateCategoryScore(category) {
    const formElements = document.querySelectorAll(`select[id*="${category}"], select[id^="${blueTeamData.context}-${category}"]`);
    
    if (formElements.length === 0) {
        // Fallback: look for any elements containing the category name
        const fallbackElements = document.querySelectorAll(`select[id*="${category}"]`);
        if (fallbackElements.length === 0) return 0;
        
        let total = 0;
        fallbackElements.forEach(element => {
            total += parseInt(element.value) || 0;
        });
        return Math.round(total / fallbackElements.length);
    }
    
    let total = 0;
    let count = 0;
    
    formElements.forEach(element => {
        // Only count visible elements (active context)
        if (element.offsetParent !== null) {
            total += parseInt(element.value) || 0;
            count++;
        }
    });
    
    return count > 0 ? Math.round(total / count) : 0;
}

// Generate recommendations based on scores
function generateRecommendations() {
    blueTeamData.recommendations = [];
    
    const categories = ['detection', 'response', 'hunting', 'siem', 'forensics', 'purple'];
    
    categories.forEach(category => {
        const score = blueTeamData.scores.categories[category];
        let priority;
        
        if (score < 25) priority = 'critical';
        else if (score < 50) priority = 'high';
        else if (score < 75) priority = 'medium';
        else priority = 'low';
        
        // Add recommendations for this category and priority
        const categoryRecommendations = recommendationsDatabase[category][priority];
        if (categoryRecommendations) {
            categoryRecommendations.forEach(rec => {
                blueTeamData.recommendations.push({
                    category: category,
                    priority: priority,
                    text: rec,
                    score: score
                });
            });
        }
    });
    
    // Sort by priority and score
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    blueTeamData.recommendations.sort((a, b) => {
        if (a.priority !== b.priority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.score - b.score;
    });
    
    // Limit to top 10 recommendations
    blueTeamData.recommendations = blueTeamData.recommendations.slice(0, 10);
}

// Update score display
function updateScoreDisplay() {
    const overallScore = blueTeamData.scores.overall;
    
    // Update overall score
    const scoreElement = document.getElementById('overall-score');
    if (scoreElement) {
        scoreElement.textContent = overallScore;
        scoreElement.className = 'score-value ' + getScoreClass(overallScore);
    }
    
    // Update defensive posture
    const defensiveLevel = document.getElementById('defensive-level');
    if (defensiveLevel) {
        const maturity = getMaturityLevel(overallScore);
        defensiveLevel.textContent = maturity.name;
        defensiveLevel.className = 'score-value ' + maturity.class;
    }
    
    // Update readiness percentage
    const readinessScore = document.getElementById('readiness-score');
    if (readinessScore) {
        readinessScore.textContent = overallScore + '%';
        readinessScore.className = 'score-value ' + getScoreClass(overallScore);
    }
    
    // Update context display
    const contextType = document.getElementById('context-type');
    if (contextType) {
        const contextNames = {
            traditional: 'Traditional IT',
            cloud: 'Cloud',
            aiml: 'AI/ML',
            hybrid: 'Hybrid'
        };
        contextType.textContent = contextNames[blueTeamData.context] || 'Traditional IT';
    }
}

// Update category breakdown
function updateCategoryBreakdown() {
    const breakdownElement = document.getElementById('category-breakdown');
    if (!breakdownElement) return;
    
    const categories = {
        detection: '🎯 Detection & Monitoring',
        response: '⚡ Incident Response',
        hunting: '🔍 Threat Hunting',
        siem: '📊 SIEM/SOAR',
        forensics: '🔬 Digital Forensics',
        purple: '🟣 Purple Team'
    };
    
    let html = '';
    for (const [key, name] of Object.entries(categories)) {
        const score = blueTeamData.scores.categories[key];
        const maturity = getMaturityLevel(score);
        html += `
            <div class="category-score-item">
                <span>${name}</span>
                <span>${score}<small>/100</small></span>
            </div>
        `;
    }
    
    breakdownElement.innerHTML = html;
}

// Update recommendations display
function updateRecommendations() {
    const recommendationsElement = document.getElementById('recommendations-list');
    if (!recommendationsElement) return;
    
    if (blueTeamData.recommendations.length === 0) {
        recommendationsElement.innerHTML = '<p>Complete the assessment to receive personalized recommendations.</p>';
        return;
    }
    
    let html = '';
    blueTeamData.recommendations.forEach((rec, index) => {
        const categoryNames = {
            detection: 'Detection',
            response: 'Response',
            hunting: 'Hunting',
            siem: 'SIEM/SOAR',
            forensics: 'Forensics',
            purple: 'Purple Team'
        };
        
        html += `
            <div class="recommendation-item ${rec.priority}">
                <div class="priority-badge ${rec.priority}">${rec.priority}</div>
                <strong>${categoryNames[rec.category]}:</strong> ${rec.text}
            </div>
        `;
    });
    
    recommendationsElement.innerHTML = html;
}

// Helper functions
function getScoreClass(score) {
    if (score < 25) return 'critical';
    if (score < 50) return 'warning';
    if (score < 75) return 'info';
    return 'success';
}

function getMaturityLevel(score) {
    if (score >= 90) return maturityLevels[100];
    if (score >= 65) return maturityLevels[75];
    if (score >= 40) return maturityLevels[50];
    if (score >= 15) return maturityLevels[25];
    return maturityLevels[0];
}

// Save form data to localStorage
function saveFormData() {
    const formData = {
        context: blueTeamData.context,
        values: {}
    };
    
    document.querySelectorAll('select').forEach(select => {
        formData.values[select.id] = select.value;
    });
    
    localStorage.setItem('blueTeamAssessment', JSON.stringify(formData));
}

// Load saved data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('blueTeamAssessment');
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        // Restore context
        if (formData.context) {
            blueTeamData.context = formData.context;
            const contextSelect = document.getElementById('assessment-context');
            if (contextSelect) {
                contextSelect.value = formData.context;
            }
        }
        
        // Restore form values
        if (formData.values) {
            Object.entries(formData.values).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value;
                }
            });
        }
        
        switchContext();
        
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

// Save progress
function saveProgress() {
    saveFormData();
    
    // Show confirmation
    const button = document.querySelector('button[onclick="saveProgress()"]');
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✅ Progress Saved';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }
}

// Export results
function exportResults() {
    if (!blueTeamData.scores.overall) {
        alert('Please calculate the assessment first.');
        return;
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        context: blueTeamData.context,
        scores: blueTeamData.scores,
        recommendations: blueTeamData.recommendations,
        maturityLevel: getMaturityLevel(blueTeamData.scores.overall)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `blue-team-assessment-${data.context}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Reset assessment
function resetAssessment() {
    if (confirm('Are you sure you want to reset the entire assessment? This will clear all your responses.')) {
        // Clear localStorage
        localStorage.removeItem('blueTeamAssessment');
        
        // Reset form
        document.querySelectorAll('select').forEach(select => {
            if (select.id !== 'assessment-context') {
                select.value = '0';
            }
        });
        
        // Reset context to default
        const contextSelect = document.getElementById('assessment-context');
        if (contextSelect) {
            contextSelect.value = 'traditional';
        }
        
        // Clear scores and recommendations
        blueTeamData.scores = {};
        blueTeamData.recommendations = [];
        
        // Update UI
        document.getElementById('overall-score').textContent = '0';
        document.getElementById('defensive-level').textContent = 'Reactive';
        document.getElementById('readiness-score').textContent = '0%';
        document.getElementById('category-breakdown').innerHTML = '';
        document.getElementById('recommendations-list').innerHTML = '<p>Complete the assessment to receive personalized recommendations.</p>';
        
        // Switch back to default context
        switchContext();
        
        // Switch to first tab
        switchTab('detection');
    }
}

// Reset to defaults
function resetToDefaults() {
    document.getElementById('overall-score').textContent = '0';
    document.getElementById('defensive-level').textContent = 'Reactive';
    document.getElementById('readiness-score').textContent = '0%';
    document.getElementById('context-type').textContent = 'Traditional IT';
    document.getElementById('recommendations-list').innerHTML = '<p>Complete the assessment to receive personalized recommendations.</p>';
}

// Handle browser back/forward with hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        switchTab(hash);
    }
});

// Initialize with hash if present
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        switchTab(hash);
    }
});

// Export functions for global access
window.calculateBlueTeamScore = calculateBlueTeamScore;
window.exportResults = exportResults;
window.saveProgress = saveProgress;
window.resetAssessment = resetAssessment;
window.switchContext = switchContext;