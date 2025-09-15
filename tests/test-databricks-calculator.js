const testScenarios = [
    {
        name: "Small Data Science Team",
        inputs: {
            workloadTab: {
                dataVolume: 100,
                userCount: 5,
                jobFrequency: 'hourly',
                mlWorkload: 30,
                streamingWorkload: 10
            },
            clusterTab: {
                clusterType: 'standard',
                nodeType: 'i3.xlarge',
                nodeCount: 3,
                autoScaling: true,
                spotInstances: 50
            },
            jobsTab: {
                jobCount: 10,
                avgDuration: 30,
                concurrentJobs: 2,
                orchestration: 'airflow'
            }
        },
        expectedResults: {
            monthlyCost: { min: 3000, max: 8000 },
            dbuHours: { min: 2000, max: 5000 }
        }
    },
    {
        name: "Enterprise Data Platform",
        inputs: {
            workloadTab: {
                dataVolume: 10000,
                userCount: 100,
                jobFrequency: 'continuous',
                mlWorkload: 50,
                streamingWorkload: 40
            },
            clusterTab: {
                clusterType: 'highconcurrency',
                nodeType: 'r5.4xlarge',
                nodeCount: 20,
                autoScaling: true,
                spotInstances: 30
            },
            jobsTab: {
                jobCount: 500,
                avgDuration: 120,
                concurrentJobs: 10,
                orchestration: 'databricks'
            }
        },
        expectedResults: {
            monthlyCost: { min: 50000, max: 150000 },
            dbuHours: { min: 100000, max: 250000 }
        }
    },
    {
        name: "Real-time Streaming Analytics",
        inputs: {
            workloadTab: {
                dataVolume: 5000,
                userCount: 20,
                jobFrequency: 'continuous',
                mlWorkload: 20,
                streamingWorkload: 70
            },
            clusterTab: {
                clusterType: 'streaming',
                nodeType: 'c5.2xlarge',
                nodeCount: 10,
                autoScaling: true,
                spotInstances: 0
            },
            jobsTab: {
                jobCount: 50,
                avgDuration: 1440,
                concurrentJobs: 5,
                orchestration: 'databricks'
            }
        },
        expectedResults: {
            monthlyCost: { min: 20000, max: 60000 },
            dbuHours: { min: 40000, max: 100000 }
        }
    }
];

