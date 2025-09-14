/**
 * Universal Calculator Navigation System
 * Provides standardized 9-tab navigation for all framework calculators
 */

class CalculatorNavigation {
    constructor(frameworkId, customTabs = null) {
        this.frameworkId = frameworkId;
        this.currentTab = 0;
        this.completedTabs = new Set();
        this.tabData = customTabs || this.getDefaultTabs();
        this.init();
    }

    getDefaultTabs() {
        // Standard 9-tab structure for all frameworks
        return [
            { id: 'assessment', icon: '📊', label: 'Maturity Assessment', description: 'Evaluate current state' },
            { id: 'skills', icon: '👥', label: 'Skills Gap Analysis', description: 'Team capability assessment' },
            { id: 'usecases', icon: '🎯', label: 'Use Case Prioritization', description: 'Business value identification' },
            { id: 'data', icon: '💾', label: 'Data Readiness', description: 'Technical prerequisites' },
            { id: 'infrastructure', icon: '🏗️', label: 'Infrastructure', description: 'Platform evaluation' },
            { id: 'roi', icon: '💰', label: 'ROI Calculator', description: 'Financial analysis' },
            { id: 'vendors', icon: '🏢', label: 'Vendor Selection', description: 'Solution comparison' },
            { id: 'risks', icon: '⚠️', label: 'Risk Assessment', description: 'Risk mitigation planning' },
            { id: 'roadmap', icon: '🗓️', label: 'Implementation Roadmap', description: 'Phased delivery plan' }
        ];
    }

    init() {
        // Load saved progress from localStorage
        this.loadProgress();

        // Render navigation
        this.render();

        // Setup event handlers
        this.setupEventHandlers();

        // Initialize first tab
        this.showTab(0);
    }

