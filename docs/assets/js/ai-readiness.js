// AI Readiness Calculator JavaScript

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeMaturityAssessment();
    initializeCalculations();
    
    // Initialize auto-save with retry logic
    function initAutoSave() {
        if (window.AutoSave) {
            console.log('✅ AutoSave class found, initializing...');
            window.autoSave = new AutoSave('ai-readiness', 15000); // Auto-save every 15 seconds
            console.log('✅ Auto-save initialized for ai-readiness');
            return true;
        }
        return false;
    }
    
    // Try to initialize immediately
    if (!initAutoSave()) {
        console.log('⏳ AutoSave not ready, retrying...');
        // Retry after a delay for bundle to load
        setTimeout(() => {
            if (!initAutoSave()) {
                // Try once more
                setTimeout(() => {
                    if (!initAutoSave()) {
                        console.log('⚠️ AutoSave not available for ai-readiness');
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

// Initialize Maturity Assessment with Questions
function initializeMaturityAssessment() {
    const assessmentContainer = document.getElementById('maturity-assessment-container');
    if (!assessmentContainer) return;
    
    const dimensions = {
        'Data & Infrastructure': {
            questions: [
                { id: 'data_quality', text: 'How would you rate your data quality and completeness?', weight: 0.2 },
                { id: 'data_governance', text: 'Do you have established data governance policies?', weight: 0.15 },
                { id: 'data_infrastructure', text: 'Is your data infrastructure scalable and cloud-ready?', weight: 0.2 },
                { id: 'data_integration', text: 'How well integrated are your data sources?', weight: 0.15 },
                { id: 'data_security', text: 'How robust are your data security measures?', weight: 0.15 },
                { id: 'data_accessibility', text: 'How easily can teams access needed data?', weight: 0.15 }
            ]
        },
        'Technology & Tools': {
            questions: [
                { id: 'tech_stack', text: 'How modern is your technology stack?', weight: 0.2 },
                { id: 'ai_tools', text: 'Do you have AI/ML platforms and tools in place?', weight: 0.25 },
                { id: 'automation', text: 'What is your level of process automation?', weight: 0.15 },
                { id: 'cloud_adoption', text: 'How far along is your cloud adoption?', weight: 0.2 },
                { id: 'dev_practices', text: 'Do you follow modern development practices (CI/CD, DevOps)?', weight: 0.2 }
            ]
        },
        'Skills & Talent': {
            questions: [
                { id: 'ai_expertise', text: 'Do you have in-house AI/ML expertise?', weight: 0.25 },
                { id: 'data_scientists', text: 'How many data scientists/ML engineers do you have?', weight: 0.2 },
                { id: 'training_programs', text: 'Do you have AI training programs for employees?', weight: 0.15 },
                { id: 'external_partners', text: 'Do you work with AI consultants or partners?', weight: 0.1 },
                { id: 'leadership_support', text: 'How strong is leadership support for AI initiatives?', weight: 0.15 },
                { id: 'cross_functional', text: 'Do you have cross-functional AI teams?', weight: 0.15 }
            ]
        },
        'Process & Governance': {
            questions: [
                { id: 'ai_strategy', text: 'Do you have a defined AI strategy?', weight: 0.25 },
                { id: 'use_case_process', text: 'Is there a process for identifying AI use cases?', weight: 0.2 },
                { id: 'roi_measurement', text: 'Can you measure ROI of AI initiatives?', weight: 0.15 },
                { id: 'ethical_guidelines', text: 'Do you have AI ethics guidelines?', weight: 0.15 },
                { id: 'risk_management', text: 'Is there an AI risk management framework?', weight: 0.15 },
                { id: 'change_management', text: 'How effective is your change management?', weight: 0.1 }
            ]
        },
        'Culture & Leadership': {
            questions: [
                { id: 'innovation_culture', text: 'How strong is your culture of innovation?', weight: 0.2 },
                { id: 'data_driven', text: 'Are decisions data-driven across the organization?', weight: 0.25 },
                { id: 'experimentation', text: 'Is experimentation and failure tolerated?', weight: 0.15 },
                { id: 'executive_champion', text: 'Do you have executive AI champions?', weight: 0.2 },
                { id: 'collaboration', text: 'How well do teams collaborate on AI projects?', weight: 0.2 }
            ]
        },
        'Business Impact': {
            questions: [
                { id: 'current_ai_use', text: 'Are you currently using AI in production?', weight: 0.25 },
                { id: 'business_value', text: 'Have AI projects delivered measurable value?', weight: 0.25 },
                { id: 'customer_impact', text: 'Has AI improved customer experience?', weight: 0.15 },
                { id: 'operational_efficiency', text: 'Has AI improved operational efficiency?', weight: 0.15 },
                { id: 'competitive_advantage', text: 'Has AI provided competitive advantage?', weight: 0.2 }
            ]
        }
    };
    
    let html = '<div class="maturity-questions">';
    
    for (const [dimension, config] of Object.entries(dimensions)) {
        html += `
            <div class="dimension-section">
                <h3>${dimension}</h3>
                <div class="questions-grid">
        `;
        
        config.questions.forEach(question => {
            html += `
                <div class="question-item">
                    <label for="${question.id}">${question.text}</label>
                    <select id="${question.id}" class="maturity-question" 
                            data-dimension="${dimension}" 
                            data-weight="${question.weight}"
                            onchange="calculateMaturityScore()">
                        <option value="0">Not Started</option>
                        <option value="1">Initial/Ad-hoc</option>
                        <option value="2">Developing</option>
                        <option value="3">Defined</option>
                        <option value="4">Managed</option>
                        <option value="5">Optimized</option>
                    </select>
                    <div class="score-indicator" id="${question.id}_score">0</div>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="dimension-score">
                    <span>Dimension Score:</span>
                    <span class="score-value" id="${dimension.replace(/\s+/g, '_')}_score">0%</span>
                </div>
            </div>
        `;
    }
    
    html += `
        </div>
        <div class="overall-maturity-score">
            <h3>Overall AI Readiness Maturity Score</h3>
            <div class="score-display">
                <div class="score-gauge" id="maturity-gauge">
                    <div class="score-fill" id="maturity-fill" style="width: 0%">
                        <span id="maturity-percentage">0%</span>
                    </div>
                </div>
                <div class="maturity-level" id="maturity-level">Not Started</div>
            </div>
        </div>
    `;
    
    assessmentContainer.innerHTML = html;
}

// Calculate Maturity Score
function calculateMaturityScore() {
    const dimensions = {};
    let overallScore = 0;
    let dimensionCount = 0;
    
    // Group questions by dimension
    document.querySelectorAll('.maturity-question').forEach(select => {
        const dimension = select.dataset.dimension;
        const weight = parseFloat(select.dataset.weight) || 0;
        const value = parseInt(select.value) || 0;
        
        if (!dimensions[dimension]) {
            dimensions[dimension] = { total: 0, maxScore: 0 };
        }
        
        dimensions[dimension].total += value * weight;
        dimensions[dimension].maxScore += 5 * weight;
        
        // Update individual question score indicator
        const indicator = document.getElementById(select.id + '_score');
        if (indicator) {
            indicator.textContent = value;
            indicator.className = 'score-indicator score-' + getScoreClass(value * 20);
        }
    });
    
    // Calculate dimension scores
    for (const [dimension, scores] of Object.entries(dimensions)) {
        const dimensionScore = (scores.total / scores.maxScore) * 100;
        overallScore += dimensionScore;
        dimensionCount++;
        
        // Update dimension score display
        const scoreElement = document.getElementById(dimension.replace(/\s+/g, '_') + '_score');
        if (scoreElement) {
            scoreElement.textContent = dimensionScore.toFixed(1) + '%';
            scoreElement.className = 'score-value score-' + getScoreClass(dimensionScore);
        }
    }
    
    // Calculate overall score
    if (dimensionCount > 0) {
        overallScore = overallScore / dimensionCount;
    }
    
    // Update overall score display
    updateMaturityDisplay(overallScore);
    
    // Update radar chart if it exists
    updateRadarChart(dimensions);
    
    return overallScore;
}

// Update Maturity Display
function updateMaturityDisplay(score) {
    const fill = document.getElementById('maturity-fill');
    const percentage = document.getElementById('maturity-percentage');
    const level = document.getElementById('maturity-level');
    
    if (fill) {
        fill.style.width = score + '%';
        fill.className = 'score-fill score-' + getScoreClass(score);
    }
    
    if (percentage) {
        percentage.textContent = score.toFixed(1) + '%';
    }
    
    if (level) {
        level.textContent = getMaturityLevel(score);
        level.className = 'maturity-level level-' + getScoreClass(score);
    }
}

// Get Maturity Level Text
function getMaturityLevel(score) {
    if (score >= 80) return 'Optimized - AI Leader';
    if (score >= 60) return 'Managed - AI Enabled';
    if (score >= 40) return 'Defined - AI Aware';
    if (score >= 20) return 'Developing - AI Exploring';
    if (score > 0) return 'Initial - AI Curious';
    return 'Not Started';
}

// Get Score Class for Styling
function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'critical';
}

// Skills Gap Analysis Functions
function addSkillRow() {
    const tbody = document.getElementById('skills-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="e.g., Machine Learning"></td>
        <td>
            <select>
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Advanced</option>
                <option value="4">Expert</option>
            </select>
        </td>
        <td>
            <select>
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Advanced</option>
                <option value="4">Expert</option>
            </select>
        </td>
        <td class="gap-score">0</td>
        <td>
            <select>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
            </select>
        </td>
        <td><input type="text" placeholder="Training plan"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
    updateSkillsGap();
}

// Use Case Prioritization Functions
function addUseCaseRow() {
    const tbody = document.getElementById('usecase-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Use case name"></td>
        <td>
            <select>
                <option>Customer Service</option>
                <option>Operations</option>
                <option>Marketing</option>
                <option>Finance</option>
                <option>HR</option>
                <option>Product</option>
            </select>
        </td>
        <td>
            <select onchange="calculatePriority(this)">
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
            </select>
        </td>
        <td>
            <select onchange="calculatePriority(this)">
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
            </select>
        </td>
        <td>
            <select onchange="calculatePriority(this)">
                <option value="1">High</option>
                <option value="2">Medium</option>
                <option value="3">Low</option>
            </select>
        </td>
        <td class="priority-score">3</td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Data Readiness Functions
function addDataSourceRow() {
    const tbody = document.getElementById('data-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Data source name"></td>
        <td>
            <select>
                <option>Structured</option>
                <option>Unstructured</option>
                <option>Semi-structured</option>
                <option>Streaming</option>
            </select>
        </td>
        <td><input type="text" placeholder="e.g., 1TB"></td>
        <td>
            <select>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
            </select>
        </td>
        <td>
            <select>
                <option>Real-time</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
            </select>
        </td>
        <td>
            <select>
                <option>Ready</option>
                <option>Needs Cleaning</option>
                <option>Needs Integration</option>
                <option>Not Ready</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Infrastructure Assessment Functions
function addInfrastructureRow() {
    const tbody = document.getElementById('infra-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Component name"></td>
        <td>
            <select>
                <option>Compute</option>
                <option>Storage</option>
                <option>Network</option>
                <option>Database</option>
                <option>Analytics Platform</option>
            </select>
        </td>
        <td>
            <select>
                <option>Adequate</option>
                <option>Needs Upgrade</option>
                <option>Insufficient</option>
            </select>
        </td>
        <td>
            <select>
                <option>Yes</option>
                <option>Partial</option>
                <option>No</option>
            </select>
        </td>
        <td><input type="number" placeholder="0" min="0"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Vendor Selection Functions
function addVendorRow() {
    const tbody = document.getElementById('vendor-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Vendor name"></td>
        <td>
            <select>
                <option>AI Platform</option>
                <option>Data Platform</option>
                <option>ML Tools</option>
                <option>Consulting</option>
                <option>Training</option>
            </select>
        </td>
        <td>
            <input type="range" min="1" max="5" value="3" onchange="updateVendorScore(this)">
            <span class="range-value">3</span>
        </td>
        <td>
            <input type="range" min="1" max="5" value="3" onchange="updateVendorScore(this)">
            <span class="range-value">3</span>
        </td>
        <td>
            <input type="range" min="1" max="5" value="3" onchange="updateVendorScore(this)">
            <span class="range-value">3</span>
        </td>
        <td class="vendor-score">3.0</td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Risk Assessment Functions
function addRiskRow() {
    const tbody = document.getElementById('risk-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Risk description"></td>
        <td>
            <select>
                <option>Technical</option>
                <option>Business</option>
                <option>Regulatory</option>
                <option>Security</option>
                <option>Ethical</option>
            </select>
        </td>
        <td>
            <select onchange="updateRiskScore(this)">
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
            </select>
        </td>
        <td>
            <select onchange="updateRiskScore(this)">
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
            </select>
        </td>
        <td class="risk-score">1</td>
        <td><input type="text" placeholder="Mitigation strategy"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Implementation Roadmap Functions
function addRoadmapRow() {
    const tbody = document.getElementById('roadmap-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Initiative name"></td>
        <td>
            <select>
                <option>Q1 2024</option>
                <option>Q2 2024</option>
                <option>Q3 2024</option>
                <option>Q4 2024</option>
                <option>Q1 2025</option>
                <option>Q2 2025</option>
            </select>
        </td>
        <td><input type="number" placeholder="3" min="1" max="12"></td>
        <td><input type="text" placeholder="Team/Owner"></td>
        <td><input type="text" placeholder="Dependencies"></td>
        <td>
            <select>
                <option>Not Started</option>
                <option>Planning</option>
                <option>In Progress</option>
                <option>Completed</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Helper Functions
function removeRow(button) {
    button.closest('tr').remove();
    updateCalculations();
}

function updateSkillsGap() {
    const rows = document.querySelectorAll('#skills-tbody tr');
    rows.forEach(row => {
        const current = parseInt(row.cells[1].querySelector('select').value);
        const required = parseInt(row.cells[2].querySelector('select').value);
        const gap = required - current;
        row.cells[3].textContent = gap;
        row.cells[3].className = gap > 1 ? 'gap-score high' : gap > 0 ? 'gap-score medium' : 'gap-score low';
    });
}

function calculatePriority(select) {
    const row = select.closest('tr');
    const impact = parseInt(row.cells[2].querySelector('select').value);
    const feasibility = parseInt(row.cells[3].querySelector('select').value);
    const complexity = parseInt(row.cells[4].querySelector('select').value);
    
    const priority = impact + feasibility + (4 - complexity);
    row.cells[5].textContent = priority;
    row.cells[5].className = priority >= 7 ? 'priority-score high' : priority >= 5 ? 'priority-score medium' : 'priority-score low';
}

function updateVendorScore(input) {
    const row = input.closest('tr');
    const spans = row.querySelectorAll('.range-value');
    const ranges = row.querySelectorAll('input[type="range"]');
    
    // Update the display value
    const index = Array.from(ranges).indexOf(input);
    if (spans[index]) {
        spans[index].textContent = input.value;
    }
    
    // Calculate average score
    let total = 0;
    ranges.forEach(range => total += parseInt(range.value));
    const average = (total / ranges.length).toFixed(1);
    
    row.cells[5].textContent = average;
}

function updateRiskScore(select) {
    const row = select.closest('tr');
    const probability = parseInt(row.cells[2].querySelector('select').value);
    const impact = parseInt(row.cells[3].querySelector('select').value);
    const score = probability * impact;
    
    row.cells[4].textContent = score;
    row.cells[4].className = score >= 6 ? 'risk-score high' : score >= 3 ? 'risk-score medium' : 'risk-score low';
}

// ROI Calculator
function calculateROI() {
    const investment = parseFloat(document.getElementById('ai-investment')?.value || 0);
    const savings = parseFloat(document.getElementById('annual-savings')?.value || 0);
    const revenue = parseFloat(document.getElementById('revenue-increase')?.value || 0);
    const years = parseFloat(document.getElementById('roi-years')?.value || 3);
    
    const totalBenefit = (savings + revenue) * years;
    const roi = investment > 0 ? ((totalBenefit - investment) / investment * 100).toFixed(1) : 0;
    const payback = (savings + revenue) > 0 ? (investment / (savings + revenue)).toFixed(1) : 0;
    
    // Update displays
    const roiElement = document.getElementById('roi-percentage');
    if (roiElement) {
        roiElement.textContent = roi + '%';
        roiElement.className = roi > 100 ? 'roi-value positive' : roi > 0 ? 'roi-value neutral' : 'roi-value negative';
    }
    
    const paybackElement = document.getElementById('payback-period');
    if (paybackElement) {
        paybackElement.textContent = payback + ' years';
    }
    
    const npvElement = document.getElementById('npv');
    if (npvElement) {
        const discountRate = 0.1; // 10% discount rate
        let npv = -investment;
        for (let i = 1; i <= years; i++) {
            npv += (savings + revenue) / Math.pow(1 + discountRate, i);
        }
        npvElement.textContent = '$' + npv.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

// Update Radar Chart
function updateRadarChart(dimensions) {
    // This would integrate with a charting library like Chart.js
    // For now, just console log the data
    console.log('Radar chart data:', dimensions);
}

// Calculations
function initializeCalculations() {
    // Add change listeners to all inputs
    document.addEventListener('change', function(e) {
        if (e.target.matches('input, select')) {
            updateCalculations();
        }
    });
}

function updateCalculations() {
    calculateMaturityScore();
    updateSkillsGap();
    calculateROI();
}

// Export to Excel
async function exportToExcel() {
    try {
        // Show loading overlay
        if (window.LoadingOverlay) {
            LoadingOverlay.show('📊 Generating Excel file...');
        }
        
        // Collect all data
        const data = collectAllData();
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Add sheets
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.maturity), "Maturity Assessment");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.skills), "Skills Gap");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.useCases), "Use Cases");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.data), "Data Readiness");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.infrastructure), "Infrastructure");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.vendors), "Vendors");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.risks), "Risks");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.roadmap), "Roadmap");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.roi), "ROI Analysis");
        
        // Save file
        XLSX.writeFile(wb, "ai_readiness_assessment.xlsx");
        
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

// Make collectAllData globally accessible for auto-save
window.collectAllData = function collectAllData() {
    const data = {
        maturity: [],
        skills: [],
        useCases: [],
        data: [],
        infrastructure: [],
        vendors: [],
        risks: [],
        roadmap: [],
        roi: [],
        formInputs: {},
        timestamp: new Date().toISOString()
    };
    
    // Collect maturity assessment with IDs for restoration
    document.querySelectorAll('.maturity-question').forEach(q => {
        data.maturity.push({
            id: q.id,
            dimension: q.dataset.dimension,
            question: q.previousElementSibling.textContent,
            score: q.value,
            weight: q.dataset.weight
        });
    });
    
    // Collect all form inputs by ID
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(element => {
        if (element.id) {
            data.formInputs[element.id] = element.value;
        }
    });
    
    // Collect table data
    // Skills table
    document.querySelectorAll('#skills-tbody tr').forEach(row => {
        data.skills.push({
            skill: row.cells[0].querySelector('input').value,
            currentLevel: row.cells[1].querySelector('select').value,
            requiredLevel: row.cells[2].querySelector('select').value,
            priority: row.cells[4].querySelector('select').value,
            trainingPlan: row.cells[5].querySelector('input').value
        });
    });
    
    // Use cases table
    document.querySelectorAll('#usecase-tbody tr').forEach(row => {
        data.useCases.push({
            useCase: row.cells[0].querySelector('input').value,
            department: row.cells[1].querySelector('select').value,
            impact: row.cells[2].querySelector('select').value,
            feasibility: row.cells[3].querySelector('select').value,
            complexity: row.cells[4].querySelector('select').value
        });
    });
    
    // Add similar collection for other tables...
    
    return data;
}

// Save and Load Functions
function saveProgress() {
    // Use the auto-save system's manual save
    if (window.autoSave && window.autoSave.manualSave) {
        window.autoSave.manualSave();
    } else {
        // Fallback to direct save
        const data = collectAllData();
        localStorage.setItem('aiReadinessData', JSON.stringify(data));
        
        // Show success notification
        if (window.notify) {
            window.notify.show('✅ Progress saved successfully!', 'success');
        }
    }
}

// Share function - separate from save
function shareResults() {
    const data = collectAllData();
    const link = generateShareableLink(data);
    showLinkModal(link);
}

// Make restoreData globally accessible for auto-save
window.restoreData = function restoreData(data) {
    if (!data) return;
    
    try {
        // Prevent layout shifts by batching DOM updates
        // Add a class to freeze transitions during restore
        document.body.classList.add('restoring-data');
        
        // Restore maturity assessment scores
        if (data.maturity) {
            data.maturity.forEach(item => {
                const element = document.getElementById(item.id);
                if (element) {
                    element.value = item.score;
                }
            });
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
        
        // Use requestAnimationFrame to batch calculations after DOM updates
        requestAnimationFrame(() => {
            calculateMaturityScore();
            updateSkillsGap();
            calculateROI();
            
            // Remove the restoring class after a frame to re-enable transitions
            requestAnimationFrame(() => {
                document.body.classList.remove('restoring-data');
            });
        });
    } catch (error) {
        console.error('Error restoring data:', error);
        document.body.classList.remove('restoring-data');
    }
}

// Make functions globally available for auto-save
window.collectAllData = collectAllData;
// window.restoreData is already defined above at line 761

function loadSavedData() {
    const savedData = localStorage.getItem('aiReadinessData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('Loading saved data...', data);
            
            // Use the restoreData function (already defined above)
            window.restoreData(data);
            
            // Show success message
            showDataLoadedMessage();
        } catch (error) {
            console.error('Error loading saved data:', error);
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

function resetCalculator() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('aiReadinessData');
        
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

// Generate Report
function generateReport() {
    const reportWindow = window.open('', '_blank');
    const reportContent = generateReportHTML();
    
    // Use innerHTML instead of document.write (avoiding deprecated method)
    reportWindow.document.documentElement.innerHTML = reportContent;
    
    setTimeout(() => {
        reportWindow.print();
    }, 500);
}

function generateReportHTML() {
    const maturityScore = calculateMaturityScore();
    const date = new Date().toLocaleDateString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Readiness Assessment Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #6366f1; }
                h2 { color: #4f46e5; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f0f0ff; }
                .header { text-align: center; margin-bottom: 40px; }
                .score { font-size: 24px; font-weight: bold; color: #6366f1; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AI Readiness Assessment Report</h1>
                <p>Generated on ${date}</p>
                <p class="score">Overall Maturity Score: ${maturityScore.toFixed(1)}%</p>
            </div>
            
            <h2>Executive Summary</h2>
            <p>This report provides a comprehensive assessment of organizational AI readiness across multiple dimensions.</p>
            
            <!-- Add more report sections here -->
            
        </body>
        </html>
    `;
}

// URL-based Sharing Functions
function generateShareableLink(data) {
    // Compress the data to make URL shorter
    const compressed = compressData(data);
    const encoded = btoa(compressed);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?data=${encoded}`;
}

function compressData(data) {
    // Simple compression: only save essential fields
    const compressed = {
        m: [], // maturity scores
        s: [], // skills
        u: [], // use cases
        r: data.formInputs?.['ai-investment'] || '', // roi investment
        t: new Date().toISOString().split('T')[0] // date
    };
    
    // Compress maturity scores
    if (data.maturity) {
        data.maturity.forEach(item => {
            compressed.m.push(item.score);
        });
    }
    
    return JSON.stringify(compressed);
}

function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
        try {
            const compressed = atob(encodedData);
            const data = JSON.parse(compressed);
            
            // Restore maturity scores
            if (data.m) {
                const questions = document.querySelectorAll('.maturity-question');
                data.m.forEach((score, index) => {
                    if (questions[index]) {
                        questions[index].value = score;
                    }
                });
                setTimeout(() => calculateMaturityScore(), 100);
            }
            
            // Show success message
            showMessage('✓ Assessment loaded from shared link!', 'success');
            return true;
        } catch (error) {
            console.error('Error loading from URL:', error);
        }
    }
    return false;
}

function showLinkModal(link) {
    // Remove existing modal if any
    const existingModal = document.getElementById('link-modal');
    if (existingModal) existingModal.remove();
    
    // Create modal
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
            <h2 style="color: #6366f1; margin-bottom: 1rem;">✅ Progress Saved!</h2>
            <p style="margin-bottom: 1rem;">Your assessment has been saved. You can share this link to continue later or share with colleagues:</p>
            
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <input type="text" id="share-link" value="${link}" readonly 
                       style="flex: 1; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem;">
                <button onclick="copyLink()" 
                        style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    📋 Copy
                </button>
            </div>
            
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button onclick="shareViaEmail('${encodeURIComponent(link)}')" 
                        style="padding: 0.5rem 1rem; background: white; color: #6366f1; border: 2px solid #6366f1; border-radius: 6px; cursor: pointer;">
                    ✉️ Email
                </button>
                <button onclick="closeModal()" 
                        style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Done
                </button>
            </div>
            
            <p style="margin-top: 1rem; font-size: 0.85rem; color: #64748b;">
                💡 Tip: This link contains your assessment data. Anyone with this link can view and continue your assessment.
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-select the link text
    document.getElementById('share-link').select();
}

function copyLink() {
    const linkInput = document.getElementById('share-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Show success message
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#6366f1';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        navigator.clipboard.writeText(linkInput.value).then(() => {
            showMessage('Link copied to clipboard!', 'success');
        });
    }
}

function shareViaEmail(link) {
    const subject = 'AI Readiness Assessment - Saved Progress';
    const body = `Here's my AI Readiness Assessment progress:\n\n${decodeURIComponent(link)}\n\nClick the link to view or continue the assessment.`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function closeModal() {
    const modal = document.getElementById('link-modal');
    if (modal) modal.remove();
}

function showMessage(text, type) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10001;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        animation: slideIn 0.3s;
    `;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
}

// Alternative: Generate short URL using URL shortener service (optional)
async function generateShortLink(longUrl) {
    // You could integrate with a URL shortener API here
    // For example: bit.ly, tinyurl, or your own shortener
    // For now, return the long URL
    return longUrl;
}

// Export functions to global scope
window.addSkillRow = addSkillRow;
window.addUseCaseRow = addUseCaseRow;
window.addDataSourceRow = addDataSourceRow;
window.addInfrastructureRow = addInfrastructureRow;
window.addVendorRow = addVendorRow;
window.addRiskRow = addRiskRow;
window.addRoadmapRow = addRoadmapRow;
window.removeRow = removeRow;
window.calculateMaturityScore = calculateMaturityScore;
window.calculatePriority = calculatePriority;
window.updateVendorScore = updateVendorScore;
window.updateRiskScore = updateRiskScore;
window.calculateROI = calculateROI;
window.exportToExcel = exportToExcel;
window.saveProgress = saveProgress;
window.resetCalculator = resetCalculator;
window.generateReport = generateReport;
window.copyLink = copyLink;
window.shareViaEmail = shareViaEmail;
window.closeModal = closeModal;window.shareResults = shareResults;
