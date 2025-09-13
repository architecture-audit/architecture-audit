// Cloud Migration Calculator JavaScript

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeCalculations();
    initializeServiceMapping();
    initializeCloudProviders();
    
    // Initialize auto-save
    function initAutoSave() {
        if (window.AutoSave) {
            window.autoSave = new AutoSave('cloud-migration', 15000);
            console.log("✅ Auto-save initialized for cloud-migration");
            return true;
        }
        return false;
    }
    
    if (!initAutoSave()) {
        setTimeout(() => {
            if (!initAutoSave()) {
                setTimeout(() => {
                    if (!initAutoSave()) {
                        console.warn("⚠️ AutoSave initialization delayed for cloud-migration");
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

// Cloud Provider Selection
function initializeCloudProviders() {
    const cloudCards = document.querySelectorAll('.cloud-card');
    cloudCards.forEach(card => {
        card.addEventListener('click', function() {
            cloudCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const provider = this.getAttribute('data-provider');
            updateProviderSpecificOptions(provider);
            calculateCloudCosts();
        });
    });
}

// Update provider-specific options
function updateProviderSpecificOptions(provider) {
    const serviceMapping = document.getElementById('service-mapping-container');
    if (!serviceMapping) return;
    
    // Clear existing mapping
    serviceMapping.innerHTML = '';
    
    // Add cloud-to-cloud migration options
    const migrationPaths = {
        'aws': ['Azure', 'GCP', 'On-Premise'],
        'azure': ['AWS', 'GCP', 'On-Premise'],
        'gcp': ['AWS', 'Azure', 'On-Premise'],
        'onprem': ['AWS', 'Azure', 'GCP']
    };
    
    const targetProviders = migrationPaths[provider] || [];
    
    const pathSelector = document.createElement('div');
    pathSelector.className = 'migration-path-selector';
    pathSelector.innerHTML = `
        <h3>Select Migration Path</h3>
        <div class="migration-options">
            ${targetProviders.map(target => `
                <div class="migration-option" data-source="${provider}" data-target="${target.toLowerCase().replace('-', '')}">
                    <h4>${provider.toUpperCase()} → ${target}</h4>
                    <p>Migrate from ${provider.toUpperCase()} to ${target}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    serviceMapping.appendChild(pathSelector);
    
    // Add click handlers for migration paths
    pathSelector.querySelectorAll('.migration-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.migration-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            
            const source = this.dataset.source;
            const target = this.dataset.target;
            loadServiceMapping(source, target);
        });
    });
}

// Service-to-Service Mapping
function loadServiceMapping(source, target) {
    const mappingContainer = document.getElementById('service-mapping-table');
    if (!mappingContainer) return;
    
    const serviceMappings = getServiceMappings(source, target);
    
    mappingContainer.innerHTML = `
        <h3>Service Mapping: ${source.toUpperCase()} to ${target.toUpperCase()}</h3>
        <table class="assessment-table">
            <thead>
                <tr>
                    <th>Current Service (${source.toUpperCase()})</th>
                    <th>Target Service (${target.toUpperCase()})</th>
                    <th>Complexity</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="service-mapping-tbody">
                ${serviceMappings.map((mapping, index) => `
                    <tr data-mapping-id="${index}">
                        <td>
                            <select class="source-service" onchange="updateTargetService(${index})">
                                <option value="">Select Service</option>
                                ${getSourceServices(source).map(s => 
                                    `<option value="${s}" ${s === mapping.source ? 'selected' : ''}>${s}</option>`
                                ).join('')}
                            </select>
                        </td>
                        <td class="target-service">${mapping.target || '-'}</td>
                        <td class="complexity">${mapping.complexity || '-'}</td>
                        <td>
                            <input type="text" class="mapping-notes" value="${mapping.notes || ''}" 
                                   placeholder="Migration notes...">
                        </td>
                        <td>
                            <button class="remove-btn" onclick="removeServiceMapping(${index})">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button class="btn btn-secondary" onclick="addServiceMapping()">+ Add Service Mapping</button>
    `;
}

// Get service mappings database
function getServiceMappings(source, target) {
    const mappings = {
        'aws_azure': [
            { source: 'EC2', target: 'Virtual Machines', complexity: 'Low' },
            { source: 'S3', target: 'Blob Storage', complexity: 'Low' },
            { source: 'RDS', target: 'Azure SQL Database', complexity: 'Medium' },
            { source: 'Lambda', target: 'Azure Functions', complexity: 'Medium' },
            { source: 'DynamoDB', target: 'Cosmos DB', complexity: 'High' },
            { source: 'EKS', target: 'AKS', complexity: 'Medium' },
            { source: 'CloudFront', target: 'Azure CDN', complexity: 'Low' }
        ],
        'aws_gcp': [
            { source: 'EC2', target: 'Compute Engine', complexity: 'Low' },
            { source: 'S3', target: 'Cloud Storage', complexity: 'Low' },
            { source: 'RDS', target: 'Cloud SQL', complexity: 'Medium' },
            { source: 'Lambda', target: 'Cloud Functions', complexity: 'Medium' },
            { source: 'DynamoDB', target: 'Firestore', complexity: 'High' },
            { source: 'EKS', target: 'GKE', complexity: 'Medium' }
        ],
        'azure_aws': [
            { source: 'Virtual Machines', target: 'EC2', complexity: 'Low' },
            { source: 'Blob Storage', target: 'S3', complexity: 'Low' },
            { source: 'Azure SQL Database', target: 'RDS', complexity: 'Medium' },
            { source: 'Azure Functions', target: 'Lambda', complexity: 'Medium' },
            { source: 'Cosmos DB', target: 'DynamoDB', complexity: 'High' }
        ],
        'azure_gcp': [
            { source: 'Virtual Machines', target: 'Compute Engine', complexity: 'Low' },
            { source: 'Blob Storage', target: 'Cloud Storage', complexity: 'Low' },
            { source: 'Azure SQL Database', target: 'Cloud SQL', complexity: 'Medium' },
            { source: 'Azure Functions', target: 'Cloud Functions', complexity: 'Medium' }
        ]
    };
    
    const key = `${source}_${target}`;
    return mappings[key] || [];
}

// Get source services for dropdown
function getSourceServices(provider) {
    const services = {
        'aws': ['EC2', 'S3', 'RDS', 'Lambda', 'DynamoDB', 'EKS', 'CloudFront', 'Route53', 'VPC', 'IAM', 'CloudWatch', 'SNS', 'SQS', 'Kinesis', 'Redshift', 'ElastiCache', 'API Gateway', 'CloudFormation', 'Cognito', 'SES'],
        'azure': ['Virtual Machines', 'Blob Storage', 'Azure SQL Database', 'Azure Functions', 'Cosmos DB', 'AKS', 'Azure CDN', 'Azure DNS', 'Virtual Network', 'Azure AD', 'Azure Monitor', 'Event Hub', 'Service Bus', 'Stream Analytics', 'Synapse Analytics', 'Azure Cache', 'API Management', 'ARM Templates', 'Azure AD B2C'],
        'gcp': ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions', 'Firestore', 'GKE', 'Cloud CDN', 'Cloud DNS', 'VPC', 'Cloud IAM', 'Cloud Monitoring', 'Pub/Sub', 'Cloud Tasks', 'Dataflow', 'BigQuery', 'Memorystore', 'API Gateway', 'Deployment Manager', 'Firebase Auth'],
        'onprem': ['Physical Servers', 'SAN Storage', 'Database Servers', 'Application Servers', 'Load Balancers', 'Kubernetes Cluster', 'CDN', 'DNS Servers', 'Network Infrastructure', 'Active Directory', 'Monitoring Tools', 'Message Queue', 'ETL Tools', 'Data Warehouse', 'Cache Servers', 'API Gateway', 'Configuration Management', 'LDAP']
    };
    
    return services[provider] || [];
}

// Update target service based on source selection
function updateTargetService(index) {
    const row = document.querySelector(`tr[data-mapping-id="${index}"]`);
    const sourceSelect = row.querySelector('.source-service');
    const targetCell = row.querySelector('.target-service');
    const complexityCell = row.querySelector('.complexity');
    
    const sourceService = sourceSelect.value;
    if (!sourceService) {
        targetCell.textContent = '-';
        complexityCell.textContent = '-';
        return;
    }
    
    // Get automatic mapping suggestion
    const mapping = getAutomaticMapping(sourceService);
    targetCell.textContent = mapping.target;
    complexityCell.textContent = mapping.complexity;
}

// Get automatic mapping for a service
function getAutomaticMapping(sourceService) {
    const mappingDatabase = {
        // AWS to Azure
        'EC2': { target: 'Virtual Machines', complexity: 'Low' },
        'S3': { target: 'Blob Storage', complexity: 'Low' },
        'RDS': { target: 'Azure SQL Database', complexity: 'Medium' },
        'Lambda': { target: 'Azure Functions', complexity: 'Medium' },
        'DynamoDB': { target: 'Cosmos DB', complexity: 'High' },
        // Azure to AWS
        'Virtual Machines': { target: 'EC2', complexity: 'Low' },
        'Blob Storage': { target: 'S3', complexity: 'Low' },
        'Azure SQL Database': { target: 'RDS', complexity: 'Medium' },
        // Add more mappings as needed
    };
    
    return mappingDatabase[sourceService] || { target: 'Manual Mapping Required', complexity: 'High' };
}

// Add new service mapping row
function addServiceMapping() {
    const tbody = document.getElementById('service-mapping-tbody');
    if (!tbody) return;
    
    const newRow = document.createElement('tr');
    const index = tbody.children.length;
    newRow.dataset.mappingId = index;
    
    newRow.innerHTML = `
        <td>
            <select class="source-service" onchange="updateTargetService(${index})">
                <option value="">Select Service</option>
                ${getSourceServices('aws').map(s => 
                    `<option value="${s}">${s}</option>`
                ).join('')}
            </select>
        </td>
        <td class="target-service">-</td>
        <td class="complexity">-</td>
        <td>
            <input type="text" class="mapping-notes" placeholder="Migration notes...">
        </td>
        <td>
            <button class="remove-btn" onclick="removeServiceMapping(${index})">Remove</button>
        </td>
    `;
    
    tbody.appendChild(newRow);
}

// Remove service mapping row
function removeServiceMapping(index) {
    const row = document.querySelector(`tr[data-mapping-id="${index}"]`);
    if (row) {
        row.remove();
    }
}

// Initialize service mapping section
function initializeServiceMapping() {
    // Create service mapping container if it doesn't exist
    const mappingTab = document.getElementById('service-mapping');
    if (mappingTab && !document.getElementById('service-mapping-container')) {
        const container = document.createElement('div');
        container.id = 'service-mapping-container';
        container.className = 'service-mapping-section';
        
        const table = document.createElement('div');
        table.id = 'service-mapping-table';
        
        mappingTab.appendChild(container);
        mappingTab.appendChild(table);
    }
}

// Application Inventory Functions
function addInventoryRow() {
    const tbody = document.getElementById('inventory-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="App Name"></td>
        <td>
            <select>
                <option>Web Application</option>
                <option>API Service</option>
                <option>Database</option>
                <option>Batch Processing</option>
                <option>Microservice</option>
            </select>
        </td>
        <td><input type="text" placeholder="Java, Python, etc."></td>
        <td><input type="number" placeholder="1-5" min="1" max="5"></td>
        <td>
            <select>
                <option>Rehost</option>
                <option>Replatform</option>
                <option>Refactor</option>
                <option>Repurchase</option>
                <option>Retire</option>
                <option>Retain</option>
            </select>
        </td>
        <td><input type="number" placeholder="0" min="0"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
    updateInventoryStats();
}

function removeRow(button) {
    button.closest('tr').remove();
    updateInventoryStats();
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
                <option>Security</option>
                <option>Compliance</option>
                <option>Operational</option>
            </select>
        </td>
        <td>
            <select onchange="updateRiskScore(this)">
                <option value="1">Very Low</option>
                <option value="2">Low</option>
                <option value="3">Medium</option>
                <option value="4">High</option>
                <option value="5">Very High</option>
            </select>
        </td>
        <td>
            <select onchange="updateRiskScore(this)">
                <option value="1">Very Low</option>
                <option value="2">Low</option>
                <option value="3">Medium</option>
                <option value="4">High</option>
                <option value="5">Very High</option>
            </select>
        </td>
        <td class="risk-score">1</td>
        <td><input type="text" placeholder="Mitigation strategy"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

function updateRiskScore(select) {
    const row = select.closest('tr');
    const probability = parseInt(row.cells[2].querySelector('select').value);
    const impact = parseInt(row.cells[3].querySelector('select').value);
    const score = probability * impact;
    row.cells[4].textContent = score;
    row.cells[4].className = getRiskClass(score);
}

function getRiskClass(score) {
    if (score <= 5) return 'risk-score risk-low';
    if (score <= 10) return 'risk-score risk-medium';
    if (score <= 15) return 'risk-score risk-high';
    return 'risk-score risk-critical';
}

// Business Case Functions
function addUseCaseRow() {
    const tbody = document.getElementById('usecase-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Use case name"></td>
        <td><input type="text" placeholder="Expected benefits"></td>
        <td><input type="number" placeholder="0" min="0" onchange="calculateROI()"></td>
        <td><input type="number" placeholder="0" min="0" onchange="calculateROI()"></td>
        <td><input type="number" placeholder="12" min="1" onchange="calculateROI()"></td>
        <td class="roi">0%</td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Compliance Functions
function addComplianceRow() {
    const tbody = document.getElementById('compliance-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Requirement"></td>
        <td>
            <select>
                <option>GDPR</option>
                <option>HIPAA</option>
                <option>PCI-DSS</option>
                <option>SOC 2</option>
                <option>ISO 27001</option>
                <option>Custom</option>
            </select>
        </td>
        <td>
            <select>
                <option>Compliant</option>
                <option>Partial</option>
                <option>Non-Compliant</option>
                <option>N/A</option>
            </select>
        </td>
        <td><input type="text" placeholder="Actions needed"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Vendor Selection Functions
function addVendorRow() {
    const tbody = document.getElementById('vendor-tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Service name"></td>
        <td><input type="text" placeholder="AWS option"></td>
        <td><input type="text" placeholder="Azure option"></td>
        <td><input type="text" placeholder="GCP option"></td>
        <td>
            <select>
                <option>AWS</option>
                <option>Azure</option>
                <option>GCP</option>
                <option>Multi-Cloud</option>
            </select>
        </td>
        <td><input type="text" placeholder="Justification"></td>
        <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
    `;
    tbody.appendChild(newRow);
}

// Calculations
function initializeCalculations() {
    // Add change listeners to all inputs
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('change', updateCalculations);
    });
}

function updateCalculations() {
    updateInventoryStats();
    calculateReadinessScore();
    calculateCloudCosts();
    calculateROI();
    updateRiskMatrix();
}

function updateInventoryStats() {
    const rows = document.querySelectorAll('#inventory-tbody tr');
    const total = rows.length;
    
    const strategies = {};
    rows.forEach(row => {
        const strategy = row.querySelector('select').value;
        strategies[strategy] = (strategies[strategy] || 0) + 1;
    });
    
    // Update summary display
    const summaryElement = document.getElementById('inventory-summary');
    if (summaryElement) {
        summaryElement.innerHTML = `
            <h3>Inventory Summary</h3>
            <p>Total Applications: ${total}</p>
            ${Object.entries(strategies).map(([strategy, count]) => 
                `<p>${strategy}: ${count} (${((count/total)*100).toFixed(1)}%)</p>`
            ).join('')}
        `;
    }
}

function calculateReadinessScore() {
    let totalScore = 0;
    let maxScore = 0;
    
    // Technical readiness
    const techInputs = document.querySelectorAll('#technical-assessment input[type="range"], #technical-assessment select');
    techInputs.forEach(input => {
        totalScore += parseInt(input.value || 0);
        maxScore += 5;
    });
    
    // Update readiness display
    const readinessPercent = maxScore > 0 ? (totalScore / maxScore * 100).toFixed(1) : 0;
    const readinessElement = document.getElementById('readiness-score');
    if (readinessElement) {
        readinessElement.textContent = `${readinessPercent}%`;
        readinessElement.className = getScoreClass(readinessPercent);
    }
}

function calculateCloudCosts() {
    const computeHours = parseFloat(document.getElementById('compute-hours')?.value || 0);
    const storageGB = parseFloat(document.getElementById('storage-gb')?.value || 0);
    const transferGB = parseFloat(document.getElementById('transfer-gb')?.value || 0);
    
    // Simplified cost calculation (example rates)
    const costs = {
        aws: {
            compute: computeHours * 0.0464,
            storage: storageGB * 0.023,
            transfer: transferGB * 0.09
        },
        azure: {
            compute: computeHours * 0.048,
            storage: storageGB * 0.0184,
            transfer: transferGB * 0.087
        },
        gcp: {
            compute: computeHours * 0.0475,
            storage: storageGB * 0.020,
            transfer: transferGB * 0.085
        }
    };
    
    // Update cost display
    const provider = document.querySelector('.cloud-card.selected')?.dataset.provider || 'aws';
    const providerCosts = costs[provider];
    const totalCost = Object.values(providerCosts).reduce((a, b) => a + b, 0);
    
    const costElement = document.getElementById('monthly-cost');
    if (costElement) {
        costElement.textContent = `$${totalCost.toFixed(2)}`;
    }
}

function calculateROI() {
    const rows = document.querySelectorAll('#usecase-tbody tr');
    
    rows.forEach(row => {
        const investment = parseFloat(row.cells[2].querySelector('input').value || 0);
        const savings = parseFloat(row.cells[3].querySelector('input').value || 0);
        const months = parseFloat(row.cells[4].querySelector('input').value || 12);
        
        const totalSavings = savings * months;
        const roi = investment > 0 ? ((totalSavings - investment) / investment * 100).toFixed(1) : 0;
        
        row.cells[5].textContent = `${roi}%`;
    });
}

function updateRiskMatrix() {
    const rows = document.querySelectorAll('#risk-tbody tr');
    const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    
    rows.forEach(row => {
        const score = parseInt(row.cells[4].textContent);
        if (score <= 5) riskCounts.low++;
        else if (score <= 10) riskCounts.medium++;
        else if (score <= 15) riskCounts.high++;
        else riskCounts.critical++;
    });
    
    // Update risk matrix display
    const matrixElement = document.getElementById('risk-matrix');
    if (matrixElement) {
        matrixElement.innerHTML = `
            <div class="risk-cell risk-low">Low: ${riskCounts.low}</div>
            <div class="risk-cell risk-medium">Medium: ${riskCounts.medium}</div>
            <div class="risk-cell risk-high">High: ${riskCounts.high}</div>
            <div class="risk-cell risk-critical">Critical: ${riskCounts.critical}</div>
        `;
    }
}

function getScoreClass(score) {
    if (score >= 80) return 'score-value success';
    if (score >= 60) return 'score-value warning';
    return 'score-value danger';
}

// Export Functions
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
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.inventory), "Inventory");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.assessment), "Assessment");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.risks), "Risks");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.costs), "Costs");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.businessCase), "Business Case");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.timeline), "Timeline");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.compliance), "Compliance");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.vendors), "Vendors");
        
        // Save file
        XLSX.writeFile(wb, "cloud_migration_assessment.xlsx");
        
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
        inventory: [],
        assessment: [],
        risks: [],
        costs: [],
        businessCase: [],
        timeline: [],
        compliance: [],
        vendors: []
    };
    
    // Collect inventory data
    document.querySelectorAll('#inventory-tbody tr').forEach(row => {
        data.inventory.push({
            application: row.cells[0].querySelector('input').value,
            type: row.cells[1].querySelector('select').value,
            technology: row.cells[2].querySelector('input').value,
            complexity: row.cells[3].querySelector('input').value,
            strategy: row.cells[4].querySelector('select').value,
            dependencies: row.cells[5].querySelector('input').value
        });
    });
    
    // Collect other data similarly...
    
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
        localStorage.setItem('cloudMigrationData', JSON.stringify(data));
        
        // Show success notification
        if (window.notify) {
            window.notify.show('✅ Progress saved successfully!', 'success');
        }
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
            updateCalculations();
        }, 200);
    } catch (error) {
        console.error('Error restoring data:', error);
    }
}