    render() {
        const navContainer = document.getElementById('calculator-navigation');
        if (!navContainer) {
            console.error('Navigation container not found');
            return;
        }

        // Create navigation HTML
        const navHTML = `
            <div class="calc-nav-wrapper">
                <!-- Progress Bar -->
                <div class="calc-progress-bar">
                    <div class="calc-progress-fill" style="width: ${this.getProgressPercentage()}%"></div>
                    <span class="calc-progress-text">${this.getProgressPercentage()}% Complete</span>
                </div>

                <!-- Desktop Tabs -->
                <div class="calc-nav-tabs desktop-tabs">
                    ${this.tabData.map((tab, index) => `
                        <button class="calc-nav-tab ${index === 0 ? 'active' : ''} ${this.completedTabs.has(tab.id) ? 'completed' : ''}"
                                data-tab="${tab.id}"
                                data-index="${index}">
                            <span class="tab-icon">${tab.icon}</span>
                            <span class="tab-label">${tab.label}</span>
                            ${this.completedTabs.has(tab.id) ? '<span class="tab-check">✓</span>' : ''}
                        </button>
                    `).join('')}
                </div>

                <!-- Mobile Accordion -->
                <div class="calc-nav-accordion mobile-accordion">
                    ${this.tabData.map((tab, index) => `
                        <div class="accordion-item ${index === 0 ? 'active' : ''}">
                            <button class="accordion-header" data-tab="${tab.id}" data-index="${index}">
                                <span class="accordion-icon">${tab.icon}</span>
                                <span class="accordion-label">${tab.label}</span>
                                <span class="accordion-arrow">▼</span>
                            </button>
                            <div class="accordion-content">
                                <p>${tab.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Navigation Controls -->
                <div class="calc-nav-controls">
                    <button class="nav-btn nav-prev" onclick="calcNav.previousTab()">
                        ← Previous
                    </button>
                    <span class="nav-indicator">
                        Step ${this.currentTab + 1} of ${this.tabData.length}
                    </span>
                    <button class="nav-btn nav-next" onclick="calcNav.nextTab()">
                        Next →
                    </button>
                </div>
            </div>
        `;

        navContainer.innerHTML = navHTML;

        // Add CSS if not already present
        if (!document.getElementById('calc-nav-styles')) {
            this.injectStyles();
        }
    }

    injectStyles() {
        const styles = `
            <style id="calc-nav-styles">
                /* Calculator Navigation Styles */
                .calc-nav-wrapper {
                    margin-bottom: 2rem;
                }

                /* Progress Bar */
                .calc-progress-bar {
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .calc-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1, #8b5cf6);
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .calc-progress-text {
                    position: absolute;
                    top: -25px;
                    right: 0;
                    font-size: 0.875rem;
                    color: #64748b;
                    font-weight: 500;
                }

                /* Desktop Tabs */
                .calc-nav-tabs {
                    display: flex;
                    gap: 0.5rem;
                    border-bottom: 2px solid #e2e8f0;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    margin-bottom: 2rem;
                }

                .calc-nav-tabs::-webkit-scrollbar {
                    display: none;
                }

                .calc-nav-tab {
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: #64748b;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    white-space: nowrap;
                    position: relative;
                }

                .calc-nav-tab:hover {
                    color: #1e293b;
                    background: #f8fafc;
                }

                .calc-nav-tab.active {
                    color: #6366f1;
                    border-bottom-color: #6366f1;
                    font-weight: 600;
                }

                .calc-nav-tab.completed {
                    color: #10b981;
                }

                .calc-nav-tab.completed::after {
                    content: '✓';
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    font-size: 0.75rem;
                    color: #10b981;
                }

                .tab-icon {
                    font-size: 1.25rem;
                }

                .tab-check {
                    color: #10b981;
                    margin-left: 0.5rem;
                }

                /* Mobile Accordion */
                .calc-nav-accordion {
                    display: none;
                    margin-bottom: 2rem;
                }

                .accordion-item {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    overflow: hidden;
                }

                .accordion-header {
                    width: 100%;
                    padding: 1rem;
                    background: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .accordion-header:hover {
                    background: #f8fafc;
                }

                .accordion-item.active .accordion-header {
                    background: #6366f1;
                    color: white;
                }

                .accordion-icon {
                    font-size: 1.5rem;
                }

                .accordion-label {
                    flex: 1;
                    text-align: left;
                    font-weight: 500;
                }

                .accordion-arrow {
                    transition: transform 0.3s;
                }

                .accordion-item.active .accordion-arrow {
                    transform: rotate(180deg);
                }

                .accordion-content {
                    padding: 0 1rem;
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s, padding 0.3s;
                }

                .accordion-item.active .accordion-content {
                    padding: 1rem;
                    max-height: 200px;
                }

                /* Navigation Controls */
                .calc-nav-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 0;
                    border-top: 1px solid #e2e8f0;
                }

                .nav-btn {
                    padding: 0.75rem 1.5rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .nav-btn:hover {
                    background: #4f46e5;
                    transform: translateY(-1px);
                }

                .nav-btn:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                    transform: none;
                }

                .nav-indicator {
                    color: #64748b;
                    font-size: 0.875rem;
                }

                /* Tab Content Panels */
                .tab-content {
                    margin-top: 2rem;
                }

                .tab-panel {
                    display: none;
                    animation: fadeIn 0.3s;
                }

                .tab-panel.active {
                    display: block;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .desktop-tabs {
                        display: none;
                    }

                    .mobile-accordion {
                        display: block !important;
                    }

                    .calc-nav-controls {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: white;
                        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                        padding: 1rem;
                        z-index: 100;
                    }

                    .tab-content {
                        padding-bottom: 80px;
                    }
                }

                /* Touch-friendly for mobile */
                @media (pointer: coarse) {
                    .calc-nav-tab,
                    .accordion-header,
                    .nav-btn {
                        min-height: 48px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventHandlers() {
        // Desktop tab clicks
        document.querySelectorAll('.calc-nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.showTab(index);
            });
        });

        // Mobile accordion clicks
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.toggleAccordion(index);
                this.showTab(index);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                if (e.key === 'ArrowLeft') this.previousTab();
                if (e.key === 'ArrowRight') this.nextTab();
            }
        });

