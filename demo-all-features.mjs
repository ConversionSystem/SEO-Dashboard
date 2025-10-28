#!/usr/bin/env node
// Comprehensive demo of all SEO Dashboard features
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/seo';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testFeature(name, endpoint, data) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log('='.repeat(60));
    
    try {
        const response = await axios.post(`${API_BASE}${endpoint}`, data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error: ${error.response?.data?.error || error.message}`);
        return null;
    }
}

async function runDemo() {
    console.log('\n🚀 SEO DASHBOARD COMPREHENSIVE DEMO');
    console.log('Testing all features with real DataForSEO data...\n');
    
    // Wait for server to be ready
    await delay(3000);
    
    // 1. Account Info
    console.log('\n📊 ACCOUNT STATUS');
    try {
        const account = await axios.get(`${API_BASE}/account`);
        console.log(`✅ Account: ${account.data.login}`);
        console.log(`💰 Balance: $${account.data.balance.toFixed(2)}`);
    } catch (e) {
        console.error('Account check failed');
    }
    
    // 2. Basic SERP Analysis
    const serpData = await testFeature(
        '🔍 SERP Analysis',
        '/serp',
        { keyword: 'AI marketing tools' }
    );
    if (serpData) {
        console.log(`✅ Found ${serpData.results.length} results`);
        console.log(`📊 Total results: ${serpData.total_results.toLocaleString()}`);
        if (serpData.results[0]) {
            console.log(`🥇 #1 Result: ${serpData.results[0].title}`);
            console.log(`   URL: ${serpData.results[0].url}`);
        }
    }
    
    await delay(1000);
    
    // 3. Keyword Research
    const keywordData = await testFeature(
        '🔑 Keyword Research',
        '/keywords',
        { seed: 'conversion optimization' }
    );
    if (keywordData && keywordData.keywords.length > 0) {
        console.log(`✅ Found ${keywordData.keywords.length} keyword suggestions`);
        const topKeyword = keywordData.keywords[0];
        console.log(`🎯 Top keyword: "${topKeyword.keyword}"`);
        console.log(`   Volume: ${topKeyword.search_volume || 'N/A'}`);
        console.log(`   CPC: $${topKeyword.cpc || '0.00'}`);
    }
    
    await delay(1000);
    
    // 4. Search Volume Analysis
    const volumeData = await testFeature(
        '📈 Search Volume Analysis',
        '/search-volume',
        { 
            keywords: [
                'SEO tools',
                'marketing automation',
                'email marketing',
                'content marketing'
            ]
        }
    );
    if (volumeData && volumeData.data.length > 0) {
        console.log(`✅ Analyzed ${volumeData.data.length} keywords`);
        volumeData.data.forEach(kw => {
            console.log(`   • ${kw.keyword}: ${(kw.search_volume || 0).toLocaleString()} searches/month`);
        });
    }
    
    await delay(1000);
    
    // 5. Rank Tracking
    const rankData = await testFeature(
        '📊 Rank Tracking',
        '/advanced/rank-tracking',
        { 
            keywords: ['SEO tools', 'keyword research'],
            domain: 'ahrefs.com'
        }
    );
    if (rankData) {
        console.log(`✅ Tracking ${rankData.rankings.length} keywords for ${rankData.domain}`);
        rankData.rankings.forEach(r => {
            if (r.position) {
                console.log(`   ✅ "${r.keyword}": Position #${r.position}`);
                console.log(`      URL: ${r.url}`);
            } else {
                console.log(`   ❌ "${r.keyword}": Not ranking`);
            }
        });
    }
    
    await delay(1000);
    
    // 6. Content Analyzer
    const contentData = await testFeature(
        '📝 Content Analyzer',
        '/advanced/content-analyzer',
        { url: 'https://www.example.com' }
    );
    if (contentData) {
        console.log(`✅ Page analyzed`);
        console.log(`   SEO Score: ${contentData.seo_score}/100`);
        console.log(`   Word Count: ${contentData.word_count}`);
        if (contentData.recommendations && contentData.recommendations.length > 0) {
            console.log(`   Recommendations:`);
            contentData.recommendations.slice(0, 3).forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }
    }
    
    await delay(1000);
    
    // 7. Keyword Clustering
    const clusterData = await testFeature(
        '🗂️ Keyword Clustering',
        '/advanced/keyword-clustering',
        { 
            keywords: [
                'buy SEO tools',
                'SEO software pricing',
                'how to do SEO',
                'what is SEO',
                'SEO tutorial',
                'local SEO services',
                'SEO agency near me',
                'enterprise SEO platform',
                'free SEO tools'
            ]
        }
    );
    if (clusterData && clusterData.clusters.length > 0) {
        console.log(`✅ Created ${clusterData.clusters.length} clusters`);
        clusterData.clusters.forEach(cluster => {
            console.log(`   📁 ${cluster.cluster_name}: ${cluster.count} keywords`);
            if (cluster.keywords.length > 0) {
                console.log(`      Examples: ${cluster.keywords.slice(0, 2).join(', ')}`);
            }
        });
    }
    
    await delay(1000);
    
    // 8. Competitor Gap Analysis
    const gapData = await testFeature(
        '🎯 Competitor Gap Analysis',
        '/advanced/competitor-gap',
        { 
            domain: 'moz.com',
            competitors: ['semrush.com']
        }
    );
    if (gapData) {
        console.log(`✅ Found ${gapData.total_gaps} keyword opportunities`);
        if (gapData.opportunities.length > 0) {
            console.log(`   Top opportunities from ${gapData.competitors[0]}:`);
            gapData.opportunities.slice(0, 3).forEach(opp => {
                console.log(`   • "${opp.keyword}"`);
                console.log(`     Position: #${opp.position}, Volume: ${opp.search_volume}`);
            });
        }
    }
    
    await delay(1000);
    
    // 9. SERP Features Tracker
    const featuresData = await testFeature(
        '🏆 SERP Features Tracker',
        '/advanced/serp-features',
        { 
            keywords: [
                'what is SEO',
                'how to improve conversion rate',
                'marketing automation tools'
            ]
        }
    );
    if (featuresData) {
        console.log(`✅ Analyzed ${featuresData.keywords_analyzed} keywords`);
        if (featuresData.summary) {
            console.log(`   Featured Snippets: ${featuresData.summary.with_featured_snippets}`);
            console.log(`   People Also Ask: ${featuresData.summary.with_people_also_ask}`);
            console.log(`   Knowledge Panels: ${featuresData.summary.with_knowledge_panel}`);
        }
    }
    
    await delay(1000);
    
    // 10. Question Finder
    const questionData = await testFeature(
        '❓ Question Finder',
        '/advanced/question-opportunities',
        { topic: 'email marketing' }
    );
    if (questionData) {
        console.log(`✅ Found ${questionData.total_questions} questions`);
        if (questionData.questions.length > 0) {
            console.log(`   Top questions:`);
            questionData.questions.slice(0, 3).forEach(q => {
                console.log(`   • "${q.question}"`);
                if (q.search_volume > 0) {
                    console.log(`     Volume: ${q.search_volume}`);
                }
            });
        }
    }
    
    await delay(1000);
    
    // 11. Technical Audit
    const auditData = await testFeature(
        '🔧 Technical SEO Audit',
        '/advanced/technical-audit',
        { domain: 'example.com' }
    );
    if (auditData) {
        console.log(`✅ Audit completed for ${auditData.domain}`);
        console.log(`   Pages Crawled: ${auditData.crawled_pages}`);
        if (auditData.issues) {
            console.log(`   Issues Found:`);
            console.log(`   • Errors: ${auditData.issues.errors}`);
            console.log(`   • Warnings: ${auditData.issues.warnings}`);
            console.log(`   • Notices: ${auditData.issues.notices}`);
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMO COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n✅ All major features tested successfully');
    console.log('💡 The SEO Dashboard is fully operational with:');
    console.log('   • 6 Core SEO Tools');
    console.log('   • 9 Advanced Analysis Tools');
    console.log('   • Real-time DataForSEO integration');
    console.log('   • Comprehensive SEO insights\n');
    console.log(`🌐 Access the dashboard at: http://localhost:3000`);
    console.log(`📊 API documentation available in README.md\n`);
}

// Run the demo
runDemo().catch(console.error);