// Test DataForSEO API directly
const axios = require('axios');

const auth = Buffer.from('support@conversionsystem.com:79bc199b4610155b').toString('base64');

async function testAPI() {
    console.log('Testing DataForSEO API with your credentials...\n');
    
    // Test 1: Get locations
    try {
        console.log('1. Testing locations endpoint...');
        const locationsResponse = await axios.get('https://api.dataforseo.com/v3/serp/google/locations', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Locations endpoint working');
        console.log(`Found ${locationsResponse.data.tasks[0].result.length} locations\n`);
    } catch (error) {
        console.log('❌ Locations endpoint failed:', error.response?.data?.status_message || error.message);
    }
    
    // Test 2: Get languages
    try {
        console.log('2. Testing languages endpoint...');
        const languagesResponse = await axios.get('https://api.dataforseo.com/v3/serp/google/languages', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Languages endpoint working');
        console.log(`Found ${languagesResponse.data.tasks[0].result.length} languages\n`);
    } catch (error) {
        console.log('❌ Languages endpoint failed:', error.response?.data?.status_message || error.message);
    }
    
    // Test 3: Post a SERP task
    try {
        console.log('3. Testing SERP task post...');
        const serpResponse = await axios.post('https://api.dataforseo.com/v3/serp/google/organic/task_post', 
            [{
                keyword: 'marketing automation tools',
                location_code: 2840, // United States
                language_code: 'en'
            }],
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (serpResponse.data.tasks && serpResponse.data.tasks[0]) {
            const task = serpResponse.data.tasks[0];
            console.log('✅ SERP task posted successfully');
            console.log('Task ID:', task.id);
            console.log('Status:', task.status_message);
            console.log('Cost:', task.cost);
        }
    } catch (error) {
        console.log('❌ SERP task failed:', error.response?.data?.status_message || error.message);
        if (error.response?.data) {
            console.log('Full error:', JSON.stringify(error.response.data, null, 2));
        }
    }
    
    // Test 4: Get account info
    try {
        console.log('\n4. Getting account info...');
        const userResponse = await axios.get('https://api.dataforseo.com/v3/appendix/user_data', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (userResponse.data.tasks && userResponse.data.tasks[0]) {
            const userData = userResponse.data.tasks[0].result[0];
            console.log('✅ Account info retrieved');
            console.log('Login:', userData.login);
            console.log('Balance:', userData.money?.balance || 0);
            console.log('Total tasks:', userData.rates?.total_tasks_count || 0);
        }
    } catch (error) {
        console.log('❌ Account info failed:', error.response?.data?.status_message || error.message);
    }
}

testAPI().catch(console.error);