        // Auto-save on input changes
        this.setupAutoSave();
    }

    showTab(index) {
        // Update current tab
        this.currentTab = index;

        // Update tab states
        document.querySelectorAll('.calc-nav-tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });

        // Update content panels
        document.querySelectorAll('.tab-panel').forEach((panel, i) => {
            panel.classList.toggle('active', i === index);
        });

        // Update navigation controls
        this.updateNavigationControls();

        // Save progress
        this.saveProgress();

        // Emit event
        this.emitTabChange(index);
    }

    toggleAccordion(index) {
        const accordions = document.querySelectorAll('.accordion-item');
        accordions.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    nextTab() {
        if (this.currentTab < this.tabData.length - 1) {
            // Mark current tab as completed
            this.markTabCompleted(this.tabData[this.currentTab].id);
            this.showTab(this.currentTab + 1);
        }
    }

    previousTab() {
        if (this.currentTab > 0) {
            this.showTab(this.currentTab - 1);
        }
    }

    markTabCompleted(tabId) {
        this.completedTabs.add(tabId);
        this.updateProgressBar();
        this.saveProgress();

        // Update UI
        const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
        if (tabElement) {
            tabElement.classList.add('completed');
        }
    }

    updateProgressBar() {
        const percentage = this.getProgressPercentage();
        const progressFill = document.querySelector('.calc-progress-fill');
        const progressText = document.querySelector('.calc-progress-text');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${percentage}% Complete`;
        }
    }

    getProgressPercentage() {
        return Math.round((this.completedTabs.size / this.tabData.length) * 100);
    }

    updateNavigationControls() {
        const prevBtn = document.querySelector('.nav-prev');
        const nextBtn = document.querySelector('.nav-next');
        const indicator = document.querySelector('.nav-indicator');

        if (prevBtn) {
            prevBtn.disabled = this.currentTab === 0;
        }
        if (nextBtn) {
            nextBtn.textContent = this.currentTab === this.tabData.length - 1 ? 'Complete' : 'Next →';
        }
        if (indicator) {
            indicator.textContent = `Step ${this.currentTab + 1} of ${this.tabData.length}`;
        }
    }

    setupAutoSave() {
        // Auto-save form data every 30 seconds
        setInterval(() => {
            this.saveFormData();
        }, 30000);

        // Save on input change
        document.addEventListener('input', (e) => {
            if (e.target.closest('.tab-panel')) {
                this.saveFormData();
            }
        });
    }

    saveFormData() {
        const formData = {};
        document.querySelectorAll('.tab-panel input, .tab-panel select, .tab-panel textarea').forEach(field => {
            if (field.name) {
                formData[field.name] = field.value;
            }
        });

        localStorage.setItem(`${this.frameworkId}_formData`, JSON.stringify(formData));
    }

    loadFormData() {
        const savedData = localStorage.getItem(`${this.frameworkId}_formData`);
        if (savedData) {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(name => {
                const field = document.querySelector(`[name="${name}"]`);
                if (field) {
                    field.value = formData[name];
                }
            });
        }
    }

    saveProgress() {
        const progress = {
            currentTab: this.currentTab,
            completedTabs: Array.from(this.completedTabs),
            timestamp: Date.now()
        };
        localStorage.setItem(`${this.frameworkId}_progress`, JSON.stringify(progress));
    }

    loadProgress() {
        const savedProgress = localStorage.getItem(`${this.frameworkId}_progress`);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.currentTab = progress.currentTab || 0;
            this.completedTabs = new Set(progress.completedTabs || []);
        }
    }

    emitTabChange(index) {
        const event = new CustomEvent('tabChange', {
            detail: {
                index: index,
                tabId: this.tabData[index].id,
                frameworkId: this.frameworkId
            }
        });
        document.dispatchEvent(event);
    }

    // Public API
    reset() {
        this.currentTab = 0;
        this.completedTabs.clear();
        localStorage.removeItem(`${this.frameworkId}_progress`);
        localStorage.removeItem(`${this.frameworkId}_formData`);
        this.render();
    }

    getProgress() {
        return {
            currentTab: this.currentTab,
            completedTabs: this.completedTabs.size,
            totalTabs: this.tabData.length,
            percentage: this.getProgressPercentage()
        };
    }
}

// Make it globally available
window.CalculatorNavigation = CalculatorNavigation;