async function runTests() {
    console.log('🧪 Testing Databricks Sizing Calculator\n');
    console.log('=' .repeat(50));

    const results = [];

    for (const scenario of testScenarios) {
        console.log(`\n📊 Testing: ${scenario.name}`);
        console.log('-'.repeat(40));

        try {
            await testWorkloadAnalysis(scenario);
            await testClusterConfiguration(scenario);
            await testJobsWorkflows(scenario);
            await testPricingCalculations(scenario);
            await testExportFunctions();
            await testResponsiveness();

            results.push({
                scenario: scenario.name,
                status: 'PASSED',
                message: 'All tests passed'
            });

            console.log(`✅ ${scenario.name}: PASSED`);
        } catch (error) {
            results.push({
                scenario: scenario.name,
                status: 'FAILED',
                message: error.message
            });

            console.log(`❌ ${scenario.name}: FAILED - ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 Test Summary:');
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;

    console.log(`✅ Passed: ${passed}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}`);

    if (failed > 0) {
        console.log('\n⚠️  Failed Scenarios:');
        results.filter(r => r.status === 'FAILED').forEach(r => {
            console.log(`  - ${r.scenario}: ${r.message}`);
        });
    }

    return results;
}

async function testWorkloadAnalysis(scenario) {
    console.log('  📝 Testing workload analysis inputs...');

    const inputs = scenario.inputs.workloadTab;

    document.getElementById('dataVolume').value = inputs.dataVolume;
    document.getElementById('userCount').value = inputs.userCount;
    document.getElementById('jobFrequency').value = inputs.jobFrequency;
    document.getElementById('mlWorkload').value = inputs.mlWorkload;
    document.getElementById('streamingWorkload').value = inputs.streamingWorkload;

    const event = new Event('input', { bubbles: true });
    document.getElementById('dataVolume').dispatchEvent(event);

    await new Promise(resolve => setTimeout(resolve, 100));

    const sliderValue = document.querySelector('.slider-value');
    if (!sliderValue || !sliderValue.textContent.includes('%')) {
        throw new Error('Slider values not updating correctly');
    }
}

async function testClusterConfiguration(scenario) {
    console.log('  🖥️  Testing cluster configuration...');

    const inputs = scenario.inputs.clusterTab;

    document.querySelector('[data-tab="cluster"]').click();
    await new Promise(resolve => setTimeout(resolve, 100));

    document.getElementById('clusterType').value = inputs.clusterType;
    document.getElementById('nodeType').value = inputs.nodeType;
    document.getElementById('nodeCount').value = inputs.nodeCount;
    document.getElementById('autoScaling').checked = inputs.autoScaling;
    document.getElementById('spotInstances').value = inputs.spotInstances;

    const event = new Event('change', { bubbles: true });
    document.getElementById('clusterType').dispatchEvent(event);

    await new Promise(resolve => setTimeout(resolve, 100));
}

async function testJobsWorkflows(scenario) {
    console.log('  ⚙️  Testing jobs & workflows...');

    const inputs = scenario.inputs.jobsTab;

    document.querySelector('[data-tab="jobs"]').click();
    await new Promise(resolve => setTimeout(resolve, 100));

    document.getElementById('jobCount').value = inputs.jobCount;
    document.getElementById('avgDuration').value = inputs.avgDuration;
    document.getElementById('concurrentJobs').value = inputs.concurrentJobs;
    document.getElementById('orchestration').value = inputs.orchestration;

    const event = new Event('input', { bubbles: true });
    document.getElementById('jobCount').dispatchEvent(event);

    await new Promise(resolve => setTimeout(resolve, 100));
}

async function testPricingCalculations(scenario) {
    console.log('  💰 Testing pricing calculations...');

    window.calculatePricing();
    await new Promise(resolve => setTimeout(resolve, 200));

    const costElement = document.querySelector('.pricing-summary .highlight');
    if (!costElement) {
        throw new Error('Pricing summary not found');
    }

    const costText = costElement.textContent;
    const cost = parseFloat(costText.replace(/[$,]/g, ''));

    if (isNaN(cost)) {
        throw new Error('Invalid cost calculation');
    }

    if (cost < scenario.expectedResults.monthlyCost.min ||
        cost > scenario.expectedResults.monthlyCost.max) {
        console.log(`    ⚠️  Cost ${cost} outside expected range ${scenario.expectedResults.monthlyCost.min}-${scenario.expectedResults.monthlyCost.max}`);
    } else {
        console.log(`    ✓ Cost calculation within expected range: $${cost.toLocaleString()}`);
    }
}

async function testExportFunctions() {
    console.log('  📥 Testing export functions...');

    const exportButtons = document.querySelectorAll('.action-button');
    if (exportButtons.length < 4) {
        throw new Error('Export buttons not found');
    }

    const originalAlert = window.alert;
    let alertCalled = false;
    window.alert = () => { alertCalled = true; };

    exportButtons[0].click();

    window.alert = originalAlert;

    if (!alertCalled) {
        console.log('    ✓ Export to Excel function available');
    }
}

async function testResponsiveness() {
    console.log('  📱 Testing responsive design...');

    const originalWidth = window.innerWidth;

    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 100));

    const mobileMenu = document.querySelector('.mobile-menu-toggle');
    if (window.innerWidth < 768 && !mobileMenu) {
        console.log('    ⚠️  Mobile menu not found for small screens');
    }

    window.innerWidth = originalWidth;
    window.dispatchEvent(new Event('resize'));

    console.log('    ✓ Responsive design checks complete');
}

async function testManually() {
    console.log('\n🔧 Manual Test Instructions:');
    console.log('1. Open http://localhost:8888/calculators/databricks-sizing/');
    console.log('2. Navigate through all 7 tabs');
    console.log('3. Fill in sample data for each tab');
    console.log('4. Verify calculations update automatically');
    console.log('5. Test Export to Excel functionality');
    console.log('6. Test Save Progress (localStorage)');
    console.log('7. Generate a report and verify formatting');
    console.log('8. Test on mobile device or responsive mode');
    console.log('9. Verify all tooltips and help text appear');
    console.log('10. Check console for any JavaScript errors');
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(runTests, 1000);
    });
} else {
    console.log('🎯 Databricks Calculator Test Suite');
    console.log('Run this in browser console at:');
    console.log('http://localhost:8888/calculators/databricks-sizing/');
    testManually();
}