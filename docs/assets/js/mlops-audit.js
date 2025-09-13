// MLOps Audit Calculator JavaScript

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeMLOpsMaturity();
    initializeCalculations();
    
    // Initialize auto-save
    function initAutoSave() {
        if (window.AutoSave) {
            window.autoSave = new AutoSave('mlops-audit', 15000);
            console.log("✅ Auto-save initialized for mlops-audit");
            return true;
        }
        return false;
    }
    
    if (!initAutoSave()) {
        setTimeout(() => {
            if (!initAutoSave()) {
                setTimeout(() => {
                    if (!initAutoSave()) {
                        console.warn("⚠️ AutoSave initialization delayed for mlops-audit");
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

// Initialize MLOps Maturity Assessment
function initializeMLOpsMaturity() {
    const container = document.getElementById('mlops-maturity-container');
    if (!container) return;
    
    const dimensions = {
        'Data Management': {
            questions: [
                { id: 'data_versioning', text: 'Is data versioned and tracked?', weight: 0.2 },
                { id: 'data_lineage', text: 'Can you trace data lineage?', weight: 0.15 },
                { id: 'feature_store', text: 'Do you have a feature store?', weight: 0.25 },
                { id: 'data_quality', text: 'Are data quality checks automated?', weight: 0.2 },
                { id: 'data_pipeline', text: 'Are data pipelines automated?', weight: 0.2 }
            ]
        },
        'Model Development': {
            questions: [
                { id: 'experiment_tracking', text: 'Do you track all experiments?', weight: 0.2 },
                { id: 'code_versioning', text: 'Is ML code version controlled?', weight: 0.15 },
                { id: 'reproducibility', text: 'Can experiments be reproduced?', weight: 0.25 },
                { id: 'collaboration', text: 'Do teams collaborate effectively?', weight: 0.15 },
                { id: 'model_registry', text: 'Do you use a model registry?', weight: 0.25 }
            ]
        },
        'Model Deployment': {
            questions: [
                { id: 'ci_cd', text: 'Is CI/CD implemented for ML?', weight: 0.25 },
                { id: 'containerization', text: 'Are models containerized?', weight: 0.2 },
                { id: 'deployment_automation', text: 'Is deployment automated?', weight: 0.2 },
                { id: 'rollback', text: 'Can you rollback deployments?', weight: 0.15 },
                { id: 'ab_testing', text: 'Do you perform A/B testing?', weight: 0.2 }
            ]
        },
        'Monitoring & Observability': {
            questions: [
                { id: 'performance_monitoring', text: 'Do you monitor model performance?', weight: 0.25 },
                { id: 'data_drift', text: 'Do you detect data drift?', weight: 0.25 },
                { id: 'model_drift', text: 'Do you detect model drift?', weight: 0.2 },
                { id: 'alerting', text: 'Are alerts configured?', weight: 0.15 },
                { id: 'logging', text: 'Is comprehensive logging in place?', weight: 0.15 }
            ]
        },
        'Governance & Security': {
            questions: [
                { id: 'model_governance', text: 'Is model governance established?', weight: 0.2 },
                { id: 'compliance', text: 'Are compliance requirements met?', weight: 0.2 },
                { id: 'security', text: 'Are security measures in place?', weight: 0.2 },
                { id: 'explainability', text: 'Are models explainable?', weight: 0.2 },
                { id: 'bias_detection', text: 'Do you check for bias?', weight: 0.2 }
            ]
        },
        'Infrastructure & Automation': {
            questions: [
                { id: 'infrastructure_as_code', text: 'Do you use Infrastructure as Code?', weight: 0.25 },
                { id: 'auto_scaling', text: 'Is auto-scaling configured?', weight: 0.2 },
                { id: 'resource_optimization', text: 'Are resources optimized?', weight: 0.15 },
                { id: 'disaster_recovery', text: 'Is disaster recovery planned?', weight: 0.2 },
                { id: 'cost_monitoring', text: 'Do you monitor costs?', weight: 0.2 }
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
                            onchange="calculateMLOpsMaturity()">
                        <option value="0">Not Implemented</option>
                        <option value="1">Initial/Manual</option>
                        <option value="2">Partially Automated</option>
                        <option value="3">Mostly Automated</option>
                        <option value="4">Fully Automated</option>
                        <option value="5">Optimized & ML-Driven</option>
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
            <h3>Overall MLOps Maturity Score</h3>
            <div class="score-display">
                <div class="score-gauge" id="maturity-gauge">
                    <div class="score-fill" id="maturity-fill" style="width: 0%">
                        <span id="maturity-percentage">0%</span>
                    </div>
                </div>
                <div class="maturity-level" id="maturity-level">Level 0: Not Started</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Calculate MLOps Maturity Score
function calculateMLOpsMaturity() {
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
    updateMLOpsMaturityDisplay(overallScore);
    
    return overallScore;
}

// Update MLOps Maturity Display
function updateMLOpsMaturityDisplay(score) {
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
        level.textContent = getMLOpsMaturityLevel(score);
        level.className = 'maturity-level level-' + getScoreClass(score);
    }
}

// Get MLOps Maturity Level Text
function getMLOpsMaturityLevel(score) {
    if (score >= 80) return 'Level 5: Optimized - ML Excellence';
    if (score >= 60) return 'Level 4: Managed - Scalable MLOps';
    if (score >= 40) return 'Level 3: Defined - Standard MLOps';
    if (score >= 20) return 'Level 2: Developing - Basic MLOps';
    if (score > 0) return 'Level 1: Initial - Ad-hoc ML';
    return 'Level 0: Not Started';
}

// Get Score Class for Styling
function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'critical';
}

// Model Lifecycle Functions
function addLifecycleRow() {
    const tbody = document.getElementById('lifecycle-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Model name"></td>
        <td>
            <select>
                <option>Classification</option>
                <option>Regression</option>
                <option>Clustering</option>
                <option>NLP</option>
                <option>Computer Vision</option>
                <option>Time Series</option>
            </select>
        </td>
        <td><input type="text" placeholder="v1.0.0"></td>
        <td>
            <select onchange="updateModelStats()">
                <option>Development</option>
                <option>Staging</option>
                <option>Production</option>
                <option>Archived</option>
            </select>
        </td>
        <td><input type="text" placeholder="95% accuracy"></td>
        <td><input type="date"></td>
        <td><input type="text" placeholder="Team/Owner"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
    updateModelStats();
}

// Deployment Pipeline Functions
function addDeploymentRow() {
    const tbody = document.getElementById('deployment-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Stage name"></td>
        <td>
            <select>
                <option>Manual</option>
                <option>Semi-Automated</option>
                <option>Fully Automated</option>
            </select>
        </td>
        <td><input type="text" placeholder="Tools"></td>
        <td><input type="number" placeholder="30" min="0"></td>
        <td><input type="text" placeholder="95%"></td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Monitoring Functions
function addMonitoringRow() {
    const tbody = document.getElementById('monitoring-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <select>
                <option>Data Drift</option>
                <option>Model Performance</option>
                <option>System Performance</option>
                <option>Business Metrics</option>
            </select>
        </td>
        <td><input type="text" placeholder="Metric name"></td>
        <td><input type="text" placeholder="Current value"></td>
        <td><input type="text" placeholder="Threshold"></td>
        <td>
            <select>
                <option>Healthy</option>
                <option>Warning</option>
                <option>Critical</option>
            </select>
        </td>
        <td>
            <select>
                <option>Yes</option>
                <option>No</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Governance Functions
function addGovernanceRow() {
    const tbody = document.getElementById('governance-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <select>
                <option>Model Bias</option>
                <option>Data Privacy</option>
                <option>Explainability</option>
                <option>Reproducibility</option>
                <option>Security</option>
                <option>Compliance</option>
            </select>
        </td>
        <td><input type="text" placeholder="Requirement"></td>
        <td>
            <select>
                <option>Compliant</option>
                <option>Partial</option>
                <option>Non-Compliant</option>
                <option>N/A</option>
            </select>
        </td>
        <td>
            <select>
                <option>Complete</option>
                <option>In Progress</option>
                <option>Missing</option>
            </select>
        </td>
        <td><input type="date"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Infrastructure Functions
function addInfraRow() {
    const tbody = document.getElementById('infra-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Component"></td>
        <td>
            <select>
                <option>Compute</option>
                <option>Storage</option>
                <option>Orchestration</option>
                <option>Feature Store</option>
                <option>Model Registry</option>
                <option>Monitoring</option>
            </select>
        </td>
        <td><input type="text" placeholder="Tool/Platform"></td>
        <td><input type="text" placeholder="Version"></td>
        <td>
            <select onchange="updateInfraCosts()">
                <option>Open Source</option>
                <option>Commercial</option>
                <option>Enterprise</option>
            </select>
        </td>
        <td><input type="number" placeholder="1000" min="0" onchange="updateInfraCosts()"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
    updateInfraCosts();
}

// Team Functions
function addTeamRow() {
    const tbody = document.getElementById('team-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <select>
                <option>ML Engineer</option>
                <option>Data Scientist</option>
                <option>DevOps Engineer</option>
                <option>Data Engineer</option>
                <option>Platform Engineer</option>
            </select>
        </td>
        <td><input type="text" placeholder="Skill area"></td>
        <td>
            <select onchange="updateTeamGap(this)">
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Advanced</option>
                <option value="4">Expert</option>
            </select>
        </td>
        <td>
            <select onchange="updateTeamGap(this)">
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Advanced</option>
                <option value="4">Expert</option>
            </select>
        </td>
        <td class="gap-score">0</td>
        <td><input type="text" placeholder="Training plan"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Roadmap Functions
function addRoadmapRow() {
    const tbody = document.getElementById('roadmap-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Initiative"></td>
        <td>
            <select>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
            </select>
        </td>
        <td>
            <select>
                <option>Data Management</option>
                <option>Model Development</option>
                <option>Deployment</option>
                <option>Monitoring</option>
                <option>Governance</option>
            </select>
        </td>
        <td><input type="number" placeholder="4" min="1"></td>
        <td>
            <select>
                <option>Q1 2024</option>
                <option>Q2 2024</option>
                <option>Q3 2024</option>
                <option>Q4 2024</option>
            </select>
        </td>
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

function updateTeamGap(select) {
    const row = select.closest('tr');
    const current = parseInt(row.cells[2].querySelector('select').value) || 0;
    const required = parseInt(row.cells[3].querySelector('select').value) || 0;
    const gap = required - current;
    row.cells[4].textContent = gap;
    row.cells[4].className = gap > 1 ? 'gap-score high' : gap > 0 ? 'gap-score medium' : 'gap-score low';
}

function updateModelStats() {
    const rows = document.querySelectorAll('#lifecycle-tbody tr');
    let total = rows.length;
    let production = 0;
    
    rows.forEach(row => {
        const stage = row.cells[3].querySelector('select').value;
        if (stage === 'Production') production++;
    });
    
    document.getElementById('total-models').textContent = total;
    document.getElementById('prod-models').textContent = production;
}

function updateInfraCosts() {
    const rows = document.querySelectorAll('#infra-tbody tr');
    let totalCost = 0;
    let openSourceCount = 0;
    
    rows.forEach(row => {
        const cost = parseFloat(row.cells[5].querySelector('input').value || 0);
        const license = row.cells[4].querySelector('select').value;
        totalCost += cost;
        if (license === 'Open Source') openSourceCount++;
    });
    
    const opensourcePercent = rows.length > 0 ? (openSourceCount / rows.length * 100).toFixed(0) : 0;
    
    document.getElementById('total-cost').textContent = '$' + totalCost.toLocaleString();
    document.getElementById('opensource-percent').textContent = opensourcePercent + '%';
}

// Calculations
function initializeCalculations() {
    document.addEventListener('change', function(e) {
        if (e.target.matches('input, select')) {
            updateCalculations();
        }
    });
}

function updateCalculations() {
    calculateMLOpsMaturity();
    updateModelStats();
    updateInfraCosts();
    calculateMLOpsScores();
}

function calculateMLOpsScores() {
    // Calculate velocity score based on deployment frequency and time to production
    const deployFreq = parseFloat(document.getElementById('deployment-freq')?.value || 0);
    const timeToProd = parseFloat(document.getElementById('time-to-prod')?.value || 30);
    
    const velocityScore = Math.min(100, (deployFreq * 5) + ((30 - timeToProd) * 2));
    
    // Calculate reliability score based on failure rate and rollback frequency
    const failureRate = parseFloat(document.getElementById('failure-rate')?.value || 0);
    const rollbackFreq = parseFloat(document.getElementById('rollback-freq')?.value || 0);
    
    const reliabilityScore = Math.max(0, 100 - (failureRate * 5) - (rollbackFreq * 10));
    
    // Update displays
    const velocityElement = document.getElementById('velocity-score');
    if (velocityElement) {
        velocityElement.textContent = velocityScore.toFixed(0) + '%';
    }
    
    const reliabilityElement = document.getElementById('reliability-score');
    if (reliabilityElement) {
        reliabilityElement.textContent = reliabilityScore.toFixed(0) + '%';
    }
}

// Export to Excel
async function exportToExcel() {
    try {
        // Show loading overlay
        if (window.LoadingOverlay) {
            LoadingOverlay.show('📊 Generating Excel file...');
        }
        
        const data = collectAllData();
        const wb = XLSX.utils.book_new();
        
        // Add sheets
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.maturity), "Maturity");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.lifecycle), "Model Lifecycle");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.deployment), "Deployment");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.monitoring), "Monitoring");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.governance), "Governance");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.infrastructure), "Infrastructure");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.team), "Team");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.metrics), "Metrics");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.roadmap), "Roadmap");
        
        // Save file
        XLSX.writeFile(wb, "mlops_audit_assessment.xlsx");
        
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
        lifecycle: [],
        deployment: [],
        monitoring: [],
        governance: [],
        infrastructure: [],
        team: [],
        metrics: [],
        roadmap: [],
        formInputs: {},
        timestamp: new Date().toISOString()
    };
    
    // Collect all form inputs by ID
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(element => {
        if (element.id) {
            data.formInputs[element.id] = element.value;
        }
    });
    
    // Collect maturity assessment
    document.querySelectorAll('.maturity-question').forEach(q => {
        data.maturity.push({
            id: q.id,
            dimension: q.dataset.dimension,
            question: q.previousElementSibling.textContent,
            score: q.value,
            weight: q.dataset.weight
        });
    });
    
    // Collect lifecycle data
    document.querySelectorAll('#lifecycle-tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
            data.lifecycle.push({
                name: cells[0].querySelector('input')?.value || '',
                type: cells[1].querySelector('select')?.value || '',
                version: cells[2].querySelector('input')?.value || '',
                stage: cells[3].querySelector('select')?.value || '',
                performance: cells[4].querySelector('input')?.value || '',
                lastUpdated: cells[5].querySelector('input')?.value || '',
                owner: cells[6].querySelector('input')?.value || ''
            });
        }
    });
    
    // Collect deployment data
    document.querySelectorAll('#deployment-tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            data.deployment.push({
                stage: cells[0].querySelector('input')?.value || '',
                automation: cells[1].querySelector('select')?.value || '',
                tools: cells[2].querySelector('input')?.value || '',
                duration: cells[3].querySelector('input')?.value || '',
                reliability: cells[4].querySelector('input')?.value || '',
                lastRun: cells[5].querySelector('input')?.value || ''
            });
        }
    });
    
    // Collect monitoring data
    document.querySelectorAll('#monitoring-tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            data.monitoring.push({
                category: cells[0].querySelector('select')?.value || '',
                metric: cells[1].querySelector('input')?.value || '',
                value: cells[2].querySelector('input')?.value || '',
                threshold: cells[3].querySelector('input')?.value || '',
                status: cells[4].querySelector('select')?.value || '',
                alerting: cells[5].querySelector('select')?.value || ''
            });
        }
    });
    
    // Collect governance data
    document.querySelectorAll('#governance-tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            data.governance.push({
                category: cells[0].querySelector('select')?.value || '',
                requirement: cells[1].querySelector('input')?.value || '',
                compliance: cells[2].querySelector('select')?.value || '',
                documentation: cells[3].querySelector('select')?.value || '',
                review: cells[4].querySelector('input')?.value || ''
            });
        }
    });
    
    // Collect infrastructure data
    document.querySelectorAll('#infra-tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            data.infrastructure.push({
                component: cells[0].querySelector('input')?.value || '',
                type: cells[1].querySelector('select')?.value || '',
                platform: cells[2].querySelector('input')?.value || '',
                version: cells[3].querySelector('input')?.value || '',
                license: cells[4].querySelector('select')?.value || '',
                cost: cells[5].querySelector('input')?.value || ''
            });
        }
    });
    
    // Collect team data
    document.querySelectorAll('#team-tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            data.team.push({
                role: cells[0].querySelector('select')?.value || '',
                skill: cells[1].querySelector('input')?.value || '',
                current: cells[2].querySelector('select')?.value || '',
                required: cells[3].querySelector('select')?.value || '',
                gap: cells[4].textContent || '',
                training: cells[5].querySelector('input')?.value || ''
            });
        }
    });
    
    // Collect roadmap data
    document.querySelectorAll('#roadmap-tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            data.roadmap.push({
                initiative: cells[0].querySelector('input')?.value || '',
                priority: cells[1].querySelector('select')?.value || '',
                category: cells[2].querySelector('select')?.value || '',
                effort: cells[3].querySelector('input')?.value || '',
                timeline: cells[4].querySelector('select')?.value || '',
                status: cells[5].querySelector('select')?.value || ''
            });
        }
    });
    
    // Collect key metrics
    data.metrics = {
        maturityScore: calculateMLOpsMaturity(),
        totalModels: document.getElementById('total-models')?.textContent || '0',
        prodModels: document.getElementById('prod-models')?.textContent || '0',
        totalCost: document.getElementById('total-cost')?.textContent || '$0',
        opensourcePercent: document.getElementById('opensource-percent')?.textContent || '0%',
        velocityScore: document.getElementById('velocity-score')?.textContent || '0%',
        reliabilityScore: document.getElementById('reliability-score')?.textContent || '0%'
    };
    
    return data;
}

