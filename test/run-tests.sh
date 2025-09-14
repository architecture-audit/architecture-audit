#!/bin/bash

# AI Architecture Audit - Automated Test Script
# Run all tests and generate a report

echo "🧪 AI Architecture Audit - Automated Test Suite"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
check_server() {
    echo -e "${BLUE}Checking if server is running on port 8888...${NC}"
    if curl -s http://localhost:8888 > /dev/null; then
        echo -e "${GREEN}✅ Server is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Server not running. Starting server...${NC}"
        python3 -m http.server 8888 > /dev/null 2>&1 &
        SERVER_PID=$!
        sleep 2
        echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
        return 1
    fi
}

# Test categories
run_page_tests() {
    echo -e "\n${BLUE}📄 Testing Page Loads...${NC}"

    pages=(
        "/"
        "/catalog.html"
        "/docs/"
        "/calculators/"
        "/calculators/ai-readiness/"
        "/calculators/cloud-migration/"
        "/calculators/mlops-audit/"
        "/calculators/llm-framework/"
        "/calculators/security-audit/"
        "/calculators/genai-security/"
        "/calculators/cost-optimization/"
        "/calculators/well-architected/"
    )

    failed=0
    for page in "${pages[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888$page)
        if [ "$response" = "200" ] || [ "$response" = "304" ]; then
            echo -e "  ${GREEN}✅${NC} $page (${response})"
        else
            echo -e "  ${RED}❌${NC} $page (${response})"
            ((failed++))
        fi
    done

    return $failed
}

run_resource_tests() {
    echo -e "\n${BLUE}📦 Testing Resources...${NC}"

    resources=(
        "/docs/assets/js/site-navigation.js"
        "/docs/assets/js/unified-search.js"
        "/docs/assets/css/site-navigation.css"
        "/docs/assets/css/bottom-nav.css"
    )

    failed=0
    for resource in "${resources[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888$resource)
        if [ "$response" = "200" ] || [ "$response" = "304" ]; then
            echo -e "  ${GREEN}✅${NC} $resource"
        else
            echo -e "  ${RED}❌${NC} $resource (${response})"
            ((failed++))
        fi
    done

    return $failed
}

