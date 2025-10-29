// Enhanced SEO Dashboard Application with Sidebar Navigation
class EnhancedSEODashboard {
    constructor() {
        this.currentView = 'dashboard';
        this.sidebarCollapsed = false;
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
        
        // Bind methods to window for onclick handlers
        window.toggleSidebar = this.toggleSidebar.bind(this);
        window.loadDashboard = this.loadDashboard.bind(this);
        window.loadLocalSEO = this.loadLocalSEO.bind(this);
        window.loadKeywordResearch = this.loadKeywordResearch.bind(this);
        window.loadSERPAnalysis = this.loadSERPAnalysis.bind(this);
        window.loadCompetitors = this.loadCompetitors.bind(this);
        window.loadBacklinks = this.loadBacklinks.bind(this);
        window.loadPerformance = this.loadPerformance.bind(this);
        window.loadAnalytics = this.loadAnalytics.bind(this);
        window.loadSettings = this.loadSettings.bind(this);
        window.handleLogout = this.handleLogout.bind(this);
        window.refreshCurrentView = this.refreshCurrentView.bind(this);
        
        this.init();
    }

    async init() {
        // Update user info in sidebar
        this.updateUserInfo();
        
        // Check authentication
        if (!this.accessToken) {
            console.log('No access token found, redirecting to login...');
            window.location.href = '/login';
            return;
        }
        
        // Setup axios interceptors
        this.setupAxiosInterceptors();
        
        // Load API balance
        this.loadAPIBalance();
        
        // Initialize dashboard view
        this.loadDashboard();
        
        // Setup responsive handler
        this.setupResponsiveHandler();
    }