function loadSavedData() {
    const savedData = localStorage.getItem('cloudMigrationData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('Loading saved data...', data);
            
            // Use the restoreData function
            window.restoreData(data);
            
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

function populateForms(data) {
    // Implementation to populate forms with saved data
    // This would iterate through the data and fill in the appropriate fields
}

function resetCalculator() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('cloudMigrationData');
        location.reload();
    }
}

// Generate Report
function generateReport() {
    const reportWindow = window.open('', '_blank');
    const reportContent = generateReportHTML();
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    
    // Trigger print dialog
    setTimeout(() => {
        reportWindow.print();
    }, 500);
}

function generateReportHTML() {
    const data = collectAllData();
    const date = new Date().toLocaleDateString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cloud Migration Assessment Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #059669; }
                h2 { color: #047857; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f0fdf4; }
                .header { text-align: center; margin-bottom: 40px; }
                .footer { margin-top: 40px; text-align: center; color: #666; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Cloud Migration Assessment Report</h1>
                <p>Generated on ${date}</p>
            </div>
            
            <h2>Executive Summary</h2>
            <p>This report provides a comprehensive assessment of the cloud migration readiness and planning.</p>
            
            <h2>Application Inventory</h2>
            <table>
                <thead>
                    <tr>
                        <th>Application</th>
                        <th>Type</th>
                        <th>Technology</th>
                        <th>Migration Strategy</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.inventory.map(app => `
                        <tr>
                            <td>${app.application}</td>
                            <td>${app.type}</td>
                            <td>${app.technology}</td>
                            <td>${app.strategy}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h2>Risk Assessment</h2>
            <table>
                <thead>
                    <tr>
                        <th>Risk</th>
                        <th>Category</th>
                        <th>Score</th>
                        <th>Mitigation</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.risks.map(risk => `
                        <tr>
                            <td>${risk.description}</td>
                            <td>${risk.category}</td>
                            <td>${risk.score}</td>
                            <td>${risk.mitigation}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Cloud Migration Assessment Tool - AI Architecture Audit</p>
            </div>
        </body>
        </html>
    `;
}

// Timeline visualization
function createTimeline() {
    const canvas = document.getElementById('timeline-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // Implementation for timeline visualization
    // This would create a Gantt chart-like visualization
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Helper function to format percentage
function formatPercent(value) {
    return `${parseFloat(value).toFixed(1)}%`;
}

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-popup';
    tooltip.textContent = e.target.dataset.tooltip;
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip-popup');
    if (tooltip) {
        tooltip.remove();
    }
}

// Auto-save functionality
let autoSaveTimer;
function enableAutoSave() {
    document.addEventListener('input', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            if (window.autoSave) {
                window.autoSave.saveData();
            } else {
                saveProgress();
            }
            console.log('Auto-saved at', new Date().toLocaleTimeString());
        }, 30000); // Auto-save every 30 seconds of inactivity
    });
}

// Enable auto-save on load
enableAutoSave();

// URL-based Sharing Functions
function generateShareableLink(data) {
    const compressed = compressData(data);
    const encoded = btoa(compressed);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?data=${encoded}`;
}

function compressData(data) {
    const compressed = {
        i: [], // inventory
        r: [], // risks  
        p: document.querySelector('.cloud-card.selected')?.dataset.provider || 'aws',
        ch: document.getElementById('compute-hours')?.value || '',
        sg: document.getElementById('storage-gb')?.value || '',
        t: new Date().toISOString().split('T')[0]
    };
    
    if (data.inventory) {
        data.inventory.slice(0, 10).forEach(item => {
            compressed.i.push({
                a: item.application?.substring(0, 20),
                s: item.strategy,
                c: item.complexity
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
            
            if (data.p) {
                const card = document.querySelector(`.cloud-card[data-provider="${data.p}"]`);
                if (card) {
                    document.querySelectorAll('.cloud-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                }
            }
            
            if (data.ch && document.getElementById('compute-hours')) {
                document.getElementById('compute-hours').value = data.ch;
            }
            if (data.sg && document.getElementById('storage-gb')) {
                document.getElementById('storage-gb').value = data.sg;
            }
            
            showMessage('✓ Assessment loaded from shared link!', 'success');
            return true;
        } catch (error) {
            console.error('Error loading from URL:', error);
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
            <h2 style="color: #059669; margin-bottom: 1rem;">✅ Progress Saved!</h2>
            <p style="margin-bottom: 1rem;">Your cloud migration assessment has been saved. Share this link:</p>
            
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <input type="text" id="share-link" value="${link}" readonly 
                       style="flex: 1; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem;">
                <button onclick="copyLink()" 
                        style="padding: 0.75rem 1.5rem; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    📋 Copy
                </button>
            </div>
            
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button onclick="shareViaEmail('${encodeURIComponent(link)}')" 
                        style="padding: 0.5rem 1rem; background: white; color: #059669; border: 2px solid #059669; border-radius: 6px; cursor: pointer;">
                    ✉️ Email
                </button>
                <button onclick="closeModal()" 
                        style="padding: 0.5rem 1rem; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Done
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('share-link').select();
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
            button.style.background = '#059669';
        }, 2000);
    } catch (err) {
        navigator.clipboard.writeText(linkInput.value);
    }
}

function shareViaEmail(link) {
    const subject = 'Cloud Migration Assessment - Saved Progress';
    const body = `Here's my Cloud Migration Assessment progress:\n\n${decodeURIComponent(link)}\n\nClick the link to view or continue the assessment.`;
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
    `;
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

// Export functions to global scope for HTML onclick handlers
window.addInventoryRow = addInventoryRow;
window.addRiskRow = addRiskRow;
window.addUseCaseRow = addUseCaseRow;
window.addComplianceRow = addComplianceRow;
window.addVendorRow = addVendorRow;
window.removeRow = removeRow;
window.updateRiskScore = updateRiskScore;
window.exportToExcel = exportToExcel;
window.saveProgress = saveProgress;
window.shareResults = shareResults;
window.resetCalculator = resetCalculator;
window.generateReport = generateReport;
window.calculateROI = calculateROI;
window.updateTargetService = updateTargetService;
window.addServiceMapping = addServiceMapping;
window.removeServiceMapping = removeServiceMapping;
window.copyLink = copyLink;
window.shareViaEmail = shareViaEmail;
window.closeModal = closeModal;