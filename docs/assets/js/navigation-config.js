// Centralized Navigation Configuration
// This single source of truth manages all navigation across the site

const NavigationConfig = {
    // Framework categories for organization
    categories: {
        'AI & Machine Learning': {
            icon: '🤖',
            frameworks: [
                { id: 'ai-readiness', name: 'AI Readiness Assessment', badge: 'POPULAR' },
                { id: 'mlops-audit', name: 'MLOps Maturity Audit' },
                { id: 'llm-framework', name: 'LLM Implementation Framework' },
                { id: 'genai-security', name: 'GenAI Security Framework' },
                { id: 'ml-platform', name: 'ML Platform Selection' },
                { id: 'ai-governance', name: 'AI Governance Framework' },
                { id: 'data-science', name: 'Data Science Maturity' },
                { id: 'computer-vision', name: 'Computer Vision Readiness' },
                { id: 'nlp-assessment', name: 'NLP Capability Assessment' },
                { id: 'ai-ethics', name: 'AI Ethics Audit' }
            ]
        },
        'Cloud & Infrastructure': {
            icon: '☁️',
            frameworks: [
                { id: 'cloud-migration', name: 'Cloud Migration Assessment', badge: 'TRENDING' },
                { id: 'well-architected', name: 'Well-Architected Framework' },
                { id: 'cost-optimization', name: 'Cost Optimization Framework' },
                { id: 'multi-cloud', name: 'Multi-Cloud Strategy' },
                { id: 'kubernetes', name: 'Kubernetes Readiness' },
                { id: 'serverless', name: 'Serverless Adoption' },
                { id: 'edge-computing', name: 'Edge Computing Assessment' },
                { id: 'hybrid-cloud', name: 'Hybrid Cloud Strategy' }
            ]
        },
        'Security & Compliance': {
            icon: '🔒',
            frameworks: [
                { id: 'security-audit', name: 'Security Audit Framework' },
                { id: 'zero-trust', name: 'Zero Trust Maturity' },
                { id: 'compliance-audit', name: 'Compliance Assessment' },
                { id: 'gdpr-readiness', name: 'GDPR Readiness Check' },
                { id: 'soc2-assessment', name: 'SOC2 Assessment' },
                { id: 'iso27001', name: 'ISO 27001 Readiness' },
                { id: 'devsecops', name: 'DevSecOps Maturity' },
                { id: 'cloud-security', name: 'Cloud Security Posture' },
                { id: 'identity-access', name: 'Identity & Access Management' },
                { id: 'incident-response', name: 'Incident Response Readiness' }
            ]
        },
        'Data & Analytics': {
            icon: '📊',
            frameworks: [
                { id: 'data-maturity', name: 'Data Maturity Assessment' },
                { id: 'data-governance', name: 'Data Governance Framework' },
                { id: 'analytics-readiness', name: 'Analytics Readiness' },
                { id: 'bi-assessment', name: 'Business Intelligence Audit' },
                { id: 'data-quality', name: 'Data Quality Assessment' },
                { id: 'master-data', name: 'Master Data Management' },
                { id: 'data-warehouse', name: 'Data Warehouse Strategy' },
                { id: 'real-time-analytics', name: 'Real-Time Analytics Readiness' }
            ]
        },
        'DevOps & Automation': {
            icon: '🚀',
            frameworks: [
                { id: 'devops-maturity', name: 'DevOps Maturity Assessment' },
                { id: 'cicd-assessment', name: 'CI/CD Pipeline Audit' },
                { id: 'automation-readiness', name: 'Automation Readiness' },
                { id: 'gitops-maturity', name: 'GitOps Maturity' },
                { id: 'infrastructure-code', name: 'Infrastructure as Code' },
                { id: 'observability', name: 'Observability Maturity' },
                { id: 'sre-assessment', name: 'SRE Assessment' }
            ]
        },
        'Digital Transformation': {
            icon: '🔄',
            frameworks: [
                { id: 'digital-maturity', name: 'Digital Maturity Assessment' },
                { id: 'agile-assessment', name: 'Agile Transformation' },
                { id: 'api-strategy', name: 'API Strategy Assessment' },
                { id: 'microservices', name: 'Microservices Readiness' },
                { id: 'legacy-modernization', name: 'Legacy Modernization' },
                { id: 'innovation-audit', name: 'Innovation Capability Audit' }
            ]
        }
    },

    // Navigation structure
    navigation: {
        primary: [
            {
                label: 'Home',
                href: '/',
                mobileOnly: false
            },
            {
                label: 'Catalog',
                href: '/catalog.html',
                highlight: true,
                description: 'Browse all 50+ frameworks'
            },
            {
                label: 'Quick Start',
                type: 'mega',
                sections: [
                    {
                        title: 'Most Popular',
                        items: [
                            'ai-readiness',
                            'cloud-migration',
                            'security-audit',
                            'well-architected'
                        ]
                    },
                    {
                        title: 'New & Trending',
                        items: [
                            'genai-security',
                            'llm-framework',
                            'zero-trust',
                            'gitops-maturity'
                        ]
                    }
                ]
            },
            {
                label: 'Solutions',
                type: 'mega',
                sections: [
                    {
                        title: 'By Industry',
                        links: [
                            { label: 'Financial Services', href: '/solutions/financial' },
                            { label: 'Healthcare', href: '/solutions/healthcare' },
                            { label: 'Retail', href: '/solutions/retail' },
                            { label: 'Manufacturing', href: '/solutions/manufacturing' }
                        ]
                    },
                    {
                        title: 'By Company Size',
                        links: [
                            { label: 'Startup (1-50)', href: '/solutions/startup' },
                            { label: 'Growth (50-500)', href: '/solutions/growth' },
                            { label: 'Enterprise (500+)', href: '/solutions/enterprise' }
                        ]
                    }
                ]
            },
            {
                label: 'Resources',
                type: 'dropdown',
                items: [
                    { label: 'Documentation', href: '/docs' },
                    { label: 'Best Practices', href: '/best-practices' },
                    { label: 'Case Studies', href: '/case-studies' },
                    { label: 'API Reference', href: '/api' },
                    { label: 'Community', href: '/community' }
                ]
            }
        ],

        // Mobile bottom navigation
        mobile: [
            { icon: '🏠', label: 'Home', href: '/' },
            { icon: '📚', label: 'Catalog', href: '/catalog.html' },
            { icon: '🔍', label: 'Search', action: 'openSearch' },
            { icon: '📖', label: 'Docs', href: '/docs' },
            { icon: '👤', label: 'Account', href: '/account' }
        ]
    },

    // Search configuration
    search: {
        placeholder: 'Search 50+ frameworks... Try "cloud migration" or "security"',
        minChars: 2,
        maxResults: 8,
        categories: true,
        weights: {
            title: 10,
            description: 5,
            category: 3,
            tags: 2
        }
    },

    // Get framework by ID
    getFramework(id) {
        for (const [category, data] of Object.entries(this.categories)) {
            const framework = data.frameworks.find(f => f.id === id);
            if (framework) {
                return { ...framework, category, icon: data.icon };
            }
        }
        return null;
    },

    // Get all frameworks
    getAllFrameworks() {
        const frameworks = [];
        for (const [category, data] of Object.entries(this.categories)) {
            data.frameworks.forEach(f => {
                frameworks.push({
                    ...f,
                    category,
                    icon: data.icon,
                    calculatorUrl: `/calculators/${f.id}/`,
                    docUrl: `/docs/${f.id}/`
                });
            });
        }
        return frameworks;
    },

    // Search frameworks
    searchFrameworks(query) {
        const lowerQuery = query.toLowerCase();
        const allFrameworks = this.getAllFrameworks();

        return allFrameworks
            .filter(f =>
                f.name.toLowerCase().includes(lowerQuery) ||
                f.category.toLowerCase().includes(lowerQuery) ||
                f.id.includes(lowerQuery)
            )
            .sort((a, b) => {
                // Prioritize exact matches
                if (a.name.toLowerCase() === lowerQuery) return -1;
                if (b.name.toLowerCase() === lowerQuery) return 1;

                // Then title matches
                if (a.name.toLowerCase().startsWith(lowerQuery)) return -1;
                if (b.name.toLowerCase().startsWith(lowerQuery)) return 1;

                return 0;
            })
            .slice(0, this.search.maxResults);
    },

    // Generate navigation HTML
    generateNav() {
        // This would generate the full navigation HTML
        // Implementation depends on your specific needs
        return `<!-- Generated navigation -->`;
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationConfig;
}