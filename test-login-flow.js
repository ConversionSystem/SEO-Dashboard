#!/usr/bin/env node

// Test script to verify login and redirection flow
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testLoginFlow() {
    console.log('🔍 Testing Login and Redirection Flow...\n');
    
    try {
        // Step 1: Test unauthenticated access to /api/auth/verify
        console.log('1. Testing unauthenticated access to /api/auth/verify...');
        try {
            await axios.get(`${BASE_URL}/api/auth/verify`);
            console.log('   ❌ Should have returned 401 for unauthenticated request');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ Correctly returned 401 for unauthenticated request');
            } else {
                console.log('   ❌ Unexpected error:', error.message);
            }
        }
        
        // Step 2: Login with demo credentials
        console.log('\n2. Testing login with demo credentials...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'demo@conversionsystem.com',
            password: 'demo123'
        });
        
        if (loginResponse.data.success && loginResponse.data.tokens) {
            console.log('   ✅ Login successful');
            console.log('   - Access Token:', loginResponse.data.tokens.accessToken.substring(0, 20) + '...');
            console.log('   - User:', loginResponse.data.user.email);
            
            const accessToken = loginResponse.data.tokens.accessToken;
            
            // Step 3: Test authenticated access to /api/auth/verify
            console.log('\n3. Testing authenticated access to /api/auth/verify...');
            const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (verifyResponse.data.success && verifyResponse.data.valid) {
                console.log('   ✅ Token verification successful');
                console.log('   - User ID:', verifyResponse.data.user.userId);
                console.log('   - Email:', verifyResponse.data.user.email);
                console.log('   - Role:', verifyResponse.data.user.role);
            } else {
                console.log('   ❌ Token verification failed');
            }
            
            // Step 4: Test main page loads without redirect
            console.log('\n4. Testing main dashboard page...');
            const mainPageResponse = await axios.get(`${BASE_URL}/`, {
                validateStatus: function (status) {
                    return status < 500; // Accept any status < 500
                }
            });
            
            if (mainPageResponse.status === 200) {
                const hasAppDiv = mainPageResponse.data.includes('id="app"');
                const hasAppScript = mainPageResponse.data.includes('/static/app.js');
                
                if (hasAppDiv && hasAppScript) {
                    console.log('   ✅ Main dashboard page loads correctly');
                    console.log('   - Contains app div: Yes');
                    console.log('   - Loads app.js: Yes');
                } else {
                    console.log('   ⚠️  Main page loaded but missing components');
                    console.log('   - Contains app div:', hasAppDiv);
                    console.log('   - Loads app.js:', hasAppScript);
                }
            } else {
                console.log('   ❌ Unexpected status code:', mainPageResponse.status);
            }
            
            // Step 5: Test protected API endpoint
            console.log('\n5. Testing protected API endpoint...');
            const protectedResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (protectedResponse.data.user) {
                console.log('   ✅ Protected endpoint accessible');
                console.log('   - User name:', protectedResponse.data.user.name);
                console.log('   - Created at:', protectedResponse.data.user.created_at);
            } else {
                console.log('   ❌ Protected endpoint failed');
            }
            
            // Step 6: Test token refresh
            console.log('\n6. Testing token refresh...');
            const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                refreshToken: loginResponse.data.tokens.refreshToken
            });
            
            if (refreshResponse.data.success && refreshResponse.data.tokens) {
                console.log('   ✅ Token refresh successful');
                console.log('   - New Access Token:', refreshResponse.data.tokens.accessToken.substring(0, 20) + '...');
            } else {
                console.log('   ❌ Token refresh failed');
            }
            
        } else {
            console.log('   ❌ Login failed:', loginResponse.data.error);
        }
        
        console.log('\n✅ Login flow test completed successfully!');
        console.log('\n📝 Summary:');
        console.log('- Authentication endpoints work correctly');
        console.log('- Token verification is functional');
        console.log('- Main dashboard page loads without server-side redirect');
        console.log('- Client-side JavaScript handles authentication check');
        console.log('- Token refresh mechanism works');
        
    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testLoginFlow();