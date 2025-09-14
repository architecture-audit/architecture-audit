/**
 * SEO Meta Tags and Structured Data
 * Comprehensive SEO implementation for AI Architecture Audit
 */

const SEOConfig = {
    // Site-wide defaults
    siteName: 'AI Architecture Audit',
    siteUrl: 'https://aiarchitectureaudit.com',
    twitterHandle: '@aiarchaudit',
    defaultImage: 'https://aiarchitectureaudit.com/assets/images/og-image.png',

    // Page-specific meta data
    pages: {
        home: {
            title: 'AI Architecture Audit - Enterprise Assessment Tools for Digital Transformation',
            description: 'Free enterprise assessment tools for AI readiness, cloud migration, MLOps, security audits, and digital transformation. Generate instant PDF reports and Excel exports.',
            keywords: 'AI assessment, cloud migration tool, MLOps audit, security assessment, digital transformation, enterprise architecture, AI readiness, GenAI security, cost optimization',
            canonical: 'https://aiarchitectureaudit.com/'
        },

        catalog: {
            title: 'Assessment Framework Catalog - 9 Enterprise Tools | AI Architecture Audit',
            description: 'Browse our complete catalog of enterprise assessment frameworks. AI readiness, cloud migration, security audits, MLOps maturity, and more. Free instant reports.',
            keywords: 'assessment catalog, enterprise frameworks, AI tools, cloud assessment, security audit tools, MLOps framework, digital transformation tools',
            canonical: 'https://aiarchitectureaudit.com/catalog.html'
        },

        docs: {
            title: 'Documentation Hub - Guides & Best Practices | AI Architecture Audit',
            description: 'Comprehensive documentation, guides, and best practices for enterprise assessments. Learn AI implementation, cloud migration strategies, and security frameworks.',
            keywords: 'AI documentation, cloud migration guide, security best practices, MLOps guide, enterprise architecture docs',
            canonical: 'https://aiarchitectureaudit.com/docs/'
        },

        // Calculator-specific pages
        'ai-readiness': {
            title: 'AI Readiness Assessment Tool - Free Enterprise Evaluation',
            description: 'Evaluate your organization\'s AI maturity across data, skills, infrastructure, and governance. Get instant PDF reports with actionable recommendations.',
            keywords: 'AI readiness assessment, AI maturity model, artificial intelligence evaluation, ML readiness, AI adoption strategy',
            canonical: 'https://aiarchitectureaudit.com/calculators/ai-readiness/'
        },

        'cloud-migration': {
            title: 'Cloud Migration Assessment - AWS, Azure, GCP Readiness Tool',
            description: 'Assess cloud migration readiness with 6R strategies, TCO analysis, and vendor comparison. Free tool with instant Excel and PDF reports.',
            keywords: 'cloud migration assessment, AWS migration, Azure readiness, GCP migration tool, cloud TCO calculator, 6R framework',
            canonical: 'https://aiarchitectureaudit.com/calculators/cloud-migration/'
        },

        'security-audit': {
            title: 'Security Audit Framework - NIST & ISO Compliance Tool',
            description: 'Comprehensive security assessment based on NIST and ISO standards. Evaluate zero trust architecture, incident response, and compliance readiness.',
            keywords: 'security audit tool, NIST framework, ISO 27001 assessment, zero trust architecture, cybersecurity audit, compliance assessment',
            canonical: 'https://aiarchitectureaudit.com/calculators/security-audit/'
        },

        'mlops-audit': {
            title: 'MLOps Maturity Assessment - ML Operations Audit Tool',
            description: 'Evaluate ML operations maturity from experimentation to production. Assess pipelines, monitoring, and governance practices with instant reports.',
            keywords: 'MLOps assessment, ML operations audit, machine learning maturity, ML pipeline evaluation, model governance',
            canonical: 'https://aiarchitectureaudit.com/calculators/mlops-audit/'
        },

        'llm-framework': {
            title: 'LLM Implementation Framework - Large Language Model Assessment',
            description: 'Strategic assessment for Large Language Model deployment. Evaluate model selection, RAG architecture, and prompt engineering readiness.',
            keywords: 'LLM assessment, large language model framework, ChatGPT implementation, RAG architecture, prompt engineering, GenAI strategy',
            canonical: 'https://aiarchitectureaudit.com/calculators/llm-framework/'
        },

        'genai-security': {
            title: 'GenAI Security Assessment - Generative AI Risk Evaluation',
            description: 'Specialized security framework for generative AI. Assess prompt injection defense, hallucination detection, and AI-specific threats.',
            keywords: 'GenAI security, generative AI risks, prompt injection, AI hallucination, LLM security, AI safety assessment',
            canonical: 'https://aiarchitectureaudit.com/calculators/genai-security/'
        },

        'cost-optimization': {
            title: 'Cloud Cost Optimization Tool - FinOps Assessment Framework',
            description: 'FinOps principles and cloud cost optimization audit. Identify waste, implement budgets, and maximize cloud ROI with actionable reports.',
            keywords: 'cloud cost optimization, FinOps assessment, cloud spend analysis, AWS cost optimization, Azure cost management',
            canonical: 'https://aiarchitectureaudit.com/calculators/cost-optimization/'
        },

        'well-architected': {
            title: 'Well-Architected Review Tool - AWS Framework Assessment',
            description: 'Build secure, high-performing infrastructure based on AWS Well-Architected Framework. Evaluate six pillars of excellence with instant reports.',
            keywords: 'well-architected framework, AWS assessment, cloud architecture review, infrastructure evaluation, cloud best practices',
            canonical: 'https://aiarchitectureaudit.com/calculators/well-architected/'
        }
    },

    // Structured data templates
    getStructuredData(pageType, pageName) {
        const baseOrg = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AI Architecture Audit",
            "url": "https://aiarchitectureaudit.com",
            "logo": "https://aiarchitectureaudit.com/assets/images/logo.png",
            "sameAs": [
                "https://twitter.com/aiarchaudit",
                "https://linkedin.com/company/ai-architecture-audit",
                "https://github.com/ai-architecture-audit"
            ]
        };

        const schemas = {
            home: {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "AI Architecture Audit Platform",
                "url": "https://aiarchitectureaudit.com",
                "description": "Enterprise assessment tools for digital transformation",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Any",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "127"
                }
            },

            tool: {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": pageName,
                "applicationCategory": "Assessment Tool",
                "operatingSystem": "Web Browser",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "featureList": [
                    "PDF Report Generation",
                    "Excel Export",
                    "Progress Saving",
                    "Shareable Results",
                    "Instant Analysis"
                ]
            },

            faq: {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "What assessment frameworks are available?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "We offer 9 frameworks: AI Readiness, Cloud Migration, Security Audit, MLOps, LLM Framework, GenAI Security, Cost Optimization, and Well-Architected Review."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Are the assessment tools really free?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, all assessment tools are 100% free to use with unlimited assessments, PDF reports, and Excel exports."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How long does an assessment take?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Most assessments take 15-25 minutes to complete. You can save progress and return anytime."
                        }
                    }
                ]
            },

            breadcrumb: (items) => ({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": items.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.name,
                    "item": item.url
                }))
            })
        };

        return schemas[pageType] || baseOrg;
    }
};

