// Cost Optimization Calculator JavaScript

// Global state management
const CostOptimization = {
    data: {
        maturity: [],
        cloudCosts: [],
        resources: [],
        waste: [],
        budgets: [],
        savings: [],
        tagging: [],
        vendors: [],
        roadmap: []
    },
    
    // Initialize the application
    init() {
        this.setupTabs();
        this.loadFromStorage();
        this.initializeDefaults();
        this.bindEvents();
        this.updateCalculations();
    },
    
    // Setup tab navigation
    setupTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                e.currentTarget.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // Update URL without page reload
                history.pushState(null, null, `#${targetTab}`);
            });
        });
        
        // Handle URL hash on load
        const hash = window.location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            document.querySelector(`[data-tab="${hash}"]`).click();
        }
    },
    
    // Initialize default data
    initializeDefaults() {
        this.initializeMaturityAssessment();
        this.initializeCloudCosts();
        this.initializeResources();
        this.initializeWaste();
        this.initializeBudgets();
        this.initializeSavings();
        this.initializeTagging();
        this.initializeVendors();
        this.initializeRoadmap();
    },
    
    // Maturity Assessment initialization
    initializeMaturityAssessment() {
        const container = document.getElementById('maturity-assessment-container');
        const dimensions = [
            {
                name: 'FinOps Governance',
                weight: 20,
                questions: [
                    { text: 'Cost accountability framework exists', weight: 25 },
                    { text: 'Regular cost reviews conducted', weight: 25 },
                    { text: 'Cross-functional FinOps team established', weight: 25 },
                    { text: 'Executive sponsorship and support', weight: 25 }
                ]
            },
            {
                name: 'Cost Visibility & Reporting',
                weight: 20,
                questions: [
                    { text: 'Real-time cost dashboards available', weight: 30 },
                    { text: 'Cost allocation by business unit/project', weight: 30 },
                    { text: 'Trend analysis and forecasting', weight: 20 },
                    { text: 'Automated cost anomaly detection', weight: 20 }
                ]
            },
            {
                name: 'Cloud Resource Management',
                weight: 20,
                questions: [
                    { text: 'Right-sizing recommendations implemented', weight: 25 },
                    { text: 'Reserved instance/savings plan strategy', weight: 25 },
                    { text: 'Automated resource scheduling', weight: 25 },
                    { text: 'Lifecycle management policies', weight: 25 }
                ]
            },
            {
                name: 'Financial Operations',
                weight: 15,
                questions: [
                    { text: 'Budget planning and approval process', weight: 30 },
                    { text: 'Chargeback/showback implementation', weight: 30 },
                    { text: 'Cost center allocation accuracy', weight: 20 },
                    { text: 'Invoice reconciliation process', weight: 20 }
                ]
            },
            {
                name: 'Automation & Tools',
                weight: 15,
                questions: [
                    { text: 'Cost management tools deployed', weight: 25 },
                    { text: 'Automated policy enforcement', weight: 25 },
                    { text: 'Integration with ITSM/CMDB', weight: 25 },
                    { text: 'API-driven cost operations', weight: 25 }
                ]
            },
            {
                name: 'Culture & Training',
                weight: 10,
                questions: [
                    { text: 'Cost awareness training programs', weight: 30 },
                    { text: 'Developer cost consciousness', weight: 30 },
                    { text: 'Regular FinOps community events', weight: 20 },
                    { text: 'Cost optimization incentives', weight: 20 }
                ]
            }
        ];
        
        let html = '';
        dimensions.forEach((dim, dimIndex) => {
            html += `
                <div class="card">
                    <div class="card-header">
                        <h3>${dim.name} (${dim.weight}% weight)</h3>
                    </div>
                    <div class="maturity-questions">
            `;
            
            dim.questions.forEach((question, qIndex) => {
                html += `
                    <div class="form-group">
                        <label>${question.text} (${question.weight}%)</label>
                        <select onchange="updateMaturityScore()" data-dimension="${dimIndex}" data-question="${qIndex}">
                            <option value="0">Not Implemented (0%)</option>
                            <option value="25">Basic Implementation (25%)</option>
                            <option value="50">Partially Implemented (50%)</option>
                            <option value="75">Well Implemented (75%)</option>
                            <option value="100">Fully Optimized (100%)</option>
                        </select>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <div class="dimension-score">
                        <strong>Dimension Score: <span id="dim-score-${dimIndex}" class="money">0%</span></strong>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="card savings-highlight">
                <h3>Overall FinOps Maturity Score</h3>
                <div class="metric-value money" id="overall-maturity">0%</div>
                <div class="progress">
                    <div class="progress-bar" id="maturity-progress" style="width: 0%"></div>
                </div>
                <div class="maturity-level" id="maturity-level">Beginner Level</div>
            </div>
        `;
        
        container.innerHTML = html;
        this.data.maturity = dimensions;
    },
    
    // Cloud Cost Analysis initialization
    initializeCloudCosts() {
        if (!this.data.cloudCosts.length) {
            this.data.cloudCosts = [
                { provider: 'AWS', service: 'EC2', monthlySpend: 15000, trend: 'increasing', optimization: 30 },
                { provider: 'AWS', service: 'RDS', monthlySpend: 8000, trend: 'stable', optimization: 15 },
                { provider: 'Azure', service: 'Virtual Machines', monthlySpend: 12000, trend: 'decreasing', optimization: 25 },
                { provider: 'GCP', service: 'Compute Engine', monthlySpend: 6000, trend: 'increasing', optimization: 20 }
            ];
        }
        this.renderCloudCosts();
    },
    
    // Resource Optimization initialization
    initializeResources() {
        if (!this.data.resources.length) {
            this.data.resources = [
                { type: 'EC2 Instances', total: 450, rightsized: 320, oversized: 100, undersized: 30, savingsPotential: 25000 },
                { type: 'Reserved Instances', total: 200, utilized: 180, unused: 20, savingsPotential: 15000 },
                { type: 'Storage Volumes', total: 1200, optimized: 800, redundant: 300, obsolete: 100, savingsPotential: 8000 }
            ];
        }
        this.renderResources();
    },
    
    // Waste Identification initialization
    initializeWaste() {
        if (!this.data.waste.length) {
            this.data.waste = [
                { category: 'Idle Resources', instances: 45, monthlyWaste: 18000, priority: 'high' },
                { category: 'Orphaned Storage', volumes: 120, monthlyWaste: 3600, priority: 'medium' },
                { category: 'Unattached IPs', count: 25, monthlyWaste: 125, priority: 'low' },
                { category: 'Over-provisioned DBs', instances: 15, monthlyWaste: 12000, priority: 'high' }
            ];
        }
        this.renderWaste();
    },
    
    // Budget Planning initialization
    initializeBudgets() {
        if (!this.data.budgets.length) {
            this.data.budgets = [
                { department: 'Engineering', budget: 50000, spent: 45000, forecast: 48000, variance: -2000 },
                { department: 'Data Science', budget: 30000, spent: 32000, forecast: 35000, variance: 5000 },
                { department: 'DevOps', budget: 25000, spent: 22000, forecast: 24000, variance: -1000 }
            ];
        }
        this.renderBudgets();
    },
    
    // Savings Opportunities initialization
    initializeSavings() {
        if (!this.data.savings.length) {
            this.data.savings = [
                { opportunity: 'Right-size EC2 instances', category: 'Quick Win', monthlySaving: 25000, effort: 'Low', timeframe: '1 month', roi: 300 },
                { opportunity: 'Reserved Instance purchases', category: 'Medium Term', monthlySaving: 18000, effort: 'Medium', timeframe: '3 months', roi: 200 },
                { opportunity: 'Archive old data', category: 'Quick Win', monthlySaving: 5000, effort: 'Low', timeframe: '2 weeks', roi: 500 }
            ];
        }
        this.renderSavings();
    },
    
    // Tagging & Governance initialization
    initializeTagging() {
        if (!this.data.tagging.length) {
            this.data.tagging = [
                { resource: 'EC2 Instances', total: 450, tagged: 380, compliance: 84, costAllocation: 78 },
                { resource: 'S3 Buckets', total: 125, tagged: 95, compliance: 76, costAllocation: 82 },
                { resource: 'RDS Instances', total: 45, tagged: 42, compliance: 93, costAllocation: 91 }
            ];
        }
        this.renderTagging();
    },
    
    // Vendor Management initialization
    initializeVendors() {
        if (!this.data.vendors.length) {
            this.data.vendors = [
                { vendor: 'AWS', spend: 85000, commitment: 70000, discount: 12, renewalDate: '2025-06-01', savingsPotential: 8500 },
                { vendor: 'Azure', spend: 45000, commitment: 35000, discount: 8, renewalDate: '2025-09-15', savingsPotential: 4500 },
                { vendor: 'GCP', spend: 25000, commitment: 20000, discount: 10, renewalDate: '2025-12-01', savingsPotential: 2500 }
            ];
        }
        this.renderVendors();
    },
    
    // Optimization Roadmap initialization
    initializeRoadmap() {
        if (!this.data.roadmap.length) {
            this.data.roadmap = [
                { initiative: 'Implement FinOps governance', phase: 'Phase 1', startDate: '2025-01-01', endDate: '2025-03-31', savings: 15000, status: 'In Progress' },
                { initiative: 'Right-size all resources', phase: 'Phase 2', startDate: '2025-02-01', endDate: '2025-05-31', savings: 35000, status: 'Planned' },
                { initiative: 'Reserved capacity optimization', phase: 'Phase 3', startDate: '2025-04-01', endDate: '2025-08-31', savings: 45000, status: 'Planned' }
            ];
        }
        this.renderRoadmap();
    },
    
    // Render methods for each section
    renderCloudCosts() {
        const tbody = document.getElementById('cloud-costs-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.cloudCosts.forEach((cost, index) => {
            const trendIcon = cost.trend === 'increasing' ? '📈' : cost.trend === 'decreasing' ? '📉' : '➡️';
            html += `
                <tr>
                    <td><input type="text" value="${cost.provider}" onchange="updateCloudCost(${index}, 'provider', this.value)"></td>
                    <td><input type="text" value="${cost.service}" onchange="updateCloudCost(${index}, 'service', this.value)"></td>
                    <td><input type="number" value="${cost.monthlySpend}" onchange="updateCloudCost(${index}, 'monthlySpend', this.value)"></td>
                    <td>
                        <select onchange="updateCloudCost(${index}, 'trend', this.value)">
                            <option value="increasing" ${cost.trend === 'increasing' ? 'selected' : ''}>📈 Increasing</option>
                            <option value="stable" ${cost.trend === 'stable' ? 'selected' : ''}>➡️ Stable</option>
                            <option value="decreasing" ${cost.trend === 'decreasing' ? 'selected' : ''}>📉 Decreasing</option>
                        </select>
                    </td>
                    <td><input type="number" value="${cost.optimization}" min="0" max="100" onchange="updateCloudCost(${index}, 'optimization', this.value)">%</td>
                    <td class="savings">$${(cost.monthlySpend * cost.optimization / 100).toLocaleString()}</td>
                    <td><button class="btn btn-danger" onclick="removeCloudCost(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateCloudCostSummary();
    },
    
    renderResources() {
        const tbody = document.getElementById('resources-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.resources.forEach((resource, index) => {
            html += `
                <tr>
                    <td><input type="text" value="${resource.type}" onchange="updateResource(${index}, 'type', this.value)"></td>
                    <td><input type="number" value="${resource.total}" onchange="updateResource(${index}, 'total', this.value)"></td>
                    <td><input type="number" value="${resource.rightsized || resource.optimized || resource.utilized || 0}" onchange="updateResourceOptimized(${index}, this.value)"></td>
                    <td class="cost">$${resource.savingsPotential.toLocaleString()}</td>
                    <td><button class="btn btn-danger" onclick="removeResource(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateResourceSummary();
    },
    
    renderWaste() {
        const tbody = document.getElementById('waste-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.waste.forEach((waste, index) => {
            html += `
                <tr>
                    <td><input type="text" value="${waste.category}" onchange="updateWaste(${index}, 'category', this.value)"></td>
                    <td><input type="number" value="${waste.instances || waste.volumes || waste.count}" onchange="updateWasteCount(${index}, this.value)"></td>
                    <td class="cost">$${waste.monthlyWaste.toLocaleString()}</td>
                    <td>
                        <select onchange="updateWaste(${index}, 'priority', this.value)">
                            <option value="high" ${waste.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="medium" ${waste.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="low" ${waste.priority === 'low' ? 'selected' : ''}>Low</option>
                        </select>
                    </td>
                    <td><button class="btn btn-danger" onclick="removeWaste(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateWasteSummary();
    },
    
    renderBudgets() {
        const tbody = document.getElementById('budgets-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.budgets.forEach((budget, index) => {
            const utilizationPercent = (budget.spent / budget.budget * 100).toFixed(1);
            html += `
                <tr>
                    <td><input type="text" value="${budget.department}" onchange="updateBudget(${index}, 'department', this.value)"></td>
                    <td><input type="number" value="${budget.budget}" onchange="updateBudget(${index}, 'budget', this.value)"></td>
                    <td><input type="number" value="${budget.spent}" onchange="updateBudget(${index}, 'spent', this.value)"></td>
                    <td><input type="number" value="${budget.forecast}" onchange="updateBudget(${index}, 'forecast', this.value)"></td>
                    <td class="${budget.variance >= 0 ? 'cost' : 'savings'}">$${budget.variance.toLocaleString()}</td>
                    <td>${utilizationPercent}%</td>
                    <td><button class="btn btn-danger" onclick="removeBudget(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateBudgetSummary();
    },
    
    renderSavings() {
        const tbody = document.getElementById('savings-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.savings.forEach((saving, index) => {
            html += `
                <tr>
                    <td><input type="text" value="${saving.opportunity}" onchange="updateSaving(${index}, 'opportunity', this.value)"></td>
                    <td>
                        <select onchange="updateSaving(${index}, 'category', this.value)">
                            <option value="Quick Win" ${saving.category === 'Quick Win' ? 'selected' : ''}>Quick Win</option>
                            <option value="Medium Term" ${saving.category === 'Medium Term' ? 'selected' : ''}>Medium Term</option>
                            <option value="Long Term" ${saving.category === 'Long Term' ? 'selected' : ''}>Long Term</option>
                        </select>
                    </td>
                    <td class="savings">$${saving.monthlySaving.toLocaleString()}</td>
                    <td>
                        <select onchange="updateSaving(${index}, 'effort', this.value)">
                            <option value="Low" ${saving.effort === 'Low' ? 'selected' : ''}>Low</option>
                            <option value="Medium" ${saving.effort === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="High" ${saving.effort === 'High' ? 'selected' : ''}>High</option>
                        </select>
                    </td>
                    <td><input type="text" value="${saving.timeframe}" onchange="updateSaving(${index}, 'timeframe', this.value)"></td>
                    <td class="roi-positive">${saving.roi}%</td>
                    <td><button class="btn btn-danger" onclick="removeSaving(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateSavingsSummary();
    },
    
    renderTagging() {
        const tbody = document.getElementById('tagging-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.tagging.forEach((tag, index) => {
            html += `
                <tr>
                    <td><input type="text" value="${tag.resource}" onchange="updateTagging(${index}, 'resource', this.value)"></td>
                    <td><input type="number" value="${tag.total}" onchange="updateTagging(${index}, 'total', this.value)"></td>
                    <td><input type="number" value="${tag.tagged}" onchange="updateTagging(${index}, 'tagged', this.value)"></td>
                    <td>${(tag.tagged / tag.total * 100).toFixed(1)}%</td>
                    <td>${tag.compliance}%</td>
                    <td>${tag.costAllocation}%</td>
                    <td><button class="btn btn-danger" onclick="removeTagging(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateTaggingSummary();
    },
    
    renderVendors() {
        const tbody = document.getElementById('vendors-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.vendors.forEach((vendor, index) => {
            html += `
                <tr>
                    <td><input type="text" value="${vendor.vendor}" onchange="updateVendor(${index}, 'vendor', this.value)"></td>
                    <td class="cost">$${vendor.spend.toLocaleString()}</td>
                    <td><input type="number" value="${vendor.commitment}" onchange="updateVendor(${index}, 'commitment', this.value)"></td>
                    <td>${vendor.discount}%</td>
                    <td><input type="date" value="${vendor.renewalDate}" onchange="updateVendor(${index}, 'renewalDate', this.value)"></td>
                    <td class="savings">$${vendor.savingsPotential.toLocaleString()}</td>
                    <td><button class="btn btn-danger" onclick="removeVendor(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateVendorSummary();
    },
    
    renderRoadmap() {
        const tbody = document.getElementById('roadmap-tbody');
        if (!tbody) return;
        
        let html = '';
        this.data.roadmap.forEach((item, index) => {
            html += `
                <tr>
                    <td><input type="text" value="${item.initiative}" onchange="updateRoadmap(${index}, 'initiative', this.value)"></td>
                    <td><input type="text" value="${item.phase}" onchange="updateRoadmap(${index}, 'phase', this.value)"></td>
                    <td><input type="date" value="${item.startDate}" onchange="updateRoadmap(${index}, 'startDate', this.value)"></td>
                    <td><input type="date" value="${item.endDate}" onchange="updateRoadmap(${index}, 'endDate', this.value)"></td>
                    <td class="savings">$${item.savings.toLocaleString()}</td>
                    <td>
                        <select onchange="updateRoadmap(${index}, 'status', this.value)">
                            <option value="Planned" ${item.status === 'Planned' ? 'selected' : ''}>Planned</option>
                            <option value="In Progress" ${item.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="On Hold" ${item.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                        </select>
                    </td>
                    <td><button class="btn btn-danger" onclick="removeRoadmap(${index})">Remove</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.updateRoadmapSummary();
    },
    
    // Update calculations for summaries
    updateCloudCostSummary() {
        const totalSpend = this.data.cloudCosts.reduce((sum, cost) => sum + cost.monthlySpend, 0);
        const totalSavings = this.data.cloudCosts.reduce((sum, cost) => sum + (cost.monthlySpend * cost.optimization / 100), 0);
        
        document.getElementById('cloud-total-spend').textContent = `$${totalSpend.toLocaleString()}`;
        document.getElementById('cloud-potential-savings').textContent = `$${totalSavings.toLocaleString()}`;
    },
    
    updateResourceSummary() {
        const totalResources = this.data.resources.reduce((sum, resource) => sum + resource.total, 0);
        const totalSavings = this.data.resources.reduce((sum, resource) => sum + resource.savingsPotential, 0);
        
        document.getElementById('resource-total-count').textContent = totalResources.toLocaleString();
        document.getElementById('resource-potential-savings').textContent = `$${totalSavings.toLocaleString()}`;
    },
    
    updateWasteSummary() {
        const totalWaste = this.data.waste.reduce((sum, waste) => sum + waste.monthlyWaste, 0);
        const highPriorityItems = this.data.waste.filter(w => w.priority === 'high').length;
        
        document.getElementById('waste-monthly-total').textContent = `$${totalWaste.toLocaleString()}`;
        document.getElementById('waste-high-priority').textContent = highPriorityItems;
    },
    
    updateBudgetSummary() {
        const totalBudget = this.data.budgets.reduce((sum, budget) => sum + budget.budget, 0);
        const totalSpent = this.data.budgets.reduce((sum, budget) => sum + budget.spent, 0);
        const totalVariance = this.data.budgets.reduce((sum, budget) => sum + budget.variance, 0);
        
        document.getElementById('budget-total-budget').textContent = `$${totalBudget.toLocaleString()}`;
        document.getElementById('budget-total-spent').textContent = `$${totalSpent.toLocaleString()}`;
        document.getElementById('budget-total-variance').textContent = `$${totalVariance.toLocaleString()}`;
    },
    
    updateSavingsSummary() {
        const totalMonthlySavings = this.data.savings.reduce((sum, saving) => sum + saving.monthlySaving, 0);
        const quickWins = this.data.savings.filter(s => s.category === 'Quick Win').length;
        
        document.getElementById('savings-monthly-total').textContent = `$${totalMonthlySavings.toLocaleString()}`;
        document.getElementById('savings-annual-total').textContent = `$${(totalMonthlySavings * 12).toLocaleString()}`;
        document.getElementById('savings-quick-wins').textContent = quickWins;
    },
    
    updateTaggingSummary() {
        const totalResources = this.data.tagging.reduce((sum, tag) => sum + tag.total, 0);
        const totalTagged = this.data.tagging.reduce((sum, tag) => sum + tag.tagged, 0);
        const avgCompliance = this.data.tagging.reduce((sum, tag) => sum + tag.compliance, 0) / this.data.tagging.length;
        
        document.getElementById('tagging-compliance-rate').textContent = `${(totalTagged / totalResources * 100).toFixed(1)}%`;
        document.getElementById('tagging-avg-compliance').textContent = `${avgCompliance.toFixed(1)}%`;
    },
    
    updateVendorSummary() {
        const totalSpend = this.data.vendors.reduce((sum, vendor) => sum + vendor.spend, 0);
        const totalSavings = this.data.vendors.reduce((sum, vendor) => sum + vendor.savingsPotential, 0);
        
        document.getElementById('vendor-total-spend').textContent = `$${totalSpend.toLocaleString()}`;
        document.getElementById('vendor-potential-savings').textContent = `$${totalSavings.toLocaleString()}`;
    },
    
    updateRoadmapSummary() {
        const totalSavings = this.data.roadmap.reduce((sum, item) => sum + item.savings, 0);
        const completedItems = this.data.roadmap.filter(item => item.status === 'Completed').length;
        const totalItems = this.data.roadmap.length;
        
        document.getElementById('roadmap-total-savings').textContent = `$${totalSavings.toLocaleString()}`;
        document.getElementById('roadmap-completion-rate').textContent = `${(completedItems / totalItems * 100).toFixed(1)}%`;
    },
    
    // Update all calculations
    updateCalculations() {
        this.updateCloudCostSummary();
        this.updateResourceSummary();
        this.updateWasteSummary();
        this.updateBudgetSummary();
        this.updateSavingsSummary();
        this.updateTaggingSummary();
        this.updateVendorSummary();
        this.updateRoadmapSummary();
    },
    
    // Bind events
    bindEvents() {
        // Auto-save on data change
        document.addEventListener('input', () => {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.saveToStorage();
            }, 1000);
        });
        
        // Export functionality
        document.getElementById('export-excel')?.addEventListener('click', () => this.exportToExcel());
        document.getElementById('save-progress')?.addEventListener('click', () => this.saveProgress());
        document.getElementById('share-report')?.addEventListener('click', () => this.shareReport());
        document.getElementById('print-report')?.addEventListener('click', () => this.printReport());
    },
    
    // Storage management
    saveToStorage() {
        localStorage.setItem('costOptimizationData', JSON.stringify(this.data));
    },
    
    loadFromStorage() {
        const saved = localStorage.getItem('costOptimizationData');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    },
    
    // Export functionality
    async exportToExcel() {
        try {
            // Show loading overlay
            if (window.LoadingOverlay) {
                LoadingOverlay.show('📊 Generating Excel file...');
            }
            
            const wb = XLSX.utils.book_new();
            
            // Create sheets for each section
            const sheets = {
                'Cloud Costs': this.data.cloudCosts,
                'Resources': this.data.resources,
                'Waste': this.data.waste,
                'Budgets': this.data.budgets,
                'Savings': this.data.savings,
                'Tagging': this.data.tagging,
                'Vendors': this.data.vendors,
                'Roadmap': this.data.roadmap
            };
            
            Object.keys(sheets).forEach(sheetName => {
                const ws = XLSX.utils.json_to_sheet(sheets[sheetName]);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            });
            
            XLSX.writeFile(wb, 'cost-optimization-analysis.xlsx');
            
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
    },
    
    saveProgress() {
        this.saveToStorage();
        if (window.notify) {
            window.notify.show('✅ Progress saved successfully!', 'success');
        } else {
            alert('Progress saved successfully!');
        }
    },
    
    shareReport() {
        const url = new URL(window.location);
        url.searchParams.set('data', btoa(JSON.stringify(this.data)));
        
        if (navigator.share) {
            navigator.share({
                title: 'Cost Optimization Assessment',
                url: url.toString()
            });
        } else {
            navigator.clipboard.writeText(url.toString()).then(() => {
                if (window.notify) {
                    window.notify.show('📋 Shareable link copied to clipboard!', 'success');
                } else {
                    alert('Shareable link copied to clipboard!');
                }
            });
        }
    },
    
    printReport() {
        window.print();
    }
};

// Global functions for HTML event handlers
function updateMaturityScore() {
    const dimensions = CostOptimization.data.maturity;
    let overallScore = 0;
    
    dimensions.forEach((dim, dimIndex) => {
        let dimensionScore = 0;
        dim.questions.forEach((question, qIndex) => {
            const select = document.querySelector(`select[data-dimension="${dimIndex}"][data-question="${qIndex}"]`);
            if (select) {
                const score = parseInt(select.value) || 0;
                dimensionScore += (score * question.weight / 100);
            }
        });
        
        // Update dimension score display
        const dimScoreElement = document.getElementById(`dim-score-${dimIndex}`);
        if (dimScoreElement) {
            dimScoreElement.textContent = `${dimensionScore.toFixed(1)}%`;
        }
        
        // Add to overall score with dimension weight
        overallScore += (dimensionScore * dim.weight / 100);
    });
    
    // Update overall maturity score
    document.getElementById('overall-maturity').textContent = `${overallScore.toFixed(1)}%`;
    document.getElementById('maturity-progress').style.width = `${overallScore}%`;
    
    // Update maturity level
    let level = 'Beginner';
    if (overallScore >= 80) level = 'Optimized';
    else if (overallScore >= 60) level = 'Advanced';
    else if (overallScore >= 40) level = 'Intermediate';
    else if (overallScore >= 20) level = 'Basic';
    
    document.getElementById('maturity-level').textContent = `${level} Level`;
}

// Add/Remove functions for each section
function addCloudCost() {
    CostOptimization.data.cloudCosts.push({
        provider: 'AWS',
        service: 'New Service',
        monthlySpend: 1000,
        trend: 'stable',
        optimization: 10
    });
    CostOptimization.renderCloudCosts();
}

function removeCloudCost(index) {
    CostOptimization.data.cloudCosts.splice(index, 1);
    CostOptimization.renderCloudCosts();
}

function updateCloudCost(index, field, value) {
    if (field === 'monthlySpend' || field === 'optimization') {
        value = parseFloat(value) || 0;
    }
    CostOptimization.data.cloudCosts[index][field] = value;
    CostOptimization.updateCloudCostSummary();
}

// Similar functions for other sections...
function addResource() {
    CostOptimization.data.resources.push({
        type: 'New Resource Type',
        total: 10,
        optimized: 8,
        savingsPotential: 1000
    });
    CostOptimization.renderResources();
}

function removeResource(index) {
    CostOptimization.data.resources.splice(index, 1);
    CostOptimization.renderResources();
}

function updateResource(index, field, value) {
    if (field === 'total' || field === 'savingsPotential') {
        value = parseInt(value) || 0;
    }
    CostOptimization.data.resources[index][field] = value;
    CostOptimization.updateResourceSummary();
}

function updateResourceOptimized(index, value) {
    CostOptimization.data.resources[index].optimized = parseInt(value) || 0;
    CostOptimization.updateResourceSummary();
}

// Add similar functions for waste, budgets, savings, tagging, vendors, and roadmap...

// Make functions globally accessible for utility integration
window.collectAllData = function collectAllData() {
    return {
        ...CostOptimization.data,
        formInputs: {},
        timestamp: new Date().toISOString()
    };
}

window.restoreData = function restoreData(data) {
    if (!data) return;
    
    try {
        // Restore the main data
        if (data.maturity) CostOptimization.data.maturity = data.maturity;
        if (data.cloudCosts) CostOptimization.data.cloudCosts = data.cloudCosts;
        if (data.resources) CostOptimization.data.resources = data.resources;
        if (data.waste) CostOptimization.data.waste = data.waste;
        if (data.budgets) CostOptimization.data.budgets = data.budgets;
        if (data.savings) CostOptimization.data.savings = data.savings;
        if (data.tagging) CostOptimization.data.tagging = data.tagging;
        if (data.vendors) CostOptimization.data.vendors = data.vendors;
        if (data.roadmap) CostOptimization.data.roadmap = data.roadmap;
        
        // Trigger recalculations
        setTimeout(() => {
            CostOptimization.updateCalculations();
        }, 200);
    } catch (error) {
        console.error('Error restoring data:', error);
    }
}

// Global functions for external access
function exportToExcel() {
    return CostOptimization.exportToExcel();
}

function saveProgress() {
    // Use the auto-save system's manual save
    if (window.autoSave && window.autoSave.manualSave) {
        window.autoSave.manualSave();
        return;
    }
    // Fallback to original implementation
    return CostOptimization.saveProgress();
}

function resetCalculator() {
    return CostOptimization.resetCalculator();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    CostOptimization.init();
    
    // Initialize auto-save
    function initAutoSave() {
        if (window.AutoSave) {
            window.autoSave = new AutoSave('cost-optimization', 15000);
            console.log("✅ Auto-save initialized for cost-optimization");
            return true;
        }
        return false;
    }
    
    if (!initAutoSave()) {
        setTimeout(() => {
            if (!initAutoSave()) {
                setTimeout(() => {
                    if (!initAutoSave()) {
                        console.warn("⚠️ AutoSave initialization delayed for cost-optimization");
                    }
                }, 1000);
            }
        }, 500);
    }});
// Export functions as global for button onclick handlers
window.saveProgress = saveProgress;
window.resetCalculator = resetCalculator;
window.exportToExcel = exportToExcel;