    setupResponsiveHandler() {
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.querySelector('.fa-bars').parentElement;
                
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });
    }

    updateUserInfo() {
        if (this.user) {
            document.getElementById('userName').textContent = this.user.name || this.user.email || 'User';
            document.getElementById('userRole').textContent = this.user.role || 'Member';
        }
    }

    async loadAPIBalance() {
        try {
            const response = await fetch('/api/seo/account', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('apiBalance').textContent = `Balance: $${(data.balance || 0).toFixed(2)}`;
            }
        } catch (error) {
            console.error('Error loading API balance:', error);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (window.innerWidth <= 768) {
            // Mobile: toggle slide
            sidebar.classList.toggle('mobile-open');
        } else {
            // Desktop: toggle collapse
            this.sidebarCollapsed = !this.sidebarCollapsed;
            if (this.sidebarCollapsed) {
                sidebar.classList.add('sidebar-collapsed');
                mainContent.classList.add('main-content-expanded');
            } else {
                sidebar.classList.remove('sidebar-collapsed');
                mainContent.classList.remove('main-content-expanded');
            }
        }
    }

    setActiveNavItem(href) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        const activeItem = document.querySelector(`a[href="${href}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    updatePageTitle(title) {
        document.getElementById('pageTitle').textContent = title;
        document.title = `${title} - SEO Dashboard`;
    }

    loadDashboard(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#dashboard');
        this.updatePageTitle('Dashboard Overview');
        this.currentView = 'dashboard';
        this.renderDashboard();
    }

    loadLocalSEO(event) {
        if (event) event.preventDefault();
        // Redirect to dedicated Local SEO page
        window.location.href = '/local-seo';
    }

    loadKeywordResearch(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#keywords');
        this.updatePageTitle('Keyword Research');
        this.currentView = 'keywords';
        this.renderKeywordResearch();
    }

    loadSERPAnalysis(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#serp');
        this.updatePageTitle('SERP Analysis');
        this.currentView = 'serp';
        this.renderSERPAnalysis();
    }

    loadCompetitors(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#competitors');
        this.updatePageTitle('Competitor Analysis');
        this.currentView = 'competitors';
        this.renderCompetitorAnalysis();
    }

    loadBacklinks(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#backlinks');
        this.updatePageTitle('Backlink Monitor');
        this.currentView = 'backlinks';
        this.renderBacklinks();
    }

    loadPerformance(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#performance');
        this.updatePageTitle('Performance Reports');
        this.currentView = 'performance';
        this.renderPerformance();
    }

    loadAnalytics(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#analytics');
        this.updatePageTitle('Analytics');
        this.currentView = 'analytics';
        this.renderAnalytics();
    }

    loadSettings(event) {
        if (event) event.preventDefault();
        this.setActiveNavItem('#settings');
        this.updatePageTitle('Settings');
        this.currentView = 'settings';
        this.renderSettings();
    }

    handleLogout(event) {
        if (event) event.preventDefault();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    refreshCurrentView() {
        const refreshIcon = document.querySelector('.fa-sync-alt');
        if (refreshIcon) {
            refreshIcon.classList.add('loading-spinner');
            setTimeout(() => {
                refreshIcon.classList.remove('loading-spinner');
            }, 1000);
        }
        
        // Reload current view
        switch(this.currentView) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'keywords':
                this.loadKeywordResearch();
                break;
            case 'serp':
                this.loadSERPAnalysis();
                break;
            case 'competitors':
                this.loadCompetitors();
                break;
            case 'backlinks':
                this.loadBacklinks();
                break;
            case 'performance':
                this.loadPerformance();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Render Dashboard Overview
    renderDashboard() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass-card rounded-xl p-6 hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center">
                            <i class="fas fa-key text-brand-teal text-xl"></i>
                        </div>
                        <span class="text-xs text-white/60">+12.5%</span>
                    </div>
                    <h3 class="text-white/60 text-sm mb-1">Total Keywords</h3>
                    <p class="text-2xl font-bold text-white">2,847</p>
                </div>

                <div class="glass-card rounded-xl p-6 hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                            <i class="fas fa-chart-line text-brand-orange text-xl"></i>
                        </div>
                        <span class="text-xs text-green-400">↑ 5.2</span>
                    </div>
                    <h3 class="text-white/60 text-sm mb-1">Avg. Position</h3>
                    <p class="text-2xl font-bold text-white">15.8</p>
                </div>

                <div class="glass-card rounded-xl p-6 hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center">
                            <i class="fas fa-link text-brand-teal text-xl"></i>
                        </div>
                        <span class="text-xs text-white/60">+248</span>
                    </div>
                    <h3 class="text-white/60 text-sm mb-1">Backlinks</h3>
                    <p class="text-2xl font-bold text-white">18,426</p>
                </div>

                <div class="glass-card rounded-xl p-6 hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                            <i class="fas fa-globe text-brand-orange text-xl"></i>
                        </div>
                        <span class="text-xs text-green-400">Good</span>
                    </div>
                    <h3 class="text-white/60 text-sm mb-1">Domain Authority</h3>
                    <p class="text-2xl font-bold text-white">68/100</p>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="glass-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Ranking Trends</h3>
                    <canvas id="rankingChart" height="200"></canvas>
                </div>

                <div class="glass-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Traffic Overview</h3>
                    <canvas id="trafficChart" height="200"></canvas>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div class="space-y-4">
                    <div class="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                        <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <i class="fas fa-arrow-up text-green-500"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-white">Ranking improved for "SEO services"</p>
                            <p class="text-white/60 text-sm">Moved from position 8 to 5</p>
                        </div>
                        <span class="text-white/40 text-sm">2h ago</span>
                    </div>
                    
                    <div class="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                        <div class="w-10 h-10 bg-brand-teal/20 rounded-lg flex items-center justify-center">
                            <i class="fas fa-link text-brand-teal"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-white">New backlink detected</p>
                            <p class="text-white/60 text-sm">From techblog.com (DA: 65)</p>
                        </div>
                        <span class="text-white/40 text-sm">5h ago</span>
                    </div>
                    
                    <div class="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                        <div class="w-10 h-10 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-brand-orange"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-white">Competitor alert</p>
                            <p class="text-white/60 text-sm">Competitor A improved ranking for target keyword</p>
                        </div>
                        <span class="text-white/40 text-sm">1d ago</span>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts
        this.initDashboardCharts();
    }

    // Initialize Dashboard Charts
    initDashboardCharts() {
        // Ranking Chart
        const rankingCtx = document.getElementById('rankingChart');
        if (rankingCtx) {
            new Chart(rankingCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Average Position',
                        data: [25, 22, 20, 18, 16, 15.8],
                        borderColor: '#4D9A88',
                        backgroundColor: 'rgba(77, 154, 136, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: 'rgba(255, 255, 255, 0.8)' }
                        }
                    },
                    scales: {
                        y: {
                            reverse: true,
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }

        // Traffic Chart
        const trafficCtx = document.getElementById('trafficChart');
        if (trafficCtx) {
            new Chart(trafficCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Organic Traffic',
                        data: [1200, 1900, 1500, 2100, 2300, 1800, 1600],
                        backgroundColor: '#E05E0F'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: 'rgba(255, 255, 255, 0.8)' }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
    }

    // Render Keyword Research
    renderKeywordResearch() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="glass-card rounded-xl p-6 mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <input type="text" id="keywordInput" placeholder="Enter seed keyword..." 
                           class="flex-1 bg-white/10 text-white placeholder-white/50 px-4 py-3 rounded-lg focus:outline-none focus:bg-white/20">
                    <select id="locationSelect" class="bg-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:bg-white/20">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                    </select>
                    <button onclick="searchKeywords()" class="bg-brand-orange text-white px-6 py-3 rounded-lg hover:bg-opacity-90">
                        <i class="fas fa-search mr-2"></i>Search
                    </button>
                </div>
            </div>

            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Keyword Suggestions</h3>
                <div id="keywordResults" class="text-white/60">
                    <p>Enter a seed keyword to get suggestions...</p>
                </div>
            </div>
        `;
    }

    // Render SERP Analysis
    renderSERPAnalysis() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="glass-card rounded-xl p-6 mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <input type="text" id="serpKeyword" placeholder="Enter keyword to analyze..." 
                           class="flex-1 bg-white/10 text-white placeholder-white/50 px-4 py-3 rounded-lg focus:outline-none focus:bg-white/20">
                    <button onclick="analyzeSERP()" class="bg-brand-teal text-white px-6 py-3 rounded-lg hover:bg-opacity-90">
                        <i class="fas fa-search mr-2"></i>Analyze SERP
                    </button>
                </div>
            </div>

            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">SERP Results</h3>
                <div id="serpResults" class="text-white/60">
                    <p>Enter a keyword to analyze SERP results...</p>
                </div>
            </div>
        `;
    }

    // Other render methods...
    renderCompetitorAnalysis() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Competitor Analysis</h3>
                <p class="text-white/60">Competitor analysis features coming soon...</p>
            </div>
        `;
    }

    renderBacklinks() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Backlink Monitor</h3>
                <p class="text-white/60">Backlink monitoring features coming soon...</p>
            </div>
        `;
    }

    renderPerformance() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Performance Reports</h3>
                <p class="text-white/60">Performance reporting features coming soon...</p>
            </div>
        `;
    }

    renderAnalytics() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Analytics</h3>
                <p class="text-white/60">Analytics features coming soon...</p>
            </div>
        `;
    }

    renderSettings() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Settings</h3>
                <div class="space-y-6">
                    <div>
                        <h4 class="text-white mb-3">API Configuration</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="text-white/60 text-sm">DataForSEO Status</label>
                                <p class="text-white">Connected</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-white mb-3">Account Information</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="text-white/60 text-sm">Email</label>
                                <p class="text-white">${this.user?.email || 'Not available'}</p>
                            </div>
                            <div>
                                <label class="text-white/60 text-sm">Role</label>
                                <p class="text-white">${this.user?.role || 'Member'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupAxiosInterceptors() {
        if (typeof axios !== 'undefined') {
            // Request interceptor
            axios.interceptors.request.use(
                config => {
                    if (this.accessToken) {
                        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
                    }
                    return config;
                },
                error => Promise.reject(error)
            );

            // Response interceptor
            axios.interceptors.response.use(
                response => response,
                async error => {
                    const originalRequest = error.config;
                    
                    if (error.response?.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true;
                        
                        try {
                            const refreshed = await this.refreshAccessToken();
                            if (refreshed) {
                                originalRequest.headers['Authorization'] = `Bearer ${this.accessToken}`;
                                return axios(originalRequest);
                            }
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                        }
                        
                        // Redirect to login
                        window.location.href = '/login';
                    }
                    
                    return Promise.reject(error);
                }
            );
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;
        
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.accessToken;
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    this.refreshToken = data.refreshToken;
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
                return true;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
        
        return false;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new EnhancedSEODashboard();
});