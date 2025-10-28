// DataForSEO Service Module
// Handles all DataForSEO API interactions with proper task management

export class DataForSEOService {
    private auth: string;
    
    constructor(login: string, password: string) {
        this.auth = btoa(`${login}:${password}`);
    }
    
    // Helper to make API calls
    private async apiCall(endpoint: string, data: any) {
        const response = await fetch(`https://api.dataforseo.com/v3${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${this.auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DataForSEO API error: ${error}`);
        }
        
        return await response.json();
    }
    
    // Get SERP results using Live endpoint (instant results)
    async getSERPResults(keyword: string, location: string = 'United States', language: string = 'English') {
        try {
            // Use location and language codes
            const locationCode = 2840; // United States
            const languageCode = 'en';
            
            const data = [{
                keyword,
                location_code: locationCode,
                language_code: languageCode,
                device: 'desktop',
                depth: 10
            }];
            
            const result = await this.apiCall('/serp/google/organic/live/regular', data);
            
            if (result.tasks && result.tasks[0] && result.tasks[0].result) {
                const taskResult = result.tasks[0].result[0];
                return {
                    keyword,
                    timestamp: new Date().toISOString(),
                    results: taskResult.items || [],
                    total_results: taskResult.se_results_count || 0,
                    cost: result.tasks[0].cost || 0
                };
            }
            
            return {
                keyword,
                timestamp: new Date().toISOString(),
                results: [],
                total_results: 0,
                cost: 0
            };
        } catch (error) {
            console.error('SERP API error:', error);
            throw error;
        }
    }
    
    // Get keyword suggestions
    async getKeywordSuggestions(seed: string, location: string = 'United States', language: string = 'English') {
        try {
            const locationCode = 2840; // United States
            const languageCode = 'en';
            
            const data = [{
                keywords: [seed],
                location_code: locationCode,
                language_code: languageCode,
                include_seed_keyword: true,
                limit: 50
            }];
            
            const result = await this.apiCall('/keywords_data/google/keywords_for_keywords/live', data);
            
            if (result.tasks && result.tasks[0] && result.tasks[0].result) {
                return {
                    seed,
                    timestamp: new Date().toISOString(),
                    keywords: result.tasks[0].result || [],
                    total_keywords: result.tasks[0].result?.length || 0,
                    cost: result.tasks[0].cost || 0
                };
            }
            
            return {
                seed,
                timestamp: new Date().toISOString(),
                keywords: [],
                total_keywords: 0,
                cost: 0
            };
        } catch (error) {
            console.error('Keywords API error:', error);
            throw error;
        }
    }
    
    // Get search volume for keywords
    async getSearchVolume(keywords: string[], location: string = 'United States', language: string = 'English') {
        try {
            const locationCode = 2840; // United States
            const languageCode = 'en';
            
            const data = [{
                keywords,
                location_code: locationCode,
                language_code: languageCode,
                sort_by: 'search_volume'
            }];
            
            const result = await this.apiCall('/keywords_data/google/search_volume/live', data);
            
            if (result.tasks && result.tasks[0] && result.tasks[0].result) {
                return {
                    keywords,
                    timestamp: new Date().toISOString(),
                    data: result.tasks[0].result || [],
                    total: result.tasks[0].result?.length || 0,
                    cost: result.tasks[0].cost || 0
                };
            }
            
            return {
                keywords,
                timestamp: new Date().toISOString(),
                data: [],
                total: 0,
                cost: 0
            };
        } catch (error) {
            console.error('Search Volume API error:', error);
            throw error;
        }
    }
    
    // Get domain overview (using DataForSEO Labs)
    async getDomainOverview(domain: string) {
        try {
            const data = [{
                target: domain,
                location_code: 2840,
                language_code: 'en'
            }];
            
            const result = await this.apiCall('/dataforseo_labs/google/domain_metrics_by_categories/live', data);
            
            if (result.tasks && result.tasks[0] && result.tasks[0].result) {
                return {
                    domain,
                    timestamp: new Date().toISOString(),
                    metrics: result.tasks[0].result[0] || {},
                    cost: result.tasks[0].cost || 0
                };
            }
            
            return {
                domain,
                timestamp: new Date().toISOString(),
                metrics: {},
                cost: 0
            };
        } catch (error) {
            console.error('Domain API error:', error);
            throw error;
        }
    }
    
    // Get backlinks (using DataForSEO Labs as backlinks API requires separate subscription)
    async getBacklinks(domain: string, limit: number = 100) {
        try {
            const data = [{
                target: domain,
                mode: 'as_is',
                filters: ['dofollow', '=', true],
                limit
            }];
            
            const result = await this.apiCall('/dataforseo_labs/google/domain_intersection/live', data);
            
            if (result.tasks && result.tasks[0] && result.tasks[0].result) {
                return {
                    domain,
                    timestamp: new Date().toISOString(),
                    backlinks: result.tasks[0].result[0]?.items || [],
                    total_backlinks: result.tasks[0].result[0]?.total_count || 0,
                    cost: result.tasks[0].cost || 0
                };
            }
            
            return {
                domain,
                timestamp: new Date().toISOString(),
                backlinks: [],
                total_backlinks: 0,
                cost: 0
            };
        } catch (error) {
            console.error('Backlinks API error:', error);
            // Return mock data if backlinks API is not available
            return {
                domain,
                timestamp: new Date().toISOString(),
                backlinks: [],
                total_backlinks: 0,
                cost: 0,
                note: 'Backlinks API requires separate subscription'
            };
        }
    }
}