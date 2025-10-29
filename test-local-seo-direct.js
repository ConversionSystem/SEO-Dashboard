#!/usr/bin/env node

// Direct test of Local SEO page rendering
import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3000';

async function testLocalSEOPage() {
    console.log('🔍 Testing Local SEO Page Rendering...\n');
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            console.log('Browser Console:', msg.text());
        });
        
        page.on('pageerror', error => {
            console.error('Page Error:', error.message);
        });
        
        // Step 1: Navigate to login page
        console.log('1. Navigating to login page...');
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
        
        // Step 2: Login
        console.log('2. Logging in...');
        await page.waitForSelector('#login-email', { visible: true });
        await page.type('#login-email', 'demo@conversionsystem.com');
        await page.type('#login-password', 'demo123');
        await page.click('button[type="submit"]');
        
        // Wait for redirect to dashboard
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('   ✅ Logged in successfully');
        
        // Step 3: Navigate to Local SEO page
        console.log('\n3. Navigating to Local SEO page...');
        await page.goto(`${BASE_URL}/local-seo`, { waitUntil: 'networkidle0' });
        
        // Step 4: Check if page rendered
        console.log('4. Checking page content...');
        
        // Wait a bit for JavaScript to execute
        await page.waitForTimeout(2000);
        
        // Get page content
        const pageContent = await page.content();
        const hasHeader = pageContent.includes('Local SEO Tool');
        const hasForm = pageContent.includes('businessName');
        const hasAnalyzeButton = pageContent.includes('Analyze Local SEO Performance');
        
        console.log('   - Has header:', hasHeader);
        console.log('   - Has form:', hasForm);
        console.log('   - Has analyze button:', hasAnalyzeButton);
        
        // Check if app div has content
        const appContent = await page.evaluate(() => {
            const app = document.getElementById('app');
            return {
                exists: !!app,
                hasContent: app ? app.innerHTML.length > 100 : false,
                contentLength: app ? app.innerHTML.length : 0
            };
        });
        
        console.log('   - App div exists:', appContent.exists);
        console.log('   - App has content:', appContent.hasContent);
        console.log('   - Content length:', appContent.contentLength);
        
        // Get localStorage token
        const token = await page.evaluate(() => localStorage.getItem('accessToken'));
        console.log('   - Has auth token:', !!token);
        
        if (appContent.exists && appContent.hasContent) {
            console.log('\n✅ Local SEO page rendered successfully!');
        } else {
            console.log('\n❌ Local SEO page failed to render');
            
            // Get any errors
            const errors = await page.evaluate(() => {
                return window.errors || [];
            });
            
            if (errors.length > 0) {
                console.log('Page errors:', errors);
            }
        }
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

// Run test
testLocalSEOPage().catch(console.error);