// Function to inject SEO meta tags
function injectSEOMeta(pageName) {
    const pageConfig = SEOConfig.pages[pageName] || SEOConfig.pages.home;
    const head = document.head;

    // Remove existing meta tags to avoid duplicates
    const existingMeta = head.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"]');
    existingMeta.forEach(tag => tag.remove());

    // Basic meta tags
    const metaTags = [
        { name: 'description', content: pageConfig.description },
        { name: 'keywords', content: pageConfig.keywords },
        { name: 'author', content: 'AI Architecture Audit Team' },
        { name: 'robots', content: 'index, follow' },

        // Open Graph tags
        { property: 'og:title', content: pageConfig.title },
        { property: 'og:description', content: pageConfig.description },
        { property: 'og:url', content: pageConfig.canonical },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: SEOConfig.siteName },
        { property: 'og:image', content: SEOConfig.defaultImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },

        // Twitter Card tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: SEOConfig.twitterHandle },
        { name: 'twitter:title', content: pageConfig.title },
        { name: 'twitter:description', content: pageConfig.description },
        { name: 'twitter:image', content: SEOConfig.defaultImage },

        // Additional SEO tags
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
    ];

    // Inject meta tags
    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        Object.keys(tag).forEach(key => {
            meta.setAttribute(key, tag[key]);
        });
        head.appendChild(meta);
    });

    // Update title
    document.title = pageConfig.title;

    // Add canonical link
    let canonical = head.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        head.appendChild(canonical);
    }
    canonical.href = pageConfig.canonical;

    // Add structured data
    let structuredData = document.getElementById('structured-data');
    if (!structuredData) {
        structuredData = document.createElement('script');
        structuredData.type = 'application/ld+json';
        structuredData.id = 'structured-data';
        head.appendChild(structuredData);
    }

    const schemaType = pageName.includes('calculator') ? 'tool' :
                      pageName === 'home' ? 'home' :
                      pageName === 'catalog' ? 'tool' : 'home';

    structuredData.textContent = JSON.stringify(
        SEOConfig.getStructuredData(schemaType, pageConfig.title)
    );
}

// Auto-detect current page and inject SEO
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    let pageName = 'home';

    if (path.includes('ai-readiness')) pageName = 'ai-readiness';
    else if (path.includes('cloud-migration')) pageName = 'cloud-migration';
    else if (path.includes('security-audit')) pageName = 'security-audit';
    else if (path.includes('mlops-audit')) pageName = 'mlops-audit';
    else if (path.includes('llm-framework')) pageName = 'llm-framework';
    else if (path.includes('genai-security')) pageName = 'genai-security';
    else if (path.includes('cost-optimization')) pageName = 'cost-optimization';
    else if (path.includes('well-architected')) pageName = 'well-architected';
    else if (path.includes('catalog')) pageName = 'catalog';
    else if (path.includes('docs')) pageName = 'docs';

    injectSEOMeta(pageName);
});

// Export for manual use
window.SEOConfig = SEOConfig;
window.injectSEOMeta = injectSEOMeta;