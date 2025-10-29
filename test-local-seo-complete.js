#!/usr/bin/env node

/**
 * Complete Local SEO Monitoring System Test
 * Tests all endpoints and features
 */

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, description) {
    try {
        console.log(`\n📍 Testing: ${description}`);
        console.log(`   Endpoint: ${path}`);
        
        const response = await fetch(`${BASE_URL}${path}`);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`   ✅ Status: ${response.status} OK`);
            
            // Show key metrics from response
            if (path.includes('/metrics')) {
                console.log(`   📊 GMB Visibility: ${data.gmbVisibility?.toFixed(1)}%`);
                console.log(`   🎯 Local Pack Rank: #${data.localPackRank}`);
                console.log(`   ⭐ Review Score: ${data.reviewScore}`);
                console.log(`   🔗 Citation Score: ${data.citationScore}%`);
            } else if (path.includes('/gmb/insights')) {
                console.log(`   👁️ Total Views: ${data.views?.total || 'N/A'}`);
                console.log(`   🔍 Search Queries: ${data.searchQueries?.length || 0} tracked`);
                console.log(`   📞 Customer Actions: Calls(${data.customerActions?.calls || 0}), Directions(${data.customerActions?.directions || 0})`);
            } else if (path.includes('/rankings/local')) {
                console.log(`   📈 Total Keywords: ${data.summary?.totalKeywords || 0}`);
                console.log(`   🏆 Top 3 Rankings: ${data.summary?.top3Count || 0}`);
                console.log(`   📊 Average Rank: #${data.summary?.averageRank || 'N/A'}`);
            } else if (path.includes('/competitors')) {
                console.log(`   👥 Competitors Tracked: ${data.competitors?.length || 0}`);
                console.log(`   📊 Your Share of Voice: ${data.shareOfVoice?.yourBusiness || 0}%`);
                console.log(`   ⚠️ Competitor Alerts: ${data.alerts?.length || 0}`);
            } else if (path.includes('/reviews/monitor')) {
                console.log(`   ⭐ Total Reviews: ${data.summary?.totalReviews || 0}`);
                console.log(`   🌟 Average Rating: ${data.summary?.averageRating || 0}`);
                console.log(`   💬 Response Rate: ${data.summary?.responseRate || 0}%`);
                console.log(`   😊 Positive Sentiment: ${data.summary?.sentiment?.positive || 0}%`);
            } else if (path.includes('/citations/monitor')) {
                console.log(`   📍 Total Directories: ${data.summary?.total || 0}`);
                console.log(`   ✅ Listed: ${data.summary?.listed || 0}`);
                console.log(`   ⏳ Pending: ${data.summary?.pending || 0}`);
                console.log(`   🔧 NAP Consistency: ${data.summary?.averageConsistency || 0}%`);
            } else if (path.includes('/alerts')) {
                console.log(`   🔔 Total Alerts: ${data.alerts?.length || 0}`);
                console.log(`   📬 Unread: ${data.unreadCount || 0}`);
                console.log(`   ⚠️ Action Required: ${data.actionRequired || 0}`);
            }
            
            return { success: true, data };
        } else {
            console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
            return { success: false, error: response.statusText };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testPageLoad(path, description) {
    try {
        console.log(`\n🌐 Testing Page: ${description}`);
        console.log(`   URL: ${BASE_URL}${path}`);
        
        const response = await fetch(`${BASE_URL}${path}`);
        const html = await response.text();
        
        if (response.ok) {
            console.log(`   ✅ Status: ${response.status} OK`);
            
            // Check for key elements
            const hasTitle = html.includes('Local SEO Real-Time Optimizer');
            const hasScript = html.includes('real-time-local-seo.js');
            const hasApp = html.includes('id="app"');
            
            console.log(`   ${hasTitle ? '✅' : '❌'} Page title found`);
            console.log(`   ${hasScript ? '✅' : '❌'} JavaScript loaded`);
            console.log(`   ${hasApp ? '✅' : '❌'} App container found`);
            
            return { success: true, html };
        } else {
            console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
            return { success: false, error: response.statusText };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runAllTests() {
    console.log('🚀 Local SEO Monitoring System - Complete Test Suite');
    console.log('=' .repeat(60));
    
    let totalTests = 0;
    let passedTests = 0;
    
    // Test the main Local SEO page
    console.log('\n📄 PAGE LOAD TESTS');
    console.log('-'.repeat(40));
    const pageResult = await testPageLoad('/local-seo', 'Local SEO Dashboard');
    totalTests++;
    if (pageResult.success) passedTests++;
    
    // Test all API endpoints
    console.log('\n🔌 API ENDPOINT TESTS');
    console.log('-'.repeat(40));
    
    const endpoints = [
        { path: '/api/local-seo/metrics', desc: 'Real-Time Metrics' },
        { path: '/api/local-seo/gmb/insights', desc: 'GMB Insights' },
        { path: '/api/local-seo/rankings/local', desc: 'Local Rankings' },
        { path: '/api/local-seo/competitors', desc: 'Competitor Tracking' },
        { path: '/api/local-seo/reviews/monitor', desc: 'Reviews Monitor' },
        { path: '/api/local-seo/citations/monitor', desc: 'Citations Monitor' },
        { path: '/api/local-seo/alerts', desc: 'Real-Time Alerts' }
    ];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint.path, endpoint.desc);
        totalTests++;
        if (result.success) passedTests++;
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Test summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('-'.repeat(40));
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${totalTests - passedTests}`);
    console.log(`   📈 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Local SEO Monitoring System is fully functional!');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }
    
    // Additional info
    console.log('\n📝 NOTES:');
    console.log('   - All endpoints return simulated real-time data');
    console.log('   - Data changes on each request to simulate live monitoring');
    console.log('   - Frontend auto-refreshes every 5-60 seconds depending on metric');
    console.log('   - Access the dashboard at: ' + BASE_URL + '/local-seo');
    
    return { totalTests, passedTests };
}

// Run the tests
runAllTests().then(results => {
    process.exit(results.passedTests === results.totalTests ? 0 : 1);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});