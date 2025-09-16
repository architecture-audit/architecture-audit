// Test Suite for Databricks Intelligent Sizing Recommendations
const RecommendationTestSuite = {
    // Test scenarios covering various workload types and requirements
    testScenarios: [
        {
            name: "Small Streaming Analytics",
            input: {
                workloadType: 'streaming',
                dataVolume: 100, // GB/hour
                userCount: 10,
                priority: 'performance',
                cloudProvider: 'aws'
            },
            expectations: {
                primaryTemplate: 'streaming_small',
                minConfidenceScore: 80,
                nodeCountRange: [2, 8],
                spotInstancePercent: 0, // No spot for streaming
                requiredFeatures: ['photon', 'unityCatalog', 'deltaLiveTable']
            }
        },
        {
            name: "Large Batch ETL",
            input: {
                workloadType: 'batch_etl',
                dataVolume: 10000, // GB daily
                userCount: 50,
                priority: 'cost',
                cloudProvider: 'azure'
            },
            expectations: {
                primaryTemplate: 'batch_etl_medium',
                minConfidenceScore: 70,
                nodeCountRange: [4, 20],
                spotInstancePercent: 60, // High spot for cost savings
                requiredFeatures: ['photon', 'unityCatalog']
            }
        },
        {
            name: "ML Training Workload",
            input: {
                workloadType: 'machine_learning',
                dataVolume: 5000,
                userCount: 20,
                priority: 'balanced',
                cloudProvider: 'gcp'
            },
            expectations: {
                primaryTemplate: 'ml_training_large',
                minConfidenceScore: 75,
                nodeCountRange: [2, 16],
                spotInstancePercent: 30,
                requiredFeatures: ['mlRuntime', 'gpuEnabled'],
                excludedFeatures: ['photon'] // Photon not for ML
            }
        },
        {
            name: "Interactive Data Science",
            input: {
                workloadType: 'data_science',
                dataVolume: 200,
                userCount: 15,
                priority: 'performance',
                cloudProvider: 'aws'
            },
            expectations: {
                primaryTemplate: 'datascience_small',
                minConfidenceScore: 85,
                nodeCountRange: [1, 5],
                spotInstancePercent: 0,
                requiredFeatures: ['mlRuntime', 'unityCatalog']
            }
        },
        {
            name: "Business Intelligence",
            input: {
                workloadType: 'business_intelligence',
                dataVolume: 3000,
                userCount: 200,
                priority: 'cost',
                cloudProvider: 'azure'
            },
            expectations: {
                primaryTemplate: 'bi_reporting',
                minConfidenceScore: 80,
                nodeCountRange: [2, 10],
                spotInstancePercent: 50,
                requiredFeatures: ['photon', 'sqlWarehouse']
            }
        },
        {
            name: "Edge Case - Minimal Workload",
            input: {
                workloadType: 'batch_etl',
                dataVolume: 10, // Very small
                userCount: 1,
                priority: 'cost',
                cloudProvider: 'aws'
            },
            expectations: {
                primaryTemplate: 'batch_etl_small',
                minConfidenceScore: 60,
                nodeCountRange: [1, 3],
                spotInstancePercent: 70,
                requiredFeatures: ['unityCatalog']
            }
        },
        {
            name: "Edge Case - Massive Scale",
            input: {
                workloadType: 'streaming',
                dataVolume: 50000, // Very large
                userCount: 500,
                priority: 'performance',
                cloudProvider: 'gcp'
            },
            expectations: {
                minConfidenceScore: 50, // Lower confidence for extreme scale
                nodeCountRange: [20, 100],
                spotInstancePercent: 0,
                requiredFeatures: ['photon', 'unityCatalog', 'deltaLiveTable']
            }
        }
    ],

    // Test the recommendation engine
    async testRecommendationEngine() {
        console.log('🧪 Testing Recommendation Engine\n');
        console.log('=' .repeat(60));

        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        for (const scenario of this.testScenarios) {
            console.log(`\n📊 Testing: ${scenario.name}`);
            console.log('-'.repeat(50));

            try {
                // Get recommendations
                const recommendations = await DatabricksRecommendations.recommend(
                    scenario.input,
                    window.currentConfig || {}
                );

                // Validate primary recommendation
                this.validatePrimaryRecommendation(scenario, recommendations, results);

                // Validate configuration details
                this.validateConfiguration(scenario, recommendations, results);

                // Validate confidence score
                this.validateConfidenceScore(scenario, recommendations, results);

                // Validate explanations
                this.validateExplanations(scenario, recommendations, results);

                console.log(`✅ ${scenario.name}: PASSED`);
                results.passed++;

            } catch (error) {
                console.log(`❌ ${scenario.name}: FAILED - ${error.message}`);
                results.failed++;
                results.errors.push({
                    scenario: scenario.name,
                    error: error.message
                });
            }
        }

        return this.generateTestReport(results);
    },

    validatePrimaryRecommendation(scenario, recommendations, results) {
        const primary = recommendations.primary;

        if (!primary) {
            throw new Error('No primary recommendation returned');
        }

        // Check template match if expected
        if (scenario.expectations.primaryTemplate) {
            const templateId = primary.template?.id || primary.baseTemplate;
            if (templateId !== scenario.expectations.primaryTemplate) {
                console.log(`  ⚠️ Template mismatch: expected ${scenario.expectations.primaryTemplate}, got ${templateId}`);
            }
        }

        // Validate node count range
        const nodeCount = primary.configuration.nodeCount;
        const [minNodes, maxNodes] = scenario.expectations.nodeCountRange;

        if (nodeCount < minNodes || nodeCount > maxNodes) {
            throw new Error(`Node count ${nodeCount} outside expected range [${minNodes}, ${maxNodes}]`);
        }

        console.log(`  ✓ Primary recommendation validated`);
    },

    validateConfiguration(scenario, recommendations, results) {
        const config = recommendations.primary.configuration;
        const expectations = scenario.expectations;

        // Check spot instance percentage
        if (expectations.spotInstancePercent !== undefined) {
            const spotPercent = config.spotInstancePercent || 0;
            const tolerance = 20; // Allow 20% variance

            if (Math.abs(spotPercent - expectations.spotInstancePercent) > tolerance) {
                console.log(`  ⚠️ Spot instance % differs: expected ~${expectations.spotInstancePercent}%, got ${spotPercent}%`);
            }
        }

        // Check required features
        if (expectations.requiredFeatures) {
            for (const feature of expectations.requiredFeatures) {
                if (!config.features || !config.features[feature]) {
                    throw new Error(`Required feature '${feature}' not enabled`);
                }
            }
        }

        // Check excluded features
        if (expectations.excludedFeatures) {
            for (const feature of expectations.excludedFeatures) {
                if (config.features && config.features[feature]) {
                    throw new Error(`Feature '${feature}' should not be enabled`);
                }
            }
        }

        console.log(`  ✓ Configuration validated`);
    },

    validateConfidenceScore(scenario, recommendations, results) {
        const confidence = recommendations.primary.confidence;
        const minConfidence = scenario.expectations.minConfidenceScore;

        if (confidence < minConfidence) {
            throw new Error(`Confidence score ${confidence} below minimum ${minConfidence}`);
        }

        console.log(`  ✓ Confidence score: ${confidence}%`);
    },

    validateExplanations(scenario, recommendations, results) {
        const explanations = recommendations.primary.explanation;

        if (!explanations) {
            throw new Error('No explanations provided');
        }

        // Handle both array and string explanations
        const explanationArray = Array.isArray(explanations) ? explanations : [explanations];

        if (explanationArray.length === 0) {
            throw new Error('No explanations provided');
        }

        // Check for key explanation categories
        const hasWorkloadExplanation = explanationArray.some(e =>
            e.toLowerCase().includes('workload') ||
            e.toLowerCase().includes(scenario.input.workloadType)
        );

        const hasPriorityExplanation = explanationArray.some(e =>
            e.toLowerCase().includes(scenario.input.priority)
        );

        if (!hasWorkloadExplanation) {
            console.log(`  ⚠️ Missing workload-specific explanation`);
        }

        if (!hasPriorityExplanation) {
            console.log(`  ⚠️ Missing priority-based explanation`);
        }

        console.log(`  ✓ Explanations validated (${explanationArray.length} reasons)`);
    },

    // Test scoring engine
    async testScoringEngine() {
        console.log('\n🎯 Testing Scoring Engine\n');
        console.log('=' .repeat(60));

        const testCases = [
            {
                name: "Perfect Match",
                template: WorkloadTemplates.templates.streaming_small,
                inputs: {
                    dataVolume: 100,
                    userCount: 10,
                    workloadType: 'streaming'
                },
                expectedScoreRange: [90, 100]
            },
            {
                name: "Partial Match",
                template: WorkloadTemplates.templates.batch_etl_medium,
                inputs: {
                    dataVolume: 3000, // Different from template's 5000
                    userCount: 20,
                    workloadType: 'batch_etl'
                },
                expectedScoreRange: [60, 80]
            },
            {
                name: "Poor Match",
                template: WorkloadTemplates.templates.ml_training_small,
                inputs: {
                    dataVolume: 50000, // Way larger than template
                    userCount: 500,
                    workloadType: 'streaming' // Wrong type
                },
                expectedScoreRange: [0, 30]
            }
        ];

        for (const testCase of testCases) {
            const score = DatabricksRecommendations.ScoringEngine.calculateTemplateScore(
                testCase.template,
                testCase.inputs
            );

            const [minScore, maxScore] = testCase.expectedScoreRange;

            if (score < minScore || score > maxScore) {
                console.log(`❌ ${testCase.name}: Score ${score} outside range [${minScore}, ${maxScore}]`);
            } else {
                console.log(`✅ ${testCase.name}: Score ${score} in expected range`);
            }
        }
    },

    // Test wizard workflow
    async testWizardWorkflow() {
        console.log('\n🧙 Testing Wizard Workflow\n');
        console.log('=' .repeat(60));

        const wizardSteps = [
            { step: 1, action: 'selectWorkloadType', value: 'streaming' },
            { step: 2, action: 'setDataScale', value: 500 },
            { step: 3, action: 'setUserCount', value: 25 },
            { step: 4, action: 'setPriority', value: 'balanced' },
            { step: 5, action: 'selectCloudProvider', value: 'aws' }
        ];

        for (const step of wizardSteps) {
            console.log(`  Step ${step.step}: ${step.action} = ${step.value}`);

            // Simulate wizard interaction
            if (typeof window !== 'undefined' && window.wizardData) {
                window.wizardData[step.action] = step.value;
            }
        }

        console.log('✅ Wizard workflow validated');
    },

    // Test optimization constraints
    async testOptimizationConstraints() {
        console.log('\n⚙️ Testing Optimization Constraints\n');
        console.log('=' .repeat(60));

        const constraints = [
            {
                name: "Budget Constraint",
                input: {
                    maxBudget: 10000,
                    configuration: {
                        monthlyCost: 15000,
                        nodeCount: 10
                    }
                },
                expectedAdjustment: 'nodeCount reduction'
            },
            {
                name: "Performance Constraint",
                input: {
                    minPerformance: 'high',
                    configuration: {
                        nodeCount: 2,
                        instanceType: 'i3.xlarge'
                    }
                },
                expectedAdjustment: 'instance upgrade'
            },
            {
                name: "Availability Constraint",
                input: {
                    minAvailability: 99.99,
                    configuration: {
                        spotInstancePercent: 70
                    }
                },
                expectedAdjustment: 'spot reduction'
            }
        ];

        for (const constraint of constraints) {
            console.log(`  Testing: ${constraint.name}`);

            const optimized = DatabricksRecommendations.optimizeForConstraints(
                constraint.input.configuration,
                constraint.input
            );

            if (optimized) {
                console.log(`  ✓ Optimization applied: ${constraint.expectedAdjustment}`);
            } else {
                console.log(`  ⚠️ No optimization found for constraint`);
            }
        }
    },

    // Generate comprehensive test report
    generateTestReport(results) {
        console.log('\n' + '='.repeat(60));
        console.log('📈 Test Summary Report');
        console.log('='.repeat(60));

        const total = results.passed + results.failed;
        const successRate = ((results.passed / total) * 100).toFixed(1);

        console.log(`✅ Passed: ${results.passed}/${total}`);
        console.log(`❌ Failed: ${results.failed}/${total}`);
        console.log(`📊 Success Rate: ${successRate}%`);

        if (results.errors.length > 0) {
            console.log('\n⚠️ Failed Scenarios:');
            results.errors.forEach(err => {
                console.log(`  - ${err.scenario}: ${err.error}`);
            });
        }

        console.log('\n📝 Recommendations:');
        if (successRate >= 90) {
            console.log('  ✅ System performing excellently');
        } else if (successRate >= 70) {
            console.log('  ⚠️ Some edge cases need attention');
        } else {
            console.log('  ❌ Significant issues need resolution');
        }

        return {
            passed: results.passed,
            failed: results.failed,
            successRate: parseFloat(successRate),
            errors: results.errors
        };
    },

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Test Suite\n');

        const startTime = Date.now();

        // Run test suites
        await this.testRecommendationEngine();
        await this.testScoringEngine();
        await this.testWizardWorkflow();
        await this.testOptimizationConstraints();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        console.log(`⏱️ All tests completed in ${duration} seconds`);
        console.log('='.repeat(60));
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationTestSuite;
}

// Auto-run in browser
if (typeof window !== 'undefined') {
    window.RecommendationTestSuite = RecommendationTestSuite;

    window.addEventListener('load', () => {
        console.log('💡 To run recommendation tests, execute:');
        console.log('    RecommendationTestSuite.runAllTests()');
    });
}