// Save and Load Functions
function saveProgress() {
    // Use the auto-save system's manual save
    if (window.autoSave && window.autoSave.manualSave) {
        window.autoSave.manualSave();
        return;
    }
    // Fallback to original implementation
    const data = collectAllData();
    localStorage.setItem('mlopsAuditData', JSON.stringify(data));
    
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
        if (data.maturity) {
            data.maturity.forEach(item => {
                const element = document.getElementById(item.id);
                if (element) {
                    element.value = item.score;
                }
            });
            // Recalculate scores after loading
            setTimeout(() => calculateMLOpsMaturity(), 100);
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
            calculateMLOpsMaturity();
            updateModelStats();
            updateInfraCosts();
            updateCalculations();
        }, 200);
    } catch (error) {
        console.error('Error restoring data:', error);
    }
}

function loadSavedData() {
    const savedData = localStorage.getItem('mlopsAuditData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('Loading saved data...', data);
            
            // Use the restoreData function
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

function populateForms(data) {
    // Populate maturity assessment
    if (data.maturity) {
        data.maturity.forEach(item => {
            const elements = document.querySelectorAll('.maturity-question');
            elements.forEach(el => {
                if (el.dataset.dimension === item.dimension && 
                    el.previousElementSibling.textContent === item.question) {
                    el.value = item.score;
                }
            });
        });
    }
    
    // Populate lifecycle table
    if (data.lifecycle && data.lifecycle.length > 0) {
        const tbody = document.getElementById('lifecycle-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            data.lifecycle.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" placeholder="Model name" value="${item.name}"></td>
                    <td>
                        <select>
                            <option ${item.type === 'Classification' ? 'selected' : ''}>Classification</option>
                            <option ${item.type === 'Regression' ? 'selected' : ''}>Regression</option>
                            <option ${item.type === 'Clustering' ? 'selected' : ''}>Clustering</option>
                            <option ${item.type === 'NLP' ? 'selected' : ''}>NLP</option>
                            <option ${item.type === 'Computer Vision' ? 'selected' : ''}>Computer Vision</option>
                            <option ${item.type === 'Time Series' ? 'selected' : ''}>Time Series</option>
                        </select>
                    </td>
                    <td><input type="text" placeholder="v1.0.0" value="${item.version}"></td>
                    <td>
                        <select onchange="updateModelStats()">
                            <option ${item.stage === 'Development' ? 'selected' : ''}>Development</option>
                            <option ${item.stage === 'Staging' ? 'selected' : ''}>Staging</option>
                            <option ${item.stage === 'Production' ? 'selected' : ''}>Production</option>
                            <option ${item.stage === 'Archived' ? 'selected' : ''}>Archived</option>
                        </select>
                    </td>
                    <td><input type="text" placeholder="95% accuracy" value="${item.performance}"></td>
                    <td><input type="date" value="${item.lastUpdated}"></td>
                    <td><input type="text" placeholder="Team/Owner" value="${item.owner}"></td>
                    <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
                `;
                tbody.appendChild(row);
            });
        }
    }
    
    // Populate infrastructure table
    if (data.infrastructure && data.infrastructure.length > 0) {
        const tbody = document.getElementById('infra-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            data.infrastructure.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" placeholder="Component" value="${item.component}"></td>
                    <td>
                        <select>
                            <option ${item.type === 'Compute' ? 'selected' : ''}>Compute</option>
                            <option ${item.type === 'Storage' ? 'selected' : ''}>Storage</option>
                            <option ${item.type === 'Orchestration' ? 'selected' : ''}>Orchestration</option>
                            <option ${item.type === 'Feature Store' ? 'selected' : ''}>Feature Store</option>
                            <option ${item.type === 'Model Registry' ? 'selected' : ''}>Model Registry</option>
                            <option ${item.type === 'Monitoring' ? 'selected' : ''}>Monitoring</option>
                        </select>
                    </td>
                    <td><input type="text" placeholder="Tool/Platform" value="${item.platform}"></td>
                    <td><input type="text" placeholder="Version" value="${item.version}"></td>
                    <td>
                        <select onchange="updateInfraCosts()">
                            <option ${item.license === 'Open Source' ? 'selected' : ''}>Open Source</option>
                            <option ${item.license === 'Commercial' ? 'selected' : ''}>Commercial</option>
                            <option ${item.license === 'Enterprise' ? 'selected' : ''}>Enterprise</option>
                        </select>
                    </td>
                    <td><input type="number" placeholder="1000" min="0" value="${item.cost}" onchange="updateInfraCosts()"></td>
                    <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
                `;
                tbody.appendChild(row);
            });
        }
    }
    
    // Trigger calculations after loading
    setTimeout(() => {
        calculateMLOpsMaturity();
        updateModelStats();
        updateInfraCosts();
        updateCalculations();
    }, 100);
}

function resetCalculator() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('mlopsAuditData');
        
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
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    
    setTimeout(() => {
        reportWindow.print();
    }, 500);
}

function generateReportHTML() {
    const maturityScore = calculateMLOpsMaturity();
    const date = new Date().toLocaleDateString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>MLOps Audit Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #2563eb; }
                h2 { color: #1e40af; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #eff6ff; }
                .header { text-align: center; margin-bottom: 40px; }
                .score { font-size: 24px; font-weight: bold; color: #2563eb; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MLOps Audit Report</h1>
                <p>Generated on ${date}</p>
                <p class="score">Overall MLOps Maturity: ${maturityScore.toFixed(1)}%</p>
            </div>
            
            <h2>Executive Summary</h2>
            <p>This report provides a comprehensive assessment of MLOps maturity and practices.</p>
            
            <!-- Add more report sections here -->
            
        </body>
        </html>
    `;
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
        l: [], // lifecycle data
        d: [], // deployment data
        i: [], // infrastructure data
        t: new Date().toISOString().split('T')[0]
    };
    
    // Compress maturity assessment data
    if (data.maturity) {
        data.maturity.forEach(item => {
            const dim = item.dimension.substring(0, 3).toLowerCase();
            if (!compressed.m[dim]) compressed.m[dim] = [];
            compressed.m[dim].push({
                q: item.question.substring(0, 30),
                s: item.score,
                w: item.weight
            });
        });
    }
    
    // Compress lifecycle data (limit to 10 items)
    if (data.lifecycle) {
        data.lifecycle.slice(0, 10).forEach(item => {
            compressed.l.push({
                n: item.name?.substring(0, 20),
                t: item.type,
                s: item.stage,
                p: item.performance?.substring(0, 10)
            });
        });
    }
    
    // Compress deployment data (limit to 10 items)
    if (data.deployment) {
        data.deployment.slice(0, 10).forEach(item => {
            compressed.d.push({
                s: item.stage?.substring(0, 15),
                a: item.automation,
                r: item.reliability?.substring(0, 5)
            });
        });
    }
    
    // Compress infrastructure data (limit to 10 items)
    if (data.infrastructure) {
        data.infrastructure.slice(0, 10).forEach(item => {
            compressed.i.push({
                c: item.component?.substring(0, 15),
                t: item.type,
                l: item.license,
                cost: item.cost
            });
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
            
            // Load maturity assessment data
            if (data.m) {
                Object.entries(data.m).forEach(([dimKey, questions]) => {
                    questions.forEach(q => {
                        const elements = document.querySelectorAll('.maturity-question');
                        elements.forEach(el => {
                            if (el.previousElementSibling.textContent.includes(q.q.substring(0, 20))) {
                                el.value = q.s;
                            }
                        });
                    });
                });
            }
            
            // Trigger calculations after loading
            setTimeout(() => {
                calculateMLOpsMaturity();
                updateCalculations();
            }, 100);
            
            showMessage('Assessment loaded from shared link!', 'success');
            return true;
        } catch (error) {
            console.error('Error loading from URL:', error);
            showMessage('Error loading shared assessment', 'error');
        }
    }
    return false;
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
            <h3 style="margin-top: 0; color: #2563eb;">Share Your MLOps Assessment</h3>
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
                        style="padding: 0.75rem 1.5rem; border: 1px solid #2563eb; background: #2563eb; color: white; border-radius: 8px; cursor: pointer;">Email</button>
                <button onclick="copyLink()" 
                        style="padding: 0.75rem 1.5rem; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">Copy Link</button>
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
            button.style.background = '#2563eb';
        }, 2000);
    } catch (err) {
        navigator.clipboard.writeText(linkInput.value);
    }
}

function shareViaEmail(link) {
    const subject = 'MLOps Audit Assessment - Saved Progress';
    const body = `Here's my MLOps Audit Assessment progress:\n\n${decodeURIComponent(link)}\n\nClick the link to view or continue the assessment.`;
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
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    `;
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

// Export functions to global scope
window.addLifecycleRow = addLifecycleRow;
window.addDeploymentRow = addDeploymentRow;
window.addMonitoringRow = addMonitoringRow;
window.addGovernanceRow = addGovernanceRow;
window.addInfraRow = addInfraRow;
window.addTeamRow = addTeamRow;
window.addRoadmapRow = addRoadmapRow;
window.removeRow = removeRow;
window.updateTeamGap = updateTeamGap;
window.updateModelStats = updateModelStats;
window.updateInfraCosts = updateInfraCosts;
window.calculateMLOpsMaturity = calculateMLOpsMaturity;
window.exportToExcel = exportToExcel;
window.saveProgress = saveProgress;
window.shareResults = shareResults;
window.resetCalculator = resetCalculator;
window.generateReport = generateReport;
window.generateShareableLink = generateShareableLink;
window.compressData = compressData;
window.loadFromURL = loadFromURL;
window.showLinkModal = showLinkModal;
window.copyLink = copyLink;
window.shareViaEmail = shareViaEmail;
window.closeModal = closeModal;
window.showMessage = showMessage;
window.populateForms = populateForms;