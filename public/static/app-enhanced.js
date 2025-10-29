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
        this.setActiveNavItem('#local-seo');
        this.updatePageTitle('Local SEO Monitor');
        this.currentView = 'local-seo';
        this.renderLocalSEO();
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
            case 'local-seo':
                this.loadLocalSEO();
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
        // Destroy existing charts if they exist
        if (this.charts.rankingChart) {
            this.charts.rankingChart.destroy();
        }
        if (this.charts.trafficChart) {
            this.charts.trafficChart.destroy();
        }
        
        // Wait for DOM to be ready
        setTimeout(() => {
            // Ranking Chart
            const rankingCtx = document.getElementById('rankingChart');
            if (rankingCtx && rankingCtx.getContext) {
                try {
                    this.charts.rankingChart = new Chart(rankingCtx.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [{
                                label: 'Average Position',
                                data: [25, 22, 20, 18, 16, 15.8],
                                borderColor: '#4D9A88',
                                backgroundColor: 'rgba(77, 154, 136, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                                mode: 'index',
                                intersect: false
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    labels: { 
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        font: { size: 12 }
                                    }
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    titleColor: '#fff',
                                    bodyColor: '#fff',
                                    borderColor: '#4D9A88',
                                    borderWidth: 1
                                }
                            },
                            scales: {
                                y: {
                                    reverse: true,
                                    beginAtZero: false,
                                    ticks: { 
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        font: { size: 11 },
                                        callback: function(value) {
                                            return '#' + value;
                                        }
                                    },
                                    grid: { 
                                        color: 'rgba(255, 255, 255, 0.05)',
                                        drawBorder: false
                                    }
                                },
                                x: {
                                    ticks: { 
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        font: { size: 11 }
                                    },
                                    grid: { 
                                        color: 'rgba(255, 255, 255, 0.05)',
                                        drawBorder: false
                                    }
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error creating ranking chart:', error);
                }
            }

            // Traffic Chart
            const trafficCtx = document.getElementById('trafficChart');
            if (trafficCtx && trafficCtx.getContext) {
                try {
                    this.charts.trafficChart = new Chart(trafficCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [{
                                label: 'Organic Traffic',
                                data: [1200, 1900, 1500, 2100, 2300, 1800, 1600],
                                backgroundColor: 'rgba(224, 94, 15, 0.8)',
                                borderColor: '#E05E0F',
                                borderWidth: 1,
                                borderRadius: 4,
                                maxBarThickness: 50
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                                mode: 'index',
                                intersect: false
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    labels: { 
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        font: { size: 12 }
                                    }
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    titleColor: '#fff',
                                    bodyColor: '#fff',
                                    borderColor: '#E05E0F',
                                    borderWidth: 1,
                                    callbacks: {
                                        label: function(context) {
                                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' visits';
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { 
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        font: { size: 11 },
                                        callback: function(value) {
                                            return value.toLocaleString();
                                        }
                                    },
                                    grid: { 
                                        color: 'rgba(255, 255, 255, 0.05)',
                                        drawBorder: false
                                    }
                                },
                                x: {
                                    ticks: { 
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        font: { size: 11 }
                                    },
                                    grid: { 
                                        display: false,
                                        drawBorder: false
                                    }
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error creating traffic chart:', error);
                }
            }
        }, 100); // Small delay to ensure DOM is ready
    }

    // Render Local SEO Dashboard
    renderLocalSEO() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Top Metrics Bar -->
            <div class="glass-card rounded-xl p-4 mb-6">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <!-- GMB Visibility -->
                    <div class="text-center">
                        <div class="text-xs text-white/60 mb-1">GMB Visibility</div>
                        <div class="text-2xl font-bold text-white">
                            <span id="gmbVisibility">87</span>%
                        </div>
                        <div id="gmbChange" class="text-xs" style="color: #4D9A88;">
                            <i class="fas fa-arrow-up"></i> +2.3%
                        </div>
                    </div>
                    
                    <!-- Local Pack Rank -->
                    <div class="text-center">
                        <div class="text-xs text-white/60 mb-1">Local Pack</div>
                        <div class="text-2xl font-bold" style="color: #4D9A88;">
                            #<span id="localPackRank">2</span>
                        </div>
                        <div class="text-xs text-white/40">Top 3</div>
                    </div>
                    
                    <!-- Reviews -->
                    <div class="text-center">
                        <div class="text-xs text-white/60 mb-1">Review Score</div>
                        <div class="text-2xl font-bold text-white">
                            <span id="reviewScore">4.8</span>
                            <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                        </div>
                        <div class="text-xs text-white/40">
                            <span id="reviewCount">247</span> reviews
                        </div>
                    </div>
                    
                    <!-- Citations -->
                    <div class="text-center">
                        <div class="text-xs text-white/60 mb-1">Citations</div>
                        <div class="text-2xl font-bold text-white">
                            <span id="citationScore">92</span>%
                        </div>
                        <div class="text-xs text-white/40">Consistency</div>
                    </div>
                    
                    <!-- Competitors -->
                    <div class="text-center">
                        <div class="text-xs text-white/60 mb-1">vs Competitors</div>
                        <div class="text-2xl font-bold" style="color: #E05E0F;">
                            #<span id="competitorRank">1</span>
                        </div>
                        <div class="text-xs text-white/40">Leading</div>
                    </div>
                    
                    <!-- Live Status -->
                    <div class="text-center">
                        <div class="text-xs text-white/60 mb-1">Status</div>
                        <div class="flex items-center justify-center">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                            <span class="text-sm text-white">Live</span>
                        </div>
                        <div class="text-xs text-white/40" id="lastUpdate">Now</div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <!-- Left Column - GMB Performance -->
                <div class="glass-card rounded-xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">GMB Performance</h3>
                        <button onclick="window.localSEODashboard && window.localSEODashboard.scanGMB()" 
                                style="background-color: #4D9A88;" 
                                class="text-white px-3 py-1 rounded text-sm hover:opacity-90">
                            <i class="fas fa-sync-alt mr-1"></i>Scan
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-white/60">Profile Views</span>
                                <span class="text-white font-medium">2,847</span>
                            </div>
                            <div class="w-full bg-white/10 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: 85%; background-color: #4D9A88;"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-white/60">Search Queries</span>
                                <span class="text-white font-medium">1,523</span>
                            </div>
                            <div class="w-full bg-white/10 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: 72%; background-color: #E05E0F;"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-white/60">Direction Requests</span>
                                <span class="text-white font-medium">426</span>
                            </div>
                            <div class="w-full bg-white/10 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: 45%; background-color: #4D9A88;"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-white/60">Phone Calls</span>
                                <span class="text-white font-medium">189</span>
                            </div>
                            <div class="w-full bg-white/10 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: 35%; background-color: #E05E0F;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-white/10">
                        <canvas id="gmbTrendChart" height="150"></canvas>
                    </div>
                </div>

                <!-- Middle Column - Local Rankings -->
                <div class="glass-card rounded-xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">Local Rankings</h3>
                        <span class="text-xs text-white/40">5 mile radius</span>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="p-3 bg-white/5 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-white font-medium">plumber near me</p>
                                    <p class="text-xs text-white/40">High intent</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xl font-bold" style="color: #4D9A88;">#1</p>
                                    <p class="text-xs text-green-400">↑ 2</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-3 bg-white/5 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-white font-medium">emergency plumber</p>
                                    <p class="text-xs text-white/40">High value</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xl font-bold" style="color: #4D9A88;">#2</p>
                                    <p class="text-xs text-white/40">—</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-3 bg-white/5 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-white font-medium">24 hour plumber</p>
                                    <p class="text-xs text-white/40">Service specific</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xl font-bold" style="color: #E05E0F;">#4</p>
                                    <p class="text-xs text-red-400">↓ 1</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-3 bg-white/5 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-white font-medium">water heater repair</p>
                                    <p class="text-xs text-white/40">Specific service</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xl font-bold text-white">#5</p>
                                    <p class="text-xs text-green-400">↑ 3</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-white/10">
                        <button onclick="window.localSEODashboard && window.localSEODashboard.analyzeRankings()" 
                                style="background-color: #E05E0F;" 
                                class="w-full text-white py-2 rounded hover:opacity-90">
                            <i class="fas fa-chart-line mr-2"></i>Track More Keywords
                        </button>
                    </div>
                </div>

                <!-- Right Column - Reviews & Alerts -->
                <div class="glass-card rounded-xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">Recent Reviews</h3>
                        <div class="flex items-center space-x-1">
                            <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                            <span class="text-white font-medium">4.8</span>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="p-3 bg-white/5 rounded-lg">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex">
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                </div>
                                <span class="text-xs text-white/40">2h ago</span>
                            </div>
                            <p class="text-sm text-white/80">"Excellent service! Quick response time and professional work."</p>
                            <p class="text-xs text-white/40 mt-1">- John D.</p>
                        </div>
                        
                        <div class="p-3 bg-white/5 rounded-lg">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex">
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                                    <i class="far fa-star text-xs text-white/20"></i>
                                </div>
                                <span class="text-xs text-white/40">1d ago</span>
                            </div>
                            <p class="text-sm text-white/80">"Very satisfied with the repair work. Would recommend."</p>
                            <p class="text-xs text-white/40 mt-1">- Sarah M.</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-white/10">
                        <h4 class="text-sm font-semibold text-white mb-3">Recent Alerts</h4>
                        <div class="space-y-2">
                            <div class="flex items-center text-sm">
                                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span class="text-white/60">Ranking improved for "plumber near me"</span>
                            </div>
                            <div class="flex items-center text-sm">
                                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                <span class="text-white/60">New competitor detected in area</span>
                            </div>
                            <div class="flex items-center text-sm">
                                <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span class="text-white/60">Citation found on Yelp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Section - Competitors and Citations -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Competitor Analysis -->
                <div class="glass-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Top Competitors</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3" 
                                     style="background-color: #4D9A88;">1</div>
                                <div>
                                    <p class="text-white font-medium">Your Business</p>
                                    <p class="text-xs text-white/40">87% visibility</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold" style="color: #4D9A88;">Leading</p>
                                <p class="text-xs text-white/40">4.8 ★ (247)</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold mr-3">2</div>
                                <div>
                                    <p class="text-white font-medium">Competitor A</p>
                                    <p class="text-xs text-white/40">82% visibility</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-white/60">-5%</p>
                                <p class="text-xs text-white/40">4.6 ★ (189)</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold mr-3">3</div>
                                <div>
                                    <p class="text-white font-medium">Competitor B</p>
                                    <p class="text-xs text-white/40">75% visibility</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-white/60">-12%</p>
                                <p class="text-xs text-white/40">4.5 ★ (156)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Citation Health -->
                <div class="glass-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Citation Health</h3>
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="p-3 bg-white/5 rounded-lg text-center">
                            <p class="text-2xl font-bold" style="color: #4D9A88;">45</p>
                            <p class="text-xs text-white/40">Total Citations</p>
                        </div>
                        <div class="p-3 bg-white/5 rounded-lg text-center">
                            <p class="text-2xl font-bold text-white">92%</p>
                            <p class="text-xs text-white/40">NAP Consistency</p>
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-white/60">Google My Business</span>
                            <span class="text-green-400">✓ Verified</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-white/60">Yelp</span>
                            <span class="text-green-400">✓ Listed</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-white/60">Facebook</span>
                            <span class="text-green-400">✓ Claimed</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-white/60">Apple Maps</span>
                            <span class="text-yellow-400">⚠ Inconsistent NAP</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-white/60">Bing Places</span>
                            <span class="text-red-400">✗ Not Listed</span>
                        </div>
                    </div>
                    
                    <button onclick="window.localSEODashboard && window.localSEODashboard.findCitations()" 
                            style="background-color: #172B42; border: 1px solid #4D9A88;" 
                            class="w-full text-white py-2 rounded mt-4 hover:opacity-90">
                        <i class="fas fa-search mr-2"></i>Find More Citations
                    </button>
                </div>
            </div>
        `;

        // Initialize Local SEO specific features
        this.initLocalSEOCharts();
        this.startLocalSEOUpdates();
    }

    // Initialize Local SEO Charts
    initLocalSEOCharts() {
        setTimeout(() => {
            // GMB Trend Chart
            const gmbCtx = document.getElementById('gmbTrendChart');
            if (gmbCtx && gmbCtx.getContext) {
                try {
                    new Chart(gmbCtx.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [{
                                label: 'Profile Views',
                                data: [320, 380, 420, 390, 450, 520, 480],
                                borderColor: '#4D9A88',
                                backgroundColor: 'rgba(77, 154, 136, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    titleColor: '#fff',
                                    bodyColor: '#fff'
                                }
                            },
                            scales: {
                                y: {
                                    display: false,
                                    beginAtZero: true
                                },
                                x: {
                                    display: false
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error creating GMB trend chart:', error);
                }
            }
        }, 100);
    }

    // Start Local SEO Real-time Updates
    startLocalSEOUpdates() {
        // Simulate real-time updates
        if (!window.localSEODashboard) {
            window.localSEODashboard = {
                scanGMB: () => {
                    console.log('Scanning GMB profile...');
                    this.showNotification('Scanning GMB profile...', 'info');
                },
                analyzeRankings: () => {
                    console.log('Analyzing local rankings...');
                    this.showNotification('Analyzing local rankings...', 'info');
                },
                findCitations: () => {
                    console.log('Finding citation opportunities...');
                    this.showNotification('Finding citation opportunities...', 'info');
                }
            };
        }
        
        // Update last update time
        setInterval(() => {
            const lastUpdate = document.getElementById('lastUpdate');
            if (lastUpdate && this.currentView === 'local-seo') {
                lastUpdate.textContent = 'Updated ' + new Date().toLocaleTimeString();
            }
        }, 30000); // Update every 30 seconds
    }

    // Show notification
    showNotification(message, type = 'info') {
        const colors = {
            info: '#4D9A88',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444'
        };
        
        // You can implement a toast notification system here
        console.log(`[${type.toUpperCase()}] ${message}`);
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