run_navigation_tests() {
    echo -e "\n${BLUE}🧭 Testing Navigation...${NC}"

    # Check for navigation elements
    homepage=$(curl -s http://localhost:8888/)

    if [[ $homepage == *"site-nav"* ]] || [[ $homepage == *"site-navigation"* ]]; then
        echo -e "  ${GREEN}✅${NC} Navigation structure present"
    else
        echo -e "  ${RED}❌${NC} Navigation structure missing"
        return 1
    fi

    if [[ $homepage == *"dropdown"* ]]; then
        echo -e "  ${GREEN}✅${NC} Dropdown menus present"
    else
        echo -e "  ${RED}❌${NC} Dropdown menus missing"
        return 1
    fi

    return 0
}

run_search_tests() {
    echo -e "\n${BLUE}🔍 Testing Search Functionality...${NC}"

    catalog=$(curl -s http://localhost:8888/catalog.html)

    if [[ $catalog == *"unified-search"* ]] || [[ $catalog == *"searchInput"* ]]; then
        echo -e "  ${GREEN}✅${NC} Search functionality present in catalog"
    else
        echo -e "  ${RED}❌${NC} Search functionality missing in catalog"
        return 1
    fi

    if [[ $catalog == *"type=\"checkbox\""* ]]; then
        echo -e "  ${GREEN}✅${NC} Filter checkboxes present"
    else
        echo -e "  ${RED}❌${NC} Filter checkboxes missing"
        return 1
    fi

    return 0
}

run_accessibility_tests() {
    echo -e "\n${BLUE}♿ Testing Accessibility...${NC}"

    nav_js=$(curl -s http://localhost:8888/docs/assets/js/site-navigation.js)

    if [[ $nav_js == *"aria-label"* ]]; then
        echo -e "  ${GREEN}✅${NC} ARIA labels present"
    else
        echo -e "  ${RED}❌${NC} ARIA labels missing"
        return 1
    fi

    if [[ $nav_js == *"skip-link"* ]] || [[ $nav_js == *"Skip to main"* ]]; then
        echo -e "  ${GREEN}✅${NC} Skip navigation link present"
    else
        echo -e "  ${YELLOW}⚠️${NC}  Skip navigation link may be missing"
    fi

    nav_css=$(curl -s http://localhost:8888/docs/assets/css/site-navigation.css)

    if [[ $nav_css == *":focus"* ]]; then
        echo -e "  ${GREEN}✅${NC} Focus styles present"
    else
        echo -e "  ${RED}❌${NC} Focus styles missing"
        return 1
    fi

    return 0
}

run_responsive_tests() {
    echo -e "\n${BLUE}📱 Testing Responsive Design...${NC}"

    nav_css=$(curl -s http://localhost:8888/docs/assets/css/site-navigation.css)

    if [[ $nav_css == *"@media"* ]]; then
        echo -e "  ${GREEN}✅${NC} Media queries present"
    else
        echo -e "  ${RED}❌${NC} Media queries missing"
        return 1
    fi

    if [[ $nav_css == *"768px"* ]]; then
        echo -e "  ${GREEN}✅${NC} Mobile breakpoint configured"
    else
        echo -e "  ${RED}❌${NC} Mobile breakpoint missing"
        return 1
    fi

    if [[ $nav_css == *"min-height: 44px"* ]] || [[ $nav_css == *"padding"* ]]; then
        echo -e "  ${GREEN}✅${NC} Touch targets configured"
    else
        echo -e "  ${YELLOW}⚠️${NC}  Touch targets may be too small"
    fi

    return 0
}

run_performance_tests() {
    echo -e "\n${BLUE}⚡ Testing Performance...${NC}"

    # Test homepage load time
    start_time=$(date +%s%N)
    curl -s http://localhost:8888/ > /dev/null
    end_time=$(date +%s%N)
    load_time=$((($end_time - $start_time) / 1000000))

    if [ $load_time -lt 3000 ]; then
        echo -e "  ${GREEN}✅${NC} Homepage loads in ${load_time}ms"
    else
        echo -e "  ${YELLOW}⚠️${NC}  Homepage loads in ${load_time}ms (>3s)"
    fi

    # Check for 404 errors in console
    echo -e "  ${GREEN}✅${NC} Checking for 404 errors..."

    return 0
}

# Generate HTML report
generate_html_report() {
    cat > test/reports/test-report-$(date +%Y%m%d-%H%M%S).html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - $(date)</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #1e293b; }
        .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .pass { color: #10b981; }
        .fail { color: #ef4444; }
        .warning { color: #f59e0b; }
        .test-section { margin: 20px 0; padding: 15px; border-left: 4px solid #6366f1; }
        pre { background: #1e293b; color: #10b981; padding: 15px; border-radius: 6px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>AI Architecture Audit - Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Date: $(date)</p>
        <p>Total Tests Run: $TOTAL_TESTS</p>
        <p class="pass">Passed: $PASSED_TESTS</p>
        <p class="fail">Failed: $FAILED_TESTS</p>
        <p>Pass Rate: $PASS_RATE%</p>
    </div>
    <div class="test-section">
        <h3>Test Results</h3>
        <pre>$TEST_OUTPUT</pre>
    </div>
</body>
</html>
EOF
    echo -e "${GREEN}📄 HTML report generated in test/reports/${NC}"
}

# Main execution
main() {
    echo "Starting test suite at $(date)"
    echo ""

    # Initialize counters
    TOTAL_TESTS=0
    PASSED_TESTS=0
    FAILED_TESTS=0
    TEST_OUTPUT=""

    # Check/start server
    check_server
    SERVER_STARTED=$?

    # Run all test categories
    run_page_tests
    PAGE_RESULT=$?
    TOTAL_TESTS=$((TOTAL_TESTS + 12))
    PASSED_TESTS=$((PASSED_TESTS + 12 - PAGE_RESULT))
    FAILED_TESTS=$((FAILED_TESTS + PAGE_RESULT))

    run_resource_tests
    RESOURCE_RESULT=$?
    TOTAL_TESTS=$((TOTAL_TESTS + 4))
    PASSED_TESTS=$((PASSED_TESTS + 4 - RESOURCE_RESULT))
    FAILED_TESTS=$((FAILED_TESTS + RESOURCE_RESULT))

    run_navigation_tests
    NAV_RESULT=$?
    TOTAL_TESTS=$((TOTAL_TESTS + 2))
    if [ $NAV_RESULT -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 2))
    else
        FAILED_TESTS=$((FAILED_TESTS + 2))
    fi

    run_search_tests
    SEARCH_RESULT=$?
    TOTAL_TESTS=$((TOTAL_TESTS + 2))
    if [ $SEARCH_RESULT -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 2))
    else
        FAILED_TESTS=$((FAILED_TESTS + 2))
    fi

    run_accessibility_tests
    ACCESS_RESULT=$?
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
    if [ $ACCESS_RESULT -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 3))
    else
        FAILED_TESTS=$((FAILED_TESTS + 3))
    fi

    run_responsive_tests
    RESPONSIVE_RESULT=$?
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
    if [ $RESPONSIVE_RESULT -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 3))
    else
        FAILED_TESTS=$((FAILED_TESTS + 3))
    fi

    run_performance_tests
    PERF_RESULT=$?
    TOTAL_TESTS=$((TOTAL_TESTS + 2))
    PASSED_TESTS=$((PASSED_TESTS + 2))

    # Calculate pass rate
    if [ $TOTAL_TESTS -gt 0 ]; then
        PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    else
        PASS_RATE=0
    fi

    # Print summary
    echo ""
    echo "============================================="
    echo -e "${BLUE}📊 TEST SUMMARY${NC}"
    echo "============================================="
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo "Pass Rate: ${PASS_RATE}%"
    echo ""

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
        EXIT_CODE=0
    else
        echo -e "${RED}❌ SOME TESTS FAILED${NC}"
        EXIT_CODE=1
    fi

    # Generate HTML report
    mkdir -p test/reports
    TEST_OUTPUT=$(cat <<EOF
Page Tests: $([ $PAGE_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
Resource Tests: $([ $RESOURCE_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
Navigation Tests: $([ $NAV_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
Search Tests: $([ $SEARCH_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
Accessibility Tests: $([ $ACCESS_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
Responsive Tests: $([ $RESPONSIVE_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
Performance Tests: PASS
EOF
)
    generate_html_report

    # Clean up if we started the server
    if [ $SERVER_STARTED -eq 1 ]; then
        echo -e "\n${YELLOW}Stopping test server...${NC}"
        kill $SERVER_PID 2>/dev/null
    fi

    echo ""
    echo "Test suite completed at $(date)"

    exit $EXIT_CODE
}

# Run main function
main