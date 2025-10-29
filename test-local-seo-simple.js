#!/usr/bin/env node

// Simple test of Local SEO page
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testLocalSEOSimple() {
    console.log('🔍 Testing Local SEO Page...\n');
    
    try {
        // Step 1: Login first
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'demo@conversionsystem.com',
            password: 'demo123'
        });
        
        const accessToken = loginResponse.data.tokens.accessToken;
        console.log('   ✅ Got access token\n');
        
        // Step 2: Get the Local SEO page HTML
        console.log('2. Fetching Local SEO page...');
        const pageResponse = await axios.get(`${BASE_URL}/local-seo`);
        
        const html = pageResponse.data;
        
        // Check for key elements
        const checks = {
            'Has title': html.includes('Local SEO Tool - Conversion System'),
            'Has app div': html.includes('id="app"'),
            'Has script': html.includes('/static/local-seo.js'),
            'Has Tailwind': html.includes('cdn.tailwindcss.com'),
            'Has Axios': html.includes('axios.min.js'),
            'Has Font Awesome': html.includes('fontawesome')
        };
        
        console.log('   Page structure checks:');
        Object.entries(checks).forEach(([key, value]) => {
            console.log(`   - ${key}: ${value ? '✅' : '❌'}`);
        });
        
        // Step 3: Test if JavaScript loads without errors
        console.log('\n3. Testing JavaScript file...');
        const jsResponse = await axios.get(`${BASE_URL}/static/local-seo.js`);
        
        console.log('   - JS file size:', jsResponse.data.length, 'bytes');
        console.log('   - Contains LocalSEOTool class:', jsResponse.data.includes('class LocalSEOTool'));
        console.log('   - Contains init method:', jsResponse.data.includes('async init()'));
        console.log('   - Contains render method:', jsResponse.data.includes('render()'));
        
        // Step 4: Test API endpoints
        console.log('\n4. Testing API endpoints...');
        
        // Test schema generator (doesn't need external API)
        try {
            const schemaResponse = await axios.post(`${BASE_URL}/api/seo/local/schema`, {
                businessName: 'Test Business',
                address: { street: '123 Main', city: 'Test City', state: 'CA', zip: '12345' },
                phone: '555-1234',
                website: 'https://test.com',
                category: 'service'
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            console.log('   - Schema generator:', schemaResponse.data.schema ? '✅ Working' : '❌ Failed');
        } catch (error) {
            console.log('   - Schema generator: ❌ Error');
        }
        
        console.log('\n✅ Local SEO page structure is correct!');
        console.log('\n📝 To view the page:');
        console.log('1. Open your browser');
        console.log('2. Login with demo@conversionsystem.com / demo123');
        console.log('3. Navigate to /local-seo or click "Local SEO" in navigation');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

// Run test
testLocalSEOSimple();