// LLM Implementation Framework Calculator JavaScript

// Global state
let calculatorData = {};

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeLLMReadinessAssessment();
    initializeCalculations();
    
    // Initialize auto-save
    function initAutoSave() {
        if (window.AutoSave) {
            window.autoSave = new AutoSave('llm-framework', 15000);
            console.log("✅ Auto-save initialized for llm-framework");
            return true;
        }
        return false;
    }
    
    if (!initAutoSave()) {
        setTimeout(() => {
            if (!initAutoSave()) {
                setTimeout(() => {
                    if (!initAutoSave()) {
                        console.warn("⚠️ AutoSave initialization delayed for llm-framework");
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

// Initialize LLM Readiness Assessment with Questions
function initializeLLMReadinessAssessment() {
    const assessmentContainer = document.getElementById('llm-readiness-container');
    if (!assessmentContainer) return;
    
    const dimensions = {
        'Technical Infrastructure': {
            questions: [
                { id: 'gpu_capacity', text: 'Do you have sufficient GPU/compute capacity for LLM workloads?', weight: 0.2 },
                { id: 'api_integration', text: 'How capable is your team with API integrations?', weight: 0.15 },
                { id: 'vector_db', text: 'Do you have experience with vector databases?', weight: 0.15 },
                { id: 'mlops_pipeline', text: 'Is your MLOps pipeline ready for LLM deployment?', weight: 0.2 },
                { id: 'monitoring_tools', text: 'Do you have monitoring tools for AI applications?', weight: 0.15 },
                { id: 'scalability_arch', text: 'Is your architecture designed for scalable AI workloads?', weight: 0.15 }
            ]
        },
        'Data & Knowledge': {
            questions: [
                { id: 'knowledge_base', text: 'Do you have a structured knowledge base or document repository?', weight: 0.25 },
                { id: 'data_quality', text: 'How would you rate the quality of your text data?', weight: 0.2 },
                { id: 'data_privacy', text: 'Are your data privacy and security controls adequate?', weight: 0.2 },
                { id: 'data_labeling', text: 'Do you have capabilities for data annotation and labeling?', weight: 0.15 },
                { id: 'domain_expertise', text: 'Do you have domain experts for content validation?', weight: 0.2 }
            ]
        },
        'AI/ML Skills': {
            questions: [
                { id: 'llm_experience', text: 'Does your team have experience with LLMs?', weight: 0.25 },
                { id: 'prompt_engineering', text: 'Do you have prompt engineering expertise?', weight: 0.2 },
                { id: 'ml_engineers', text: 'How many ML/AI engineers do you have?', weight: 0.2 },
                { id: 'rag_knowledge', text: 'Do you understand RAG (Retrieval Augmented Generation) concepts?', weight: 0.15 },
                { id: 'fine_tuning', text: 'Do you have experience with model fine-tuning?', weight: 0.1 },
                { id: 'evaluation_metrics', text: 'Can you define and measure LLM performance metrics?', weight: 0.1 }
            ]
        },
        'Use Case Definition': {
            questions: [
                { id: 'clear_use_cases', text: 'Have you identified specific LLM use cases?', weight: 0.25 },
                { id: 'success_metrics', text: 'Are success metrics defined for LLM initiatives?', weight: 0.2 },
                { id: 'user_feedback', text: 'Do you have mechanisms for collecting user feedback?', weight: 0.15 },
                { id: 'pilot_planning', text: 'Is there a plan for pilot testing?', weight: 0.2 },
                { id: 'stakeholder_buy_in', text: 'Do you have stakeholder buy-in for LLM projects?', weight: 0.2 }
            ]
        },
        'Operational Readiness': {
            questions: [
                { id: 'deployment_process', text: 'Do you have a mature deployment process?', weight: 0.2 },
                { id: 'incident_response', text: 'Is there an incident response plan for AI systems?', weight: 0.2 },
                { id: 'cost_monitoring', text: 'Can you monitor and control AI-related costs?', weight: 0.15 },
                { id: 'performance_monitoring', text: 'Do you have real-time performance monitoring?', weight: 0.15 },
                { id: 'user_training', text: 'Is there a plan for training end users?', weight: 0.15 },
                { id: 'maintenance_plan', text: 'Do you have a maintenance and update plan?', weight: 0.15 }
            ]
        },
        'Governance & Ethics': {
            questions: [
                { id: 'ai_governance', text: 'Do you have AI governance policies in place?', weight: 0.2 },
                { id: 'bias_detection', text: 'Can you detect and mitigate AI bias?', weight: 0.2 },
                { id: 'explainability', text: 'Do you have requirements for AI explainability?', weight: 0.15 },
                { id: 'compliance_framework', text: 'Is there a compliance framework for AI systems?', weight: 0.2 },
                { id: 'ethical_guidelines', text: 'Are ethical AI guidelines established?', weight: 0.15 },
                { id: 'audit_trail', text: 'Can you maintain audit trails for AI decisions?', weight: 0.1 }
            ]
        }
    };
    
    let html = '<div class="llm-readiness-questions">';
    
    Object.keys(dimensions).forEach(dimensionName => {
        html += `
            <div class="dimension-section">
                <h3>${dimensionName}</h3>
                <div class="questions-grid">
        `;
        
        dimensions[dimensionName].questions.forEach(question => {
            html += `
                <div class="question-item">
                    <label for="${question.id}">${question.text}</label>
                    <select id="${question.id}" data-weight="${question.weight}" onchange="updateReadinessScore()">
                        <option value="1">Poor/No</option>
                        <option value="2">Fair/Limited</option>
                        <option value="3" selected>Good/Moderate</option>
                        <option value="4">Very Good/Strong</option>
                        <option value="5">Excellent/Complete</option>
                    </select>
                    <div class="score-indicator score-good">3</div>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="dimension-score">
                    <span>Dimension Score:</span>
                    <span class="score-value score-good" id="${dimensionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-score">3.0</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Overall score display
    html += `
        <div class="overall-readiness-score">
            <h3>Overall LLM Readiness Score</h3>
            <div class="score-gauge">
                <div class="score-fill score-good" id="readiness-fill" style="width: 60%">60%</div>
            </div>
            <div class="readiness-level level-good" id="readiness-level">Good - Ready with Some Preparation</div>
        </div>
    `;
    
    assessmentContainer.innerHTML = html;
    window.llmDimensions = dimensions; // Store for calculations
}

// Update LLM readiness score
function updateReadinessScore() {
    if (!window.llmDimensions) return;
    
    const dimensionScores = {};
    let overallScore = 0;
    let totalWeight = 0;
    
    Object.keys(window.llmDimensions).forEach(dimensionName => {
        const questions = window.llmDimensions[dimensionName].questions;
        let dimensionScore = 0;
        let dimensionWeight = 0;
        
        questions.forEach(question => {
            const element = document.getElementById(question.id);
            if (element) {
                const value = parseInt(element.value) || 0;
                const weight = parseFloat(element.dataset.weight) || 0;
                
                dimensionScore += value * weight;
                dimensionWeight += weight;
                
                // Update individual question indicator
                const indicator = element.parentNode.querySelector('.score-indicator');
                if (indicator) {
                    indicator.textContent = value;
                    indicator.className = 'score-indicator ' + getScoreClass(value);
                }
            }
        });
        
        const avgDimensionScore = dimensionScore / dimensionWeight;
        dimensionScores[dimensionName] = avgDimensionScore;
        
        // Update dimension score display
        const scoreElement = document.getElementById(dimensionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '-score');
        if (scoreElement) {
            scoreElement.textContent = avgDimensionScore.toFixed(1);
            scoreElement.className = 'score-value ' + getScoreClass(avgDimensionScore);
        }
        
        overallScore += avgDimensionScore;
        totalWeight += 1; // Each dimension has equal weight
    });
    
    const finalScore = overallScore / totalWeight;
    const percentage = (finalScore / 5) * 100;
    
    // Update overall score display
    const fillElement = document.getElementById('readiness-fill');
    const levelElement = document.getElementById('readiness-level');
    
    if (fillElement && levelElement) {
        fillElement.style.width = percentage + '%';
        fillElement.textContent = Math.round(percentage) + '%';
        fillElement.className = 'score-fill ' + getScoreClass(finalScore);
        
        const level = getReadinessLevel(finalScore);
        levelElement.textContent = level.text;
        levelElement.className = 'readiness-level ' + level.class;
    }
}

function getScoreClass(score) {
    if (score >= 4.5) return 'score-excellent';
    if (score >= 3.5) return 'score-good';
    if (score >= 2.5) return 'score-fair';
    if (score >= 1.5) return 'score-poor';
    return 'score-critical';
}

function getReadinessLevel(score) {
    if (score >= 4.5) return { text: 'Excellent - Ready for Advanced LLM Implementation', class: 'level-excellent' };
    if (score >= 3.5) return { text: 'Good - Ready with Some Preparation', class: 'level-good' };
    if (score >= 2.5) return { text: 'Fair - Significant Preparation Needed', class: 'level-fair' };
    if (score >= 1.5) return { text: 'Poor - Extensive Preparation Required', class: 'level-poor' };
    return { text: 'Critical - Major Foundational Work Needed', class: 'level-critical' };
}

// Model Selection Functions
function calculateModelScore(element) {
    const row = element.closest('tr');
    const useCaseFit = parseInt(row.cells[2].querySelector('select').value) || 0;
    const performance = parseInt(row.cells[3].querySelector('select').value) || 0;
    const cost = parseFloat(row.cells[4].querySelector('input').value) || 0;
    const latency = parseInt(row.cells[5].querySelector('select').value) || 0;
    
    // Calculate score (lower cost is better, so we invert it)
    const costScore = Math.max(1, 5 - (cost / 10)); // Normalize cost to 1-5 scale
    const overallScore = (useCaseFit + performance + Math.min(5, costScore) + latency) / 4;
    
    const scoreCell = row.querySelector('.model-score');
    if (scoreCell) {
        scoreCell.textContent = overallScore.toFixed(1);
    }
}

function addModelRow() {
    const tbody = document.getElementById('models-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Model name"></td>
        <td>
            <select>
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Google</option>
                <option>Meta</option>
                <option>Mistral</option>
                <option>Other</option>
            </select>
        </td>
        <td>
            <select onchange="calculateModelScore(this)">
                <option value="1">Poor</option>
                <option value="2">Fair</option>
                <option value="3" selected>Good</option>
                <option value="4">Very Good</option>
                <option value="5">Excellent</option>
            </select>
        </td>
        <td>
            <select onchange="calculateModelScore(this)">
                <option value="1">Poor</option>
                <option value="2">Fair</option>
                <option value="3" selected>Good</option>
                <option value="4">Very Good</option>
                <option value="5">Excellent</option>
            </select>
        </td>
        <td><input type="number" placeholder="15.00" value="15.00" min="0" step="0.01" onchange="calculateModelScore(this)"></td>
        <td>
            <select onchange="calculateModelScore(this)">
                <option value="1">Very Slow (>5s)</option>
                <option value="2">Slow (3-5s)</option>
                <option value="3" selected>Medium (1-3s)</option>
                <option value="4">Fast (0.5-1s)</option>
                <option value="5">Very Fast (<0.5s)</option>
            </select>
        </td>
        <td><input type="number" placeholder="128000" value="128000" min="0"></td>
        <td class="model-score">3.0</td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Vector Database Functions
function calculateVectorDBScore(element) {
    const row = element.closest('tr');
    const performance = parseInt(row.cells[2].querySelector('select').value) || 0;
    const scalability = parseInt(row.cells[3].querySelector('select').value) || 0;
    const cost = parseInt(row.cells[4].querySelector('select').value) || 0;
    const easeOfUse = parseInt(row.cells[5].querySelector('select').value) || 0;
    
    const overallScore = (performance + scalability + cost + easeOfUse) / 4;
    
    const scoreCell = row.querySelector('.vectordb-score');
    if (scoreCell) {
        scoreCell.textContent = overallScore.toFixed(1);
    }
}

function addVectorDBRow() {
    const tbody = document.getElementById('vectordb-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Vector database"></td>
        <td>
            <select>
                <option>Cloud</option>
                <option>Self-hosted</option>
                <option>Hybrid</option>
            </select>
        </td>
        <td>
            <select onchange="calculateVectorDBScore(this)">
                <option value="1">Poor</option>
                <option value="2">Fair</option>
                <option value="3" selected>Good</option>
                <option value="4">Very Good</option>
                <option value="5">Excellent</option>
            </select>
        </td>
        <td>
            <select onchange="calculateVectorDBScore(this)">
                <option value="1">Poor</option>
                <option value="2">Fair</option>
                <option value="3" selected>Good</option>
                <option value="4">Very Good</option>
                <option value="5">Excellent</option>
            </select>
        </td>
        <td>
            <select onchange="calculateVectorDBScore(this)">
                <option value="1">Very Expensive</option>
                <option value="2">Expensive</option>
                <option value="3" selected>Moderate</option>
                <option value="4">Affordable</option>
                <option value="5">Very Affordable</option>
            </select>
        </td>
        <td>
            <select onchange="calculateVectorDBScore(this)">
                <option value="1">Very Difficult</option>
                <option value="2">Difficult</option>
                <option value="3" selected>Moderate</option>
                <option value="4">Easy</option>
                <option value="5">Very Easy</option>
            </select>
        </td>
        <td class="vectordb-score">3.0</td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function addDocProcessingRow() {
    const tbody = document.getElementById('docprocessing-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>PDF</option>
                <option>Word Documents</option>
                <option>Web Pages</option>
                <option>Code Files</option>
                <option>Spreadsheets</option>
                <option>Presentations</option>
                <option>Email</option>
            </select>
        </td>
        <td><input type="number" placeholder="100" value="10" min="0" step="0.1"></td>
        <td>
            <select>
                <option>PyPDF2</option>
                <option>Unstructured</option>
                <option selected>LangChain</option>
                <option>LlamaIndex</option>
                <option>Azure Document Intelligence</option>
                <option>AWS Textract</option>
            </select>
        </td>
        <td>
            <select>
                <option>Fixed size (512 tokens)</option>
                <option selected>Semantic chunking</option>
                <option>Recursive character splitting</option>
                <option>Document structure based</option>
                <option>Sentence-based</option>
            </select>
        </td>
        <td>
            <select>
                <option>text-embedding-ada-002</option>
                <option selected>text-embedding-3-large</option>
                <option>sentence-transformers</option>
                <option>instructor-xl</option>
                <option>e5-large-v2</option>
            </select>
        </td>
        <td><input type="text" placeholder="e.g., 2 hours"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Prompt Engineering Functions
function updatePromptScore(element) {
    const value = element.value;
    const rangeValue = element.nextElementSibling;
    if (rangeValue) {
        rangeValue.textContent = value;
    }
}

function addPromptRow() {
    const tbody = document.getElementById('prompts-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Template name"></td>
        <td>
            <select>
                <option>Question Answering</option>
                <option>Summarization</option>
                <option>Code Analysis</option>
                <option>Creative Writing</option>
                <option>Data Extraction</option>
                <option>Classification</option>
                <option>Translation</option>
            </select>
        </td>
        <td>
            <select>
                <option>Zero-shot</option>
                <option>Few-shot</option>
                <option>Chain-of-Thought</option>
                <option>Role-based</option>
                <option>Template-based</option>
            </select>
        </td>
        <td>
            <input type="range" min="1" max="10" value="5" onchange="updatePromptScore(this)">
            <span class="range-value">5</span>
        </td>
        <td><textarea placeholder="Enter prompt template" rows="2"></textarea></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function addOptimizationRow() {
    const tbody = document.getElementById('optimization-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>Chain-of-Thought</option>
                <option>Few-shot Examples</option>
                <option>Role Specification</option>
                <option>Output Format Control</option>
                <option>Constraint Addition</option>
                <option>Context Optimization</option>
            </select>
        </td>
        <td>
            <select>
                <option>Low</option>
                <option>Medium</option>
                <option selected>High</option>
                <option>Critical</option>
            </select>
        </td>
        <td>
            <select>
                <option>Not Started</option>
                <option selected>Planning</option>
                <option>In Progress</option>
                <option>Testing</option>
                <option>Deployed</option>
            </select>
        </td>
        <td><input type="text" placeholder="e.g., +15% accuracy"></td>
        <td><input type="text" placeholder="Implementation notes"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Infrastructure Functions
function calculateInfraCost(element) {
    const row = element.closest('tr');
    const costPerHour = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const capacity = row.cells[2].querySelector('input').value;
    
    // Extract number from capacity string (e.g., "8 instances" -> 8)
    const instances = parseInt(capacity.match(/\d+/)?.[0]) || 1;
    const monthlyHours = 24 * 30; // Assume 24/7 operation
    const monthlyCost = costPerHour * instances * monthlyHours;
    
    const costCell = row.querySelector('.monthly-cost');
    if (costCell) {
        costCell.textContent = '$' + monthlyCost.toLocaleString();
    }
}

function addComputeRow() {
    const tbody = document.getElementById('compute-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>GPU (A100)</option>
                <option>GPU (H100)</option>
                <option>GPU (V100)</option>
                <option>CPU (High-memory)</option>
                <option>Inference Endpoints</option>
                <option>Serverless</option>
            </select>
        </td>
        <td><input type="text" placeholder="e.g., 4 instances" value="1 instance"></td>
        <td><input type="text" placeholder="e.g., 8 instances" value="4 instances"></td>
        <td><input type="number" placeholder="3.06" value="3.06" min="0" step="0.01" onchange="calculateInfraCost(this)"></td>
        <td>
            <select>
                <option>AWS</option>
                <option>Azure</option>
                <option>Google Cloud</option>
                <option>On-premise</option>
                <option>Other</option>
            </select>
        </td>
        <td class="monthly-cost">$8,870</td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function calculateAPICost() {
    const monthlyRequests = parseInt(document.getElementById('monthly-requests').value) || 0;
    const avgInputTokens = parseInt(document.getElementById('avg-input-tokens').value) || 0;
    const avgOutputTokens = parseInt(document.getElementById('avg-output-tokens').value) || 0;
    const inputCost = parseFloat(document.getElementById('input-token-cost').value) || 0;
    const outputCost = parseFloat(document.getElementById('output-token-cost').value) || 0;
    
    const monthlyInputCost = (monthlyRequests * avgInputTokens * inputCost) / 1000000;
    const monthlyOutputCost = (monthlyRequests * avgOutputTokens * outputCost) / 1000000;
    const totalMonthlyCost = monthlyInputCost + monthlyOutputCost;
    const totalAnnualCost = totalMonthlyCost * 12;
    
    document.getElementById('monthly-api-cost').textContent = '$' + totalMonthlyCost.toLocaleString();
    document.getElementById('annual-api-cost').textContent = '$' + totalAnnualCost.toLocaleString();
}

function addLatencyRow() {
    const tbody = document.getElementById('latency-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Use case"></td>
        <td>
            <select>
                <option>< 100ms</option>
                <option>< 500ms</option>
                <option selected>< 1s</option>
                <option>< 3s</option>
                <option>< 5s</option>
                <option>> 5s</option>
            </select>
        </td>
        <td><input type="text" placeholder="e.g., 2.5s"></td>
        <td><input type="number" placeholder="99.9" value="99.9" min="0" max="100" step="0.1">%</td>
        <td>
            <select>
                <option>No</option>
                <option selected>Yes - Minor</option>
                <option>Yes - Major</option>
                <option>Yes - Critical</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Fine-tuning Functions
function addDatasetRow() {
    const tbody = document.getElementById('dataset-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>Classification</option>
                <option>Question Answering</option>
                <option>Summarization</option>
                <option>Code Generation</option>
                <option>Domain Adaptation</option>
                <option>Instruction Following</option>
            </select>
        </td>
        <td><input type="number" placeholder="10000" value="5000" min="0"></td>
        <td>
            <select>
                <option>Poor</option>
                <option>Fair</option>
                <option selected>Good</option>
                <option>Very Good</option>
                <option>Excellent</option>
            </select>
        </td>
        <td>
            <select>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Needs Review</option>
            </select>
        </td>
        <td><input type="number" placeholder="25000" value="15000" min="0"></td>
        <td><input type="text" placeholder="e.g., 8 weeks" value="6 weeks"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function addMetricRow() {
    const tbody = document.getElementById('metrics-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>BLEU Score</option>
                <option>ROUGE Score</option>
                <option>Accuracy</option>
                <option>F1 Score</option>
                <option>Perplexity</option>
                <option>Human Evaluation</option>
                <option>Task-specific Metric</option>
            </select>
        </td>
        <td><input type="number" placeholder="0.65" value="0.60" min="0" max="1" step="0.01"></td>
        <td><input type="number" placeholder="0.85" value="0.80" min="0" max="1" step="0.01"></td>
        <td><input type="number" placeholder="0.78" value="0.70" min="0" max="1" step="0.01"></td>
        <td>
            <select>
                <option>Low</option>
                <option>Medium</option>
                <option selected>High</option>
                <option>Critical</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Security Functions
function addPrivacyRow() {
    const tbody = document.getElementById('privacy-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>PII in Training Data</option>
                <option>Customer Data Leakage</option>
                <option>Model Memorization</option>
                <option>Data Residency</option>
                <option>Third-party Access</option>
                <option>Audit Trail Gaps</option>
            </select>
        </td>
        <td>
            <select>
                <option>Low</option>
                <option selected>Medium</option>
                <option>High</option>
                <option>Critical</option>
            </select>
        </td>
        <td><input type="text" placeholder="Current controls"></td>
        <td>
            <select>
                <option>GDPR</option>
                <option>CCPA</option>
                <option>HIPAA</option>
                <option>SOC 2</option>
                <option>ISO 27001</option>
                <option>Internal Policy</option>
            </select>
        </td>
        <td><input type="text" placeholder="Mitigation strategy"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function addSecurityRow() {
    const tbody = document.getElementById('security-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>Input Validation</option>
                <option>Output Filtering</option>
                <option>Rate Limiting</option>
                <option>Authentication</option>
                <option>Encryption at Rest</option>
                <option>Encryption in Transit</option>
                <option>Prompt Injection Protection</option>
            </select>
        </td>
        <td>
            <select>
                <option>Not Started</option>
                <option selected>In Progress</option>
                <option>Implemented</option>
                <option>Needs Update</option>
            </select>
        </td>
        <td>
            <select>
                <option>Low</option>
                <option>Medium</option>
                <option selected>High</option>
                <option>Very High</option>
            </select>
        </td>
        <td><input type="number" placeholder="5000" value="3000" min="0"></td>
        <td><input type="text" placeholder="Timeline" value="3 weeks"></td>
        <td><input type="text" placeholder="Owner" value="Security Team"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Cost Analysis Functions
function calculateTotalCosts() {
    const tbody = document.getElementById('costs-tbody');
    let totalOneTime = 0;
    let totalMonthly = 0;
    let totalAnnual = 0;
    
    for (let row of tbody.rows) {
        const oneTime = parseFloat(row.cells[1].querySelector('input').value) || 0;
        const monthly = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const annual = monthly * 12;
        
        totalOneTime += oneTime;
        totalMonthly += monthly;
        totalAnnual += annual;
        
        // Update annual cost cell
        row.cells[3].textContent = '$' + annual.toLocaleString();
    }
    
    document.getElementById('total-onetime').textContent = '$' + totalOneTime.toLocaleString();
    document.getElementById('total-monthly').textContent = '$' + totalMonthly.toLocaleString();
    document.getElementById('total-annual').textContent = '$' + totalAnnual.toLocaleString();
}

function addCostRow() {
    const tbody = document.getElementById('costs-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>Infrastructure</option>
                <option>Model Licensing</option>
                <option>API Costs</option>
                <option>Development</option>
                <option>Training/Fine-tuning</option>
                <option>Security & Compliance</option>
                <option>Operations & Support</option>
            </select>
        </td>
        <td><input type="number" placeholder="100000" value="50000" min="0" onchange="calculateTotalCosts()"></td>
        <td><input type="number" placeholder="15000" value="10000" min="0" onchange="calculateTotalCosts()"></td>
        <td class="annual-cost">$120,000</td>
        <td><input type="text" placeholder="Additional notes"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function calculateLLMROI() {
    const costSavings = parseFloat(document.getElementById('llm-cost-savings').value) || 0;
    const revenueIncrease = parseFloat(document.getElementById('llm-revenue-increase').value) || 0;
    const productivityImprovement = parseFloat(document.getElementById('productivity-improvement').value) || 0;
    const riskMitigation = parseFloat(document.getElementById('risk-mitigation').value) || 0;
    
    const totalBenefits = costSavings + revenueIncrease + riskMitigation + (costSavings * productivityImprovement / 100);
    const totalCosts = parseFloat(document.getElementById('total-annual').textContent.replace(/[$,]/g, '')) || 1000000;
    
    const netValue = totalBenefits - totalCosts;
    const roiPercentage = totalCosts > 0 ? (netValue / totalCosts) * 100 : 0;
    const paybackPeriod = totalBenefits > 0 ? totalCosts / totalBenefits : 0;
    
    document.getElementById('total-benefits').textContent = '$' + totalBenefits.toLocaleString();
    document.getElementById('net-value').textContent = '$' + netValue.toLocaleString();
    document.getElementById('llm-roi').textContent = roiPercentage.toFixed(1) + '%';
    document.getElementById('llm-payback').textContent = paybackPeriod.toFixed(1) + ' years';
    
    // Update color classes
    const netValueElement = document.getElementById('net-value');
    const roiElement = document.getElementById('llm-roi');
    
    if (netValue > 0) {
        netValueElement.className = 'score-value roi-positive';
        roiElement.className = 'score-value roi-positive';
    } else if (netValue === 0) {
        netValueElement.className = 'score-value roi-neutral';
        roiElement.className = 'score-value roi-neutral';
    } else {
        netValueElement.className = 'score-value roi-negative';
        roiElement.className = 'score-value roi-negative';
    }
}

function addOptimizationCostRow() {
    const tbody = document.getElementById('optimization-costs-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>Model Size Optimization</option>
                <option>Caching Strategy</option>
                <option>Batch Processing</option>
                <option>Alternative Model Provider</option>
                <option>Self-hosted Deployment</option>
                <option>Fine-tune Smaller Model</option>
            </select>
        </td>
        <td><input type="number" placeholder="120000" value="50000" min="0"></td>
        <td>
            <select>
                <option>Low</option>
                <option selected>Medium</option>
                <option>High</option>
            </select>
        </td>
        <td><input type="text" placeholder="Timeline" value="4 weeks"></td>
        <td>
            <select>
                <option selected>Low</option>
                <option>Medium</option>
                <option>High</option>
            </select>
        </td>
        <td>
            <select>
                <option>Not Started</option>
                <option selected>Evaluating</option>
                <option>In Progress</option>
                <option>Completed</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Roadmap Functions
function addPhaseRow() {
    const tbody = document.getElementById('phases-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>Phase 1 - Foundation</option>
                <option>Phase 2 - Pilot</option>
                <option>Phase 3 - Scale</option>
                <option>Phase 4 - Optimize</option>
                <option>Phase 5 - Enterprise</option>
            </select>
        </td>
        <td><input type="text" placeholder="Initiative"></td>
        <td><input type="number" placeholder="8" value="6" min="1" max="52"></td>
        <td><input type="text" placeholder="Dependencies"></td>
        <td><input type="text" placeholder="Owner"></td>
        <td><input type="text" placeholder="Success criteria"></td>
        <td>
            <select>
                <option>Not Started</option>
                <option>Planning</option>
                <option>In Progress</option>
                <option>Testing</option>
                <option>Completed</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function addMilestoneRow() {
    const tbody = document.getElementById('milestones-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Milestone"></td>
        <td><input type="date"></td>
        <td><input type="text" placeholder="Deliverables"></td>
        <td><input type="text" placeholder="Success metrics"></td>
        <td>
            <select>
                <option>Low</option>
                <option selected>Medium</option>
                <option>High</option>
                <option>Critical</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function calculateResourceCost(element) {
    const row = element.closest('tr');
    const quantity = parseInt(row.cells[1].querySelector('input').value) || 0;
    const costPerMonth = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const allocationPeriod = parseInt(row.cells[4].querySelector('input').value) || 1;
    
    const totalCost = quantity * costPerMonth * allocationPeriod;
    
    const totalCostCell = row.querySelector('.resource-total-cost');
    if (totalCostCell) {
        totalCostCell.textContent = '$' + totalCost.toLocaleString();
    }
    
    updateTotalResourceCost();
}

function updateTotalResourceCost() {
    const tbody = document.getElementById('resources-tbody');
    let totalResourceCost = 0;
    
    for (let row of tbody.rows) {
        const costText = row.querySelector('.resource-total-cost').textContent;
        const cost = parseFloat(costText.replace(/[$,]/g, '')) || 0;
        totalResourceCost += cost;
    }
    
    document.getElementById('total-resource-cost').textContent = '$' + totalResourceCost.toLocaleString();
}

function addResourceRow() {
    const tbody = document.getElementById('resources-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>ML Engineers</option>
                <option>Data Scientists</option>
                <option>Software Engineers</option>
                <option>DevOps Engineers</option>
                <option>Product Managers</option>
                <option>Data Engineers</option>
                <option>Security Specialists</option>
            </select>
        </td>
        <td><input type="number" placeholder="3" value="2" min="0" onchange="calculateResourceCost(this)"></td>
        <td>
            <select>
                <option>Available</option>
                <option>Partial</option>
                <option>Need to Hire</option>
                <option>Contractor</option>
            </select>
        </td>
        <td><input type="number" placeholder="15000" value="12000" min="0" onchange="calculateResourceCost(this)"></td>
        <td><input type="number" placeholder="12" value="6" min="1" onchange="calculateResourceCost(this)"> months</td>
        <td class="resource-total-cost">$144,000</td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

function addRoadmapRiskRow() {
    const tbody = document.getElementById('roadmap-risks-tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td>
            <select>
                <option>Model Performance Below Expectations</option>
                <option>Data Quality Issues</option>
                <option>Technical Team Unavailable</option>
                <option>Budget Overrun</option>
                <option>Timeline Delays</option>
                <option>Security Vulnerabilities</option>
                <option>Stakeholder Resistance</option>
            </select>
        </td>
        <td>
            <select>
                <option>Low</option>
                <option>Medium</option>
                <option selected>High</option>
                <option>Critical</option>
            </select>
        </td>
        <td>
            <select>
                <option>Low</option>
                <option selected>Medium</option>
                <option>High</option>
            </select>
        </td>
        <td><input type="text" placeholder="Mitigation strategy"></td>
        <td><input type="text" placeholder="Owner"></td>
        <td>
            <select>
                <option>Identified</option>
                <option selected>Planned</option>
                <option>In Progress</option>
                <option>Mitigated</option>
            </select>
        </td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
}

// Common Functions
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
    
    // Recalculate totals if needed
    if (button.closest('#costs-tbody')) {
        calculateTotalCosts();
    }
    if (button.closest('#resources-tbody')) {
        updateTotalResourceCost();
    }
}

function initializeCalculations() {
    // Initialize API cost calculation
    calculateAPICost();
    calculateTotalCosts();
    calculateLLMROI();
    updateTotalResourceCost();
    updateReadinessScore();
    
    // Attach event listeners to cost inputs
    const apiInputs = ['monthly-requests', 'avg-input-tokens', 'avg-output-tokens', 'input-token-cost', 'output-token-cost'];
    apiInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateAPICost);
        }
    });
    
    const roiInputs = ['llm-cost-savings', 'llm-revenue-increase', 'productivity-improvement', 'risk-mitigation'];
    roiInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateLLMROI);
        }
    });
}

// Export and Save Functions
async function exportToExcel() {
    try {
        // Show loading overlay
        if (window.LoadingOverlay) {
            LoadingOverlay.show('📊 Generating Excel file...');
        }
        
        const wb = XLSX.utils.book_new();
        
        // Collect data from all tabs
        const data = {
            'Readiness Assessment': collectReadinessData(),
            'Model Selection': collectTableData('models-tbody'),
            'Vector Databases': collectTableData('vectordb-tbody'),
            'Document Processing': collectTableData('docprocessing-tbody'),
            'Prompt Templates': collectTableData('prompts-tbody'),
            'Infrastructure': collectTableData('compute-tbody'),
            'Datasets': collectTableData('dataset-tbody'),
            'Security Controls': collectTableData('security-tbody'),
            'Costs': collectTableData('costs-tbody'),
            'Roadmap': collectTableData('phases-tbody')
        };
        
        // Create worksheets
        Object.keys(data).forEach(sheetName => {
            if (data[sheetName] && data[sheetName].length > 0) {
                const ws = XLSX.utils.json_to_sheet(data[sheetName]);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            }
        });
        
        // Generate and download file
        const fileName = `LLM_Implementation_Assessment_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        // Hide loading and show success
        if (window.LoadingOverlay) {
            LoadingOverlay.hide();
        }
        if (window.notify) {
            window.notify.show('✅ Excel file downloaded successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Export failed:', error);
        
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
        timestamp: new Date().toISOString(),
        readiness: collectReadinessData(),
        tables: {
            models: collectTableData('models-tbody'),
            vectorDbs: collectTableData('vectordb-tbody'),
            docProcessing: collectTableData('docprocessing-tbody'),
            prompts: collectTableData('prompts-tbody'),
            infrastructure: collectTableData('compute-tbody'),
            datasets: collectTableData('dataset-tbody'),
            security: collectTableData('security-tbody'),
            costs: collectTableData('costs-tbody'),
            roadmap: collectTableData('phases-tbody')
        },
        formInputs: {},
        calculations: {
            apiCost: {
                monthlyRequests: document.getElementById('monthly-requests')?.value,
                avgInputTokens: document.getElementById('avg-input-tokens')?.value,
                avgOutputTokens: document.getElementById('avg-output-tokens')?.value,
                inputTokenCost: document.getElementById('input-token-cost')?.value,
                outputTokenCost: document.getElementById('output-token-cost')?.value
            },
            roi: {
                costSavings: document.getElementById('llm-cost-savings')?.value,
                revenueIncrease: document.getElementById('llm-revenue-increase')?.value,
                productivityImprovement: document.getElementById('productivity-improvement')?.value,
                riskMitigation: document.getElementById('risk-mitigation')?.value
            }
        }
    };
    
    // Collect all form inputs by ID
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(element => {
        if (element.id) {
            data.formInputs[element.id] = element.value;
        }
    });
    
    return data;
}

function collectReadinessData() {
    if (!window.llmDimensions) return [];
    
    const data = [];
    Object.keys(window.llmDimensions).forEach(dimensionName => {
        window.llmDimensions[dimensionName].questions.forEach(question => {
            const element = document.getElementById(question.id);
            if (element) {
                data.push({
                    'id': question.id,
                    'Dimension': dimensionName,
                    'Question': question.text,
                    'Score': element.value,
                    'Weight': question.weight
                });
            }
        });
    });
    return data;
}

function collectTableData(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return [];
    
    const data = [];
    const headers = Array.from(tbody.closest('table').querySelector('thead tr').cells)
        .map(cell => cell.textContent.trim())
        .filter(header => header !== 'Actions');
    
    Array.from(tbody.rows).forEach(row => {
        const rowData = {};
        Array.from(row.cells).forEach((cell, index) => {
            if (index < headers.length) {
                const input = cell.querySelector('input, select, textarea');
                rowData[headers[index]] = input ? input.value : cell.textContent.trim();
            }
        });
        data.push(rowData);
    });
    
    return data;
}

function saveProgress() {
    // Use the auto-save system's manual save
    if (window.autoSave && window.autoSave.manualSave) {
        window.autoSave.manualSave();
        return;
    }
    // Fallback to original implementation
    try {
        const data = collectAllData();
        localStorage.setItem('llmFrameworkData', JSON.stringify(data));
        
        // Show success notification
        if (window.notify) {
            window.notify.show('✅ Progress saved successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Save failed:', error);
        if (window.notify) {
            window.notify.show('❌ Save failed: ' + error.message, 'error');
        }
    }
}

// Make restoreData globally accessible for auto-save
window.restoreData = function restoreData(data) {
    if (!data) return;
    
    try {
        // Restore readiness assessment scores
        if (data.readiness) {
            data.readiness.forEach(item => {
                const element = document.getElementById(item.id);
                if (element) {
                    element.value = item.Score;
                }
            });
            // Recalculate scores after loading
            setTimeout(() => updateReadinessScore(), 100);
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
        
        // Restore API cost inputs
        if (data.calculations?.apiCost) {
            const apiCost = data.calculations.apiCost;
            Object.keys(apiCost).forEach(key => {
                const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
                if (element && apiCost[key]) {
                    element.value = apiCost[key];
                }
            });
            calculateAPICost();
        }
        
        // Restore ROI inputs
        if (data.calculations?.roi) {
            const roi = data.calculations.roi;
            Object.keys(roi).forEach(key => {
                const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
                if (element && roi[key]) {
                    element.value = roi[key];
                }
            });
            calculateLLMROI();
        }
        
        // Recalculate all scores
        setTimeout(() => {
            updateReadinessScore();
            calculateAPICost();
            calculateLLMROI();
        }, 200);
    } catch (error) {
        console.error('Error restoring data:', error);
    }
}

function loadSavedData() {
    try {
        const savedData = localStorage.getItem('llmFrameworkData');
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log('Loading saved data...', data);
            
            // Use the restoreData function
            window.restoreData(data);
            
            // Show success message
            showDataLoadedMessage();
        }
    } catch (error) {
        console.error('Load failed:', error);
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

function generateShareableLink() {
    try {
        const data = {
            r: collectReadinessData(),
            t: {
                m: collectTableData('models-tbody'),
                v: collectTableData('vectordb-tbody'),
                p: collectTableData('prompts-tbody'),
                i: collectTableData('compute-tbody'),
                c: collectTableData('costs-tbody')
            }
        };
        
        const compressed = btoa(JSON.stringify(data));
        const url = `${window.location.origin}${window.location.pathname}?data=${compressed}`;
        
        navigator.clipboard.writeText(url).then(() => {
            if (window.notify) {
                window.notify.show('📋 Shareable link copied to clipboard!', 'success');
            } else {
                alert('Shareable link copied to clipboard!');
            }
        }).catch(() => {
            prompt('Copy this shareable link:', url);
        });
        
    } catch (error) {
        console.error('Generate link failed:', error);
        if (window.notify) {
            window.notify.show('❌ Failed to generate shareable link: ' + error.message, 'error');
        } else {
            alert('Failed to generate shareable link.');
        }
    }
}

function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
        try {
            const data = JSON.parse(atob(dataParam));
            
            // Restore readiness data
            if (data.r) {
                data.r.forEach(item => {
                    const element = document.getElementById(item.Question?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase());
                    if (element && item.Score) {
                        element.value = item.Score;
                    }
                });
                updateReadinessScore();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load data from URL:', error);
        }
    }
    
    return false;
}

function generateReport() {
    const reportWindow = window.open('', '_blank');
    const reportContent = generateReportHTML();
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    
    // Trigger print dialog
    reportWindow.onload = function() {
        reportWindow.print();
    };
}

function generateReportHTML() {
    const readinessData = collectReadinessData();
    const currentDate = new Date().toLocaleDateString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>LLM Implementation Assessment Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 40px; }
                .section { margin-bottom: 30px; }
                .score { font-size: 24px; font-weight: bold; color: #6366f1; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>LLM Implementation Assessment Report</h1>
                <p>Generated on ${currentDate}</p>
            </div>
            
            <div class="section">
                <h2>Executive Summary</h2>
                <p>This report provides a comprehensive assessment of your organization's readiness for Large Language Model implementation.</p>
                <div class="score">Overall Readiness Score: ${document.getElementById('readiness-fill')?.textContent || 'N/A'}</div>
            </div>
            
            <div class="section">
                <h2>Readiness Assessment Details</h2>
                <table>
                    <tr><th>Dimension</th><th>Question</th><th>Score</th></tr>
                    ${readinessData.map(item => `<tr><td>${item.Dimension}</td><td>${item.Question}</td><td>${item.Score}/5</td></tr>`).join('')}
                </table>
            </div>
            
            <div class="section">
                <h2>Recommendations</h2>
                <ul>
                    <li>Focus on areas with lower scores</li>
                    <li>Develop a phased implementation approach</li>
                    <li>Invest in team training and skill development</li>
                    <li>Establish clear governance and security frameworks</li>
                </ul>
            </div>
        </body>
        </html>
    `;
}

function resetCalculator() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.removeItem('llmFrameworkData');
        
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

// Initialize calculations on input changes
document.addEventListener('input', function(e) {
    if (e.target.matches('#costs-tbody input[type="number"]')) {
        calculateTotalCosts();
    }
    if (e.target.matches('#resources-tbody input[type="number"]')) {
        calculateResourceCost(e.target);
    }
});// Export saveProgress as global
window.saveProgress = saveProgress;
window.resetCalculator = resetCalculator;
window.shareResults = shareResults;
