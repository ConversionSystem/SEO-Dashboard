// SEO Dashboard Application
class SEODashboard {
    constructor() {
        this.currentView = 'overview';
        this.data = {
            keywords: [],
            serp: [],
            backlinks: [],
            domains: [],
            searchVolume: []
        };
        this.charts = {};
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.accessToken) {
            console.log('No access token found, redirecting to login...');
            window.location.href = '/login';
            return;
        }
        
        // Verify token is still valid by making a test API call
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (!response.ok) {
                // Token might be expired, try to refresh
                const refreshed = await this.refreshAccessToken();
                if (!refreshed) {
                    console.log('Token validation failed, redirecting to login...');
                    localStorage.clear();
                    window.location.href = '/login';
                    return;
                }
            }
        } catch (error) {
            console.error('Auth verification error:', error);
            // Network error, let's continue but setup interceptors
        }
        
        // Setup axios interceptors for authentication
        this.setupAxiosInterceptors();
        
        this.render();
        this.attachEventListeners();
        this.loadDashboardData();
        this.loadUserInfo();
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Header -->
            <header class="border-b border-gray-700">
                <div class="container mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <i class="fas fa-chart-line text-3xl text-brand-teal"></i>
                            <div>
                                <h1 class="text-2xl font-bold">SEO Dashboard</h1>
                                <p class="text-sm text-gray-400">Conversion System - AI Marketing Intelligence</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <button id="refreshBtn" class="px-4 py-2 bg-brand-teal text-white rounded-lg hover:opacity-90 transition">
                                <i class="fas fa-sync-alt mr-2"></i>Refresh Data
                            </button>
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-400">
                                    <i class="fas fa-user-circle mr-1"></i>
                                    <span id="userName">${this.user?.name || 'User'}</span>
                                </span>
                                <button id="teamBtn" class="px-3 py-2 glass-card rounded-lg hover:bg-white hover:bg-opacity-10 transition" title="Team Management">
                                    <i class="fas fa-users"></i>
                                </button>
                                <button id="profileBtn" class="px-3 py-2 glass-card rounded-lg hover:bg-white hover:bg-opacity-10 transition" title="Profile">
                                    <i class="fas fa-user-cog"></i>
                                </button>
                                <button id="logoutBtn" class="px-3 py-2 glass-card rounded-lg hover:bg-white hover:bg-opacity-10 transition text-red-400" title="Logout">
                                    <i class="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Navigation Tabs -->
            <nav class="border-b border-gray-700">
                <div class="container mx-auto px-6">
                    <div class="flex space-x-8">
                        <button class="nav-tab active" data-view="overview">
                            <i class="fas fa-home mr-2"></i>Overview
                        </button>
                        <button class="nav-tab" data-view="keywords">
                            <i class="fas fa-key mr-2"></i>Keywords
                        </button>
                        <button class="nav-tab" data-view="serp">
                            <i class="fas fa-search mr-2"></i>SERP Analysis
                        </button>
                        <button class="nav-tab" data-view="backlinks">
                            <i class="fas fa-link mr-2"></i>Backlinks
                        </button>
                        <button class="nav-tab" data-view="competitors">
                            <i class="fas fa-users mr-2"></i>Competitors
                        </button>
                        <button class="nav-tab" data-view="tools">
                            <i class="fas fa-tools mr-2"></i>Advanced Tools
                        </button>
                        <button class="nav-tab" onclick="window.location.href='/local-seo'">
                            <i class="fas fa-map-marked-alt mr-2"></i>Local SEO
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Main Content Area -->
            <main class="container mx-auto px-6 py-8">
                <div id="contentArea">
                    <!-- Content will be loaded here -->
                </div>
            </main>

            <!-- Settings Modal -->
            <div id="settingsModal" class="fixed inset-0 z-50 hidden">
                <div class="absolute inset-0 bg-black bg-opacity-50" onclick="dashboard.closeSettings()"></div>
                <div class="absolute right-4 top-20 w-96 glass-card rounded-lg p-6">
                    <h3 class="text-xl font-bold mb-4">API Settings</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm mb-2">DataForSEO Login</label>
                            <input type="text" id="apiLogin" class="w-full px-3 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                        </div>
                        <div>
                            <label class="block text-sm mb-2">DataForSEO Password</label>
                            <input type="password" id="apiPassword" class="w-full px-3 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button onclick="dashboard.closeSettings()" class="px-4 py-2 glass-card rounded hover:bg-white hover:bg-opacity-10">Cancel</button>
                            <button onclick="dashboard.saveSettings()" class="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-90">Save</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .nav-tab {
                    padding: 1rem 0;
                    color: #9CA3AF;
                    border-bottom: 3px solid transparent;
                    transition: all 0.3s ease;
                }
                
                .nav-tab:hover {
                    color: #FFFFFF;
                }
                
                .nav-tab.active {
                    color: var(--orange-accent);
                    border-bottom-color: var(--orange-accent);
                }
                
                .metric-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    transition: all 0.3s ease;
                }
                
                .metric-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                }
            </style>
        `;
        
        this.loadView(this.currentView);
    }

    attachEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.loadView(e.target.dataset.view);
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadDashboardData();
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
            }
        });

        // Team button
        document.getElementById('teamBtn')?.addEventListener('click', () => {
            this.showTeamManagement();
        });

        // Profile button
        document.getElementById('profileBtn')?.addEventListener('click', () => {
            this.showUserProfile();
        });
    }

    loadView(view) {
        this.currentView = view;
        const contentArea = document.getElementById('contentArea');
        
        switch(view) {
            case 'overview':
                this.renderOverview(contentArea);
                break;
            case 'keywords':
                this.renderKeywords(contentArea);
                break;
            case 'serp':
                this.renderSERP(contentArea);
                break;
            case 'backlinks':
                this.renderBacklinks(contentArea);
                break;
            case 'competitors':
                this.renderCompetitors(contentArea);
                break;
            case 'tools':
                this.renderAdvancedTools(contentArea);
                break;
        }
    }

    renderOverview(container) {
        container.innerHTML = `
            <!-- Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="metric-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400">Total Keywords</span>
                        <i class="fas fa-key text-brand-teal"></i>
                    </div>
                    <div class="text-3xl font-bold">${this.data.keywords.length || 0}</div>
                    <div class="text-sm text-green-400 mt-1">
                        <i class="fas fa-arrow-up mr-1"></i>12.5%
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400">Avg. Position</span>
                        <i class="fas fa-chart-line text-brand-orange"></i>
                    </div>
                    <div class="text-3xl font-bold">4.2</div>
                    <div class="text-sm text-green-400 mt-1">
                        <i class="fas fa-arrow-up mr-1"></i>8.3%
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400">Total Backlinks</span>
                        <i class="fas fa-link text-brand-teal"></i>
                    </div>
                    <div class="text-3xl font-bold">${this.data.backlinks.length || 0}</div>
                    <div class="text-sm text-green-400 mt-1">
                        <i class="fas fa-arrow-up mr-1"></i>24.1%
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400">Domain Authority</span>
                        <i class="fas fa-crown text-brand-orange"></i>
                    </div>
                    <div class="text-3xl font-bold">67</div>
                    <div class="text-sm text-green-400 mt-1">
                        <i class="fas fa-arrow-up mr-1"></i>3.2%
                    </div>
                </div>
            </div>

            <!-- Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="glass-card rounded-lg p-6">
                    <h3 class="text-xl font-bold mb-4">Keyword Rankings Trend</h3>
                    <canvas id="rankingsChart"></canvas>
                </div>
                
                <div class="glass-card rounded-lg p-6">
                    <h3 class="text-xl font-bold mb-4">Search Volume Distribution</h3>
                    <canvas id="volumeChart"></canvas>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="mt-8 glass-card rounded-lg p-6">
                <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between py-2 border-b border-gray-700">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-arrow-up text-green-400"></i>
                            <div>
                                <div class="font-medium">Keyword "AI marketing tools" improved</div>
                                <div class="text-sm text-gray-400">Position 8 → 5</div>
                            </div>
                        </div>
                        <span class="text-sm text-gray-400">2 hours ago</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-gray-700">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-link text-brand-teal"></i>
                            <div>
                                <div class="font-medium">New backlink detected</div>
                                <div class="text-sm text-gray-400">From techcrunch.com (DA: 92)</div>
                            </div>
                        </div>
                        <span class="text-sm text-gray-400">5 hours ago</span>
                    </div>
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-trophy text-brand-orange"></i>
                            <div>
                                <div class="font-medium">Featured snippet achieved</div>
                                <div class="text-sm text-gray-400">For "conversion rate optimization"</div>
                            </div>
                        </div>
                        <span class="text-sm text-gray-400">1 day ago</span>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize charts after DOM is ready
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    renderKeywords(container) {
        container.innerHTML = `
            <div class="glass-card rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Keywords Research</h2>
                    <div class="flex space-x-2">
                        <input type="text" id="keywordInput" placeholder="Enter seed keyword..." 
                               class="px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                        <button onclick="dashboard.searchKeywords()" 
                                class="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-90">
                            <i class="fas fa-search mr-2"></i>Search
                        </button>
                    </div>
                </div>
                
                <div id="keywordsTable" class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-700">
                                <th class="text-left py-3 px-4">Keyword</th>
                                <th class="text-left py-3 px-4">Search Volume</th>
                                <th class="text-left py-3 px-4">Difficulty</th>
                                <th class="text-left py-3 px-4">CPC</th>
                                <th class="text-left py-3 px-4">Competition</th>
                                <th class="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="keywordsTableBody">
                            <tr>
                                <td colspan="6" class="text-center py-8 text-gray-400">
                                    Enter a seed keyword to discover related keywords
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderSERP(container) {
        container.innerHTML = `
            <div class="glass-card rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">SERP Analysis</h2>
                    <div class="flex space-x-2">
                        <input type="text" id="serpKeyword" placeholder="Enter keyword to analyze..." 
                               class="px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                        <button onclick="dashboard.analyzeSERP()" 
                                class="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-90">
                            <i class="fas fa-search mr-2"></i>Analyze
                        </button>
                    </div>
                </div>
                
                <div id="serpResults" class="space-y-4">
                    <div class="text-center py-8 text-gray-400">
                        Enter a keyword to see top 10 SERP results
                    </div>
                </div>
            </div>
        `;
    }

    renderBacklinks(container) {
        container.innerHTML = `
            <div class="glass-card rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Backlinks Analysis</h2>
                    <div class="flex space-x-2">
                        <input type="text" id="domainInput" placeholder="Enter domain..." 
                               class="px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                        <button onclick="dashboard.analyzeBacklinks()" 
                                class="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-90">
                            <i class="fas fa-link mr-2"></i>Analyze
                        </button>
                    </div>
                </div>
                
                <div id="backlinksTable" class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-700">
                                <th class="text-left py-3 px-4">Source URL</th>
                                <th class="text-left py-3 px-4">Domain Rating</th>
                                <th class="text-left py-3 px-4">Anchor Text</th>
                                <th class="text-left py-3 px-4">Type</th>
                                <th class="text-left py-3 px-4">First Seen</th>
                            </tr>
                        </thead>
                        <tbody id="backlinksTableBody">
                            <tr>
                                <td colspan="5" class="text-center py-8 text-gray-400">
                                    Enter a domain to analyze backlinks
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderAdvancedTools(container) {
        // Load advanced tools if not already loaded
        if (!window.advancedTools) {
            const script = document.createElement('script');
            script.src = '/static/advanced-tools.js';
            script.onload = () => {
                window.advancedTools = new AdvancedSEOTools(this);
                window.advancedTools.renderTools(container);
            };
            document.body.appendChild(script);
        } else {
            window.advancedTools.renderTools(container);
        }
    }

    renderCompetitors(container) {
        container.innerHTML = `
            <div class="glass-card rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-6">Competitors Analysis</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h3 class="font-bold mb-4 text-brand-teal">Top Competitors</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span>competitor1.com</span>
                                <span class="text-sm text-gray-400">DA: 75</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>competitor2.com</span>
                                <span class="text-sm text-gray-400">DA: 68</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>competitor3.com</span>
                                <span class="text-sm text-gray-400">DA: 62</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h3 class="font-bold mb-4 text-brand-orange">Keyword Gaps</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span>marketing automation</span>
                                <span class="text-sm text-green-400">High opportunity</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>AI sales tools</span>
                                <span class="text-sm text-yellow-400">Medium opportunity</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>conversion tracking</span>
                                <span class="text-sm text-green-400">High opportunity</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeCharts() {
        // Rankings Trend Chart
        const rankingsCtx = document.getElementById('rankingsChart');
        if (rankingsCtx) {
            this.charts.rankings = new Chart(rankingsCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Average Position',
                        data: [8.5, 7.2, 6.8, 5.5, 4.8, 4.2],
                        borderColor: '#E05E0F',
                        backgroundColor: 'rgba(224, 94, 15, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: '#FFFFFF' }
                        }
                    },
                    scales: {
                        y: {
                            reverse: true,
                            ticks: { color: '#9CA3AF' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#9CA3AF' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }

        // Volume Distribution Chart
        const volumeCtx = document.getElementById('volumeChart');
        if (volumeCtx) {
            this.charts.volume = new Chart(volumeCtx, {
                type: 'doughnut',
                data: {
                    labels: ['0-100', '100-1K', '1K-10K', '10K+'],
                    datasets: [{
                        data: [15, 35, 30, 20],
                        backgroundColor: [
                            'rgba(224, 94, 15, 0.8)',
                            'rgba(77, 154, 136, 0.8)',
                            'rgba(23, 43, 66, 0.8)',
                            'rgba(156, 163, 175, 0.8)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: '#FFFFFF' }
                        }
                    }
                }
            });
        }
    }

    async searchKeywords() {
        const input = document.getElementById('keywordInput');
        const keyword = input.value.trim();
        
        if (!keyword) {
            alert('Please enter a seed keyword');
            return;
        }

        const tbody = document.getElementById('keywordsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <i class="fas fa-spinner loading-spinner text-2xl"></i>
                    <div class="mt-2">Searching keywords...</div>
                </td>
            </tr>
        `;

        try {
            const response = await axios.post('/api/seo/keywords', { seed: keyword });
            const keywords = response.data.keywords || [];
            
            if (keywords.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-8 text-gray-400">
                            No keywords found. Try a different seed keyword.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = keywords.slice(0, 20).map(kw => `
                <tr class="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30">
                    <td class="py-3 px-4">${kw.keyword || 'N/A'}</td>
                    <td class="py-3 px-4">${kw.search_volume || 0}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs ${
                            kw.keyword_difficulty > 70 ? 'bg-red-500' : 
                            kw.keyword_difficulty > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        } bg-opacity-20">
                            ${kw.keyword_difficulty || 'N/A'}
                        </span>
                    </td>
                    <td class="py-3 px-4">$${kw.cpc || '0.00'}</td>
                    <td class="py-3 px-4">${kw.competition || 'N/A'}</td>
                    <td class="py-3 px-4">
                        <button class="text-brand-teal hover:text-brand-orange">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            this.data.keywords = keywords;
        } catch (error) {
            console.error('Error searching keywords:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-red-400">
                        Error: ${error.response?.data?.error || error.message}
                    </td>
                </tr>
            `;
        }
    }

    async analyzeSERP() {
        const input = document.getElementById('serpKeyword');
        const keyword = input.value.trim();
        
        if (!keyword) {
            alert('Please enter a keyword to analyze');
            return;
        }

        const resultsDiv = document.getElementById('serpResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Analyzing SERP...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/serp', { keyword });
            const results = response.data.results || [];
            
            if (results.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        No SERP results found for this keyword.
                    </div>
                `;
                return;
            }

            resultsDiv.innerHTML = `
                <div class="mb-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Total Results:</span>
                        <span class="font-bold">${response.data.total_results || 0}</span>
                    </div>
                </div>
                ${results.map((result, index) => `
                    <div class="p-4 bg-gray-800 bg-opacity-30 rounded-lg hover:bg-opacity-50 transition">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-1">
                                    <span class="text-2xl font-bold text-brand-orange">#${index + 1}</span>
                                    <a href="${result.url}" target="_blank" class="text-brand-teal hover:underline text-lg">
                                        ${result.title || 'No title'}
                                    </a>
                                </div>
                                <div class="text-sm text-green-400 mb-2">${result.url || ''}</div>
                                <p class="text-gray-300">${result.description || 'No description available'}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
            
            this.data.serp = results;
        } catch (error) {
            console.error('Error analyzing SERP:', error);
            resultsDiv.innerHTML = `
                <div class="text-center py-8 text-red-400">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    async analyzeBacklinks() {
        const input = document.getElementById('domainInput');
        const domain = input.value.trim();
        
        if (!domain) {
            alert('Please enter a domain to analyze');
            return;
        }

        const tbody = document.getElementById('backlinksTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8">
                    <i class="fas fa-spinner loading-spinner text-2xl"></i>
                    <div class="mt-2">Analyzing backlinks...</div>
                </td>
            </tr>
        `;

        try {
            const response = await axios.post('/api/seo/backlinks', { domain });
            const backlinks = response.data.backlinks || [];
            
            if (backlinks.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-8 text-gray-400">
                            No backlinks found for this domain.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = backlinks.slice(0, 20).map(link => `
                <tr class="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30">
                    <td class="py-3 px-4">
                        <a href="${link.url_from || '#'}" target="_blank" class="text-brand-teal hover:underline">
                            ${link.url_from ? new URL(link.url_from).hostname : 'N/A'}
                        </a>
                    </td>
                    <td class="py-3 px-4">${link.domain_from_rank || 'N/A'}</td>
                    <td class="py-3 px-4">${link.anchor || 'No anchor'}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs ${
                            link.dofollow ? 'bg-green-500' : 'bg-gray-500'
                        } bg-opacity-20">
                            ${link.dofollow ? 'DoFollow' : 'NoFollow'}
                        </span>
                    </td>
                    <td class="py-3 px-4">${link.first_seen ? new Date(link.first_seen).toLocaleDateString() : 'N/A'}</td>
                </tr>
            `).join('');
            
            this.data.backlinks = backlinks;
        } catch (error) {
            console.error('Error analyzing backlinks:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-red-400">
                        Error: ${error.response?.data?.error || error.message}
                    </td>
                </tr>
            `;
        }
    }

    async loadDashboardData() {
        // This would load initial dashboard data
        // For now, we'll use mock data for the overview
        console.log('Loading dashboard data...');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    saveSettings() {
        const login = document.getElementById('apiLogin').value;
        const password = document.getElementById('apiPassword').value;
        
        // In production, these would be saved securely
        // For now, just close the modal
        this.closeSettings();
        alert('Settings saved! (Note: In production, credentials should be configured server-side)');
    }

    // Authentication Methods
    setupAxiosInterceptors() {
        // Request interceptor to add token
        axios.interceptors.request.use(
            (config) => {
                if (this.accessToken) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for token refresh
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
                        return axios(originalRequest);
                    } else {
                        // Refresh failed, redirect to login
                        this.logout();
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
                this.accessToken = data.tokens.accessToken;
                this.refreshToken = data.tokens.refreshToken;
                return true;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }

        return false;
    }

    async loadUserInfo() {
        try {
            const response = await axios.get('/api/auth/me');
            if (response.data) {
                this.user = response.data.user;
                this.team = response.data.team;
                localStorage.setItem('user', JSON.stringify(this.user));
                
                // Update UI with user info
                const userNameEl = document.getElementById('userName');
                if (userNameEl) {
                    userNameEl.textContent = this.user.name;
                }
                
                // Show team badge if user has admin/manager role
                if (['admin', 'manager'].includes(this.user.role)) {
                    const teamBtn = document.getElementById('teamBtn');
                    if (teamBtn) {
                        teamBtn.innerHTML = `<i class="fas fa-users"></i> <span class="text-xs">${this.user.role}</span>`;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    }

    logout() {
        // Call logout API
        if (this.refreshToken) {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            }).catch(console.error);
        }

        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login';
    }

    async showTeamManagement() {
        // Load team members
        try {
            const response = await axios.get('/api/auth/team/members');
            const members = response.data.members;

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
            modal.innerHTML = `
                <div class="absolute inset-0 bg-black bg-opacity-50" onclick="this.parentElement.remove()"></div>
                <div class="relative w-full max-w-4xl glass-card rounded-lg p-6 max-h-[80vh] overflow-y-auto">
                    <h2 class="text-2xl font-bold mb-4">Team Management</h2>
                    
                    ${this.user.role === 'admin' || this.user.role === 'manager' ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3">Invite Team Member</h3>
                        <div class="flex gap-2">
                            <input type="email" id="inviteEmail" placeholder="email@example.com" 
                                class="flex-1 px-3 py-2 bg-gray-800 rounded border border-gray-600">
                            <select id="inviteRole" class="px-3 py-2 bg-gray-800 rounded border border-gray-600">
                                <option value="member">Member</option>
                                <option value="manager">Manager</option>
                                ${this.user.role === 'admin' ? '<option value="admin">Admin</option>' : ''}
                            </select>
                            <button onclick="dashboard.inviteTeamMember()" 
                                class="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-90">
                                <i class="fas fa-paper-plane mr-2"></i>Invite
                            </button>
                        </div>
                    </div>
                    ` : ''}
                    
                    <h3 class="text-lg font-semibold mb-3">Team Members</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-600">
                                    <th class="text-left py-2">Name</th>
                                    <th class="text-left py-2">Email</th>
                                    <th class="text-left py-2">Role</th>
                                    <th class="text-left py-2">Last Login</th>
                                    <th class="text-left py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${members.map(member => `
                                    <tr class="border-b border-gray-700">
                                        <td class="py-3">${member.name}</td>
                                        <td class="py-3">${member.email}</td>
                                        <td class="py-3">
                                            <span class="px-2 py-1 text-xs rounded ${
                                                member.role === 'admin' ? 'bg-red-900 text-red-300' :
                                                member.role === 'manager' ? 'bg-yellow-900 text-yellow-300' :
                                                'bg-gray-700 text-gray-300'
                                            }">
                                                ${member.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td class="py-3">${member.last_login ? new Date(member.last_login).toLocaleDateString() : 'Never'}</td>
                                        <td class="py-3">
                                            ${this.user.role === 'admin' && member.id !== this.user.id ? `
                                                <button onclick="dashboard.changeUserRole(${member.id}, '${member.role}')" 
                                                    class="text-brand-teal hover:underline">
                                                    Change Role
                                                </button>
                                            ` : '-'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <button onclick="this.closest('.fixed').remove()" 
                        class="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
                        Close
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        } catch (error) {
            console.error('Failed to load team members:', error);
            alert('Failed to load team members');
        }
    }

    async inviteTeamMember() {
        const email = document.getElementById('inviteEmail').value;
        const role = document.getElementById('inviteRole').value;

        if (!email) {
            alert('Please enter an email address');
            return;
        }

        try {
            const response = await axios.post('/api/auth/team/invite', { email, role });
            if (response.data.success) {
                alert(`Invitation sent to ${email}`);
                document.getElementById('inviteEmail').value = '';
                // In production, the invitation link would be sent via email
                console.log('Invitation token:', response.data.invitationToken);
            }
        } catch (error) {
            console.error('Failed to send invitation:', error);
            alert('Failed to send invitation');
        }
    }

    showUserProfile() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black bg-opacity-50" onclick="this.parentElement.remove()"></div>
            <div class="relative w-full max-w-md glass-card rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-4">User Profile</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Name</label>
                        <p class="text-lg">${this.user.name}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Email</label>
                        <p class="text-lg">${this.user.email}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Role</label>
                        <p class="text-lg capitalize">${this.user.role}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Team</label>
                        <p class="text-lg">${this.team?.name || 'No team'}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Member Since</label>
                        <p class="text-lg">${new Date(this.user.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <button onclick="this.closest('.fixed').remove()" 
                    class="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 w-full">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new SEODashboard();
});