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
    }

    // Render Local SEO Dashboard with Tabs
    renderLocalSEO() {
        const app = document.getElementById('app');
        
        // Initialize or get current tab
        if (!this.localSEOTab) {
            this.localSEOTab = 'gmb'; // Default to GMB Performance tab
        }
        
        app.innerHTML = `
            <!-- Page Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-white mb-2">Local SEO Command Center</h1>
                <p class="text-white/60">Monitor and optimize your local search presence</p>
            </div>

            <!-- Tab Navigation -->
            <div class="glass-card rounded-xl p-1 mb-6">
                <div class="flex flex-wrap gap-1">
                    <button onclick="window.dashboard.switchLocalSEOTab('gmb')" 
                            id="tab-gmb"
                            class="tab-button ${this.localSEOTab === 'gmb' ? 'active' : ''} flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-map-marker-alt mr-2"></i>GMB Performance
                    </button>
                    <button onclick="window.dashboard.switchLocalSEOTab('rankings')" 
                            id="tab-rankings"
                            class="tab-button ${this.localSEOTab === 'rankings' ? 'active' : ''} flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-chart-line mr-2"></i>Local Rankings
                    </button>
                    <button onclick="window.dashboard.switchLocalSEOTab('reviews')" 
                            id="tab-reviews"
                            class="tab-button ${this.localSEOTab === 'reviews' ? 'active' : ''} flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-star mr-2"></i>Reviews
                    </button>
                    <button onclick="window.dashboard.switchLocalSEOTab('citations')" 
                            id="tab-citations"
                            class="tab-button ${this.localSEOTab === 'citations' ? 'active' : ''} flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-link mr-2"></i>Citations
                    </button>
                    <button onclick="window.dashboard.switchLocalSEOTab('competitors')" 
                            id="tab-competitors"
                            class="tab-button ${this.localSEOTab === 'competitors' ? 'active' : ''} flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-users mr-2"></i>Competitors
                    </button>
                    <button onclick="window.dashboard.switchLocalSEOTab('insights')" 
                            id="tab-insights"
                            class="tab-button ${this.localSEOTab === 'insights' ? 'active' : ''} flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-lightbulb mr-2"></i>Insights
                    </button>
                </div>
            </div>

            <!-- Tab Content Container -->
            <div id="localSEOTabContent">
                ${this.renderLocalSEOTabContent()}
            </div>

            <style>
                .tab-button {
                    color: rgba(255, 255, 255, 0.6);
                    background: transparent;
                }
                .tab-button:hover {
                    color: rgba(255, 255, 255, 0.9);
                    background: rgba(255, 255, 255, 0.1);
                }
                .tab-button.active {
                    color: #FFFFFF;
                    background: linear-gradient(135deg, #4D9A88 0%, #4D9A88 100%);
                    box-shadow: 0 2px 8px rgba(77, 154, 136, 0.3);
                }
            </style>
        `;

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
        
        // Setup tab switching
        window.dashboard = this;
    }

    // Switch Local SEO Tab
    switchLocalSEOTab(tab) {
        this.localSEOTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`tab-${tab}`).classList.add('active');
        
        // Update content
        const contentContainer = document.getElementById('localSEOTabContent');
        if (contentContainer) {
            contentContainer.innerHTML = this.renderLocalSEOTabContent();
            
            // Re-initialize charts if needed
            if (tab === 'gmb') {
                setTimeout(() => this.initGMBTabCharts(), 100);
            } else if (tab === 'rankings') {
                setTimeout(() => this.initRankingsCharts(), 100);
            } else if (tab === 'competitors') {
                setTimeout(() => this.initCompetitorCharts(), 100);
            }
        }
    }

    // Render Local SEO Tab Content
    renderLocalSEOTabContent() {
        switch(this.localSEOTab) {
            case 'gmb':
                return this.renderGMBPerformanceTab();
            case 'rankings':
                return this.renderLocalRankingsTab();
            case 'reviews':
                return this.renderReviewsTab();
            case 'citations':
                return this.renderCitationsTab();
            case 'competitors':
                return this.renderCompetitorsTab();
            case 'insights':
                return this.renderInsightsTab();
            default:
                return this.renderGMBPerformanceTab();
        }
    }

    // Render GMB Performance Tab
    renderGMBPerformanceTab() {
        return `
            <!-- GMB Performance Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <!-- Key Metrics -->
                <div class="lg:col-span-1 space-y-4">
                    <!-- Visibility Score -->
                    <div class="glass-card rounded-xl p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-white/60">Visibility Score</span>
                            <button onclick="window.dashboard.refreshGMBData()" class="text-white/40 hover:text-white">
                                <i class="fas fa-sync-alt text-xs"></i>
                            </button>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">
                            <span id="gmbVisibilityScore">87</span>%
                        </div>
                        <div class="flex items-center text-xs">
                            <i class="fas fa-arrow-up text-green-400 mr-1"></i>
                            <span class="text-green-400">+5.2% this month</span>
                        </div>
                        <div class="mt-3 pt-3 border-t border-white/10">
                            <div class="text-xs text-white/40 mb-1">Industry Avg: 72%</div>
                            <div class="w-full bg-white/10 rounded-full h-2">
                                <div class="h-2 rounded-full relative" style="width: 87%; background: linear-gradient(90deg, #4D9A88, #5FBAA8);">
                                    <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-teal-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Business Info Status -->
                    <div class="glass-card rounded-xl p-4">
                        <h4 class="text-sm font-semibold text-white mb-3">Business Info</h4>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-white/60">Name</span>
                                <span class="text-green-400">✓ Verified</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-white/60">Address</span>
                                <span class="text-green-400">✓ Accurate</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-white/60">Phone</span>
                                <span class="text-green-400">✓ Verified</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-white/60">Hours</span>
                                <span class="text-yellow-400">⚠ Update</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-white/60">Website</span>
                                <span class="text-green-400">✓ Linked</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-white/60">Categories</span>
                                <span class="text-green-400">✓ Optimal</span>
                            </div>
                        </div>
                        <button onclick="window.dashboard.editGMBInfo()" 
                                class="w-full mt-3 px-3 py-2 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition-all">
                            <i class="fas fa-edit mr-1"></i>Edit Info
                        </button>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Actions Performance -->
                    <div class="glass-card rounded-xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-white">Customer Actions</h3>
                            <select id="gmbPeriod" onchange="window.dashboard.updateGMBPeriod()" 
                                    class="bg-white/10 text-white text-sm px-3 py-1 rounded border border-white/20">
                                <option value="7d">Last 7 Days</option>
                                <option value="30d" selected>Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="bg-white/5 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center mr-3">
                                            <i class="fas fa-phone text-teal-500"></i>
                                        </div>
                                        <div>
                                            <p class="text-2xl font-bold text-white">289</p>
                                            <p class="text-xs text-white/60">Phone Calls</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-green-400">+12%</span>
                                </div>
                                <div class="w-full bg-white/10 rounded-full h-1 mt-2">
                                    <div class="h-1 rounded-full" style="width: 75%; background-color: #4D9A88;"></div>
                                </div>
                            </div>

                            <div class="bg-white/5 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                                            <i class="fas fa-directions text-orange-500"></i>
                                        </div>
                                        <div>
                                            <p class="text-2xl font-bold text-white">456</p>
                                            <p class="text-xs text-white/60">Directions</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-green-400">+8%</span>
                                </div>
                                <div class="w-full bg-white/10 rounded-full h-1 mt-2">
                                    <div class="h-1 rounded-full" style="width: 85%; background-color: #E05E0F;"></div>
                                </div>
                            </div>

                            <div class="bg-white/5 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                                            <i class="fas fa-globe text-blue-500"></i>
                                        </div>
                                        <div>
                                            <p class="text-2xl font-bold text-white">1.2K</p>
                                            <p class="text-xs text-white/60">Website Clicks</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-green-400">+15%</span>
                                </div>
                                <div class="w-full bg-white/10 rounded-full h-1 mt-2">
                                    <div class="h-1 rounded-full" style="width: 92%; background-color: #3B82F6;"></div>
                                </div>
                            </div>

                            <div class="bg-white/5 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                                            <i class="fas fa-envelope text-purple-500"></i>
                                        </div>
                                        <div>
                                            <p class="text-2xl font-bold text-white">78</p>
                                            <p class="text-xs text-white/60">Messages</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-red-400">-5%</span>
                                </div>
                                <div class="w-full bg-white/10 rounded-full h-1 mt-2">
                                    <div class="h-1 rounded-full" style="width: 45%; background-color: #8B5CF6;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-2">
                            <button onclick="window.dashboard.performGMBScan()" 
                                    style="background-color: #4D9A88;" 
                                    class="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                                <i class="fas fa-sync-alt mr-2"></i>Full Scan
                            </button>
                            <button onclick="window.dashboard.downloadGMBReport()" 
                                    style="background-color: #E05E0F;" 
                                    class="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                                <i class="fas fa-download mr-2"></i>Download Report
                            </button>
                        </div>
                    </div>

                    <!-- Views & Discovery -->
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">Discovery & Views</h3>
                        <div class="grid grid-cols-3 gap-4 mb-4">
                            <div class="text-center">
                                <p class="text-3xl font-bold text-white">8.5K</p>
                                <p class="text-xs text-white/60">Total Views</p>
                                <p class="text-xs text-green-400 mt-1">+18% vs last period</p>
                            </div>
                            <div class="text-center">
                                <p class="text-3xl font-bold text-white">5.2K</p>
                                <p class="text-xs text-white/60">Search Views</p>
                                <p class="text-xs text-green-400 mt-1">+22% vs last period</p>
                            </div>
                            <div class="text-center">
                                <p class="text-3xl font-bold text-white">3.3K</p>
                                <p class="text-xs text-white/60">Maps Views</p>
                                <p class="text-xs text-green-400 mt-1">+12% vs last period</p>
                            </div>
                        </div>
                        <canvas id="gmbViewsChart" height="200"></canvas>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="lg:col-span-1 space-y-4">
                    <!-- Posts Performance -->
                    <div class="glass-card rounded-xl p-4">
                        <h4 class="text-sm font-semibold text-white mb-3">Recent Posts</h4>
                        <div class="space-y-3">
                            <div class="bg-white/5 rounded-lg p-3">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="flex-1">
                                        <p class="text-xs font-medium text-white">Summer Special Offer</p>
                                        <p class="text-xs text-white/40">2 days ago</p>
                                    </div>
                                    <span class="text-xs text-green-400">Active</span>
                                </div>
                                <div class="flex items-center gap-4 text-xs text-white/60">
                                    <span><i class="fas fa-eye mr-1"></i>523</span>
                                    <span><i class="fas fa-click mr-1"></i>45</span>
                                    <span><i class="fas fa-heart mr-1"></i>12</span>
                                </div>
                            </div>
                            
                            <div class="bg-white/5 rounded-lg p-3">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="flex-1">
                                        <p class="text-xs font-medium text-white">New Service Launch</p>
                                        <p class="text-xs text-white/40">1 week ago</p>
                                    </div>
                                    <span class="text-xs text-white/40">Ended</span>
                                </div>
                                <div class="flex items-center gap-4 text-xs text-white/60">
                                    <span><i class="fas fa-eye mr-1"></i>892</span>
                                    <span><i class="fas fa-click mr-1"></i>78</span>
                                    <span><i class="fas fa-heart mr-1"></i>23</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="window.dashboard.createGMBPost()" 
                                class="w-full mt-3 px-3 py-2 bg-teal-500/20 text-teal-400 text-xs rounded hover:bg-teal-500/30 transition-all">
                            <i class="fas fa-plus mr-1"></i>Create New Post
                        </button>
                    </div>

                    <!-- Photos & Media -->
                    <div class="glass-card rounded-xl p-4">
                        <h4 class="text-sm font-semibold text-white mb-3">Photos & Media</h4>
                        <div class="grid grid-cols-3 gap-2 mb-3">
                            <div class="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                                <i class="fas fa-image text-white/40"></i>
                            </div>
                            <div class="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                                <i class="fas fa-image text-white/40"></i>
                            </div>
                            <div class="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                                <span class="text-white/60 text-xs">+12</span>
                            </div>
                        </div>
                        <div class="text-xs text-white/60 mb-3">
                            <p>Total Photos: 45</p>
                            <p>Customer Photos: 28</p>
                            <p>Views This Month: 2.3K</p>
                        </div>
                        <button onclick="window.dashboard.uploadGMBPhoto()" 
                                class="w-full px-3 py-2 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition-all">
                            <i class="fas fa-upload mr-1"></i>Upload Photo
                        </button>
                    </div>

                    <!-- Quick Actions -->
                    <div class="glass-card rounded-xl p-4">
                        <h4 class="text-sm font-semibold text-white mb-3">Quick Actions</h4>
                        <div class="space-y-2">
                            <button onclick="window.dashboard.respondToReviews()" 
                                    class="w-full px-3 py-2 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition-all text-left">
                                <i class="fas fa-reply mr-2 text-teal-400"></i>Respond to Reviews (3 pending)
                            </button>
                            <button onclick="window.dashboard.updateHours()" 
                                    class="w-full px-3 py-2 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition-all text-left">
                                <i class="fas fa-clock mr-2 text-orange-400"></i>Update Business Hours
                            </button>
                            <button onclick="window.dashboard.addProducts()" 
                                    class="w-full px-3 py-2 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition-all text-left">
                                <i class="fas fa-box mr-2 text-blue-400"></i>Add Products/Services
                            </button>
                            <button onclick="window.dashboard.messageCustomers()" 
                                    class="w-full px-3 py-2 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition-all text-left">
                                <i class="fas fa-comments mr-2 text-purple-400"></i>Message Customers
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Performance Section -->
            <div class="glass-card rounded-xl p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">Search Query Performance</h3>
                    <button onclick="window.dashboard.exportSearchQueries()" class="text-white/60 hover:text-white">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-sm text-white/60 mb-3">Top Search Queries</h4>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between p-2 bg-white/5 rounded">
                                <span class="text-sm text-white">plumber near me</span>
                                <div class="flex items-center gap-3">
                                    <span class="text-xs text-white/60">1,234 views</span>
                                    <span class="text-xs text-green-400">+15%</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-white/5 rounded">
                                <span class="text-sm text-white">emergency plumber</span>
                                <div class="flex items-center gap-3">
                                    <span class="text-xs text-white/60">892 views</span>
                                    <span class="text-xs text-green-400">+8%</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-white/5 rounded">
                                <span class="text-sm text-white">24 hour plumber</span>
                                <div class="flex items-center gap-3">
                                    <span class="text-xs text-white/60">567 views</span>
                                    <span class="text-xs text-red-400">-3%</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-white/5 rounded">
                                <span class="text-sm text-white">water heater repair</span>
                                <div class="flex items-center gap-3">
                                    <span class="text-xs text-white/60">445 views</span>
                                    <span class="text-xs text-green-400">+22%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm text-white/60 mb-3">Discovery Breakdown</h4>
                        <canvas id="discoveryChart" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // Render other Local SEO tabs
    renderLocalRankingsTab() {
        return `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Local Rankings</h3>
                <p class="text-white/60">Local rankings tracking coming soon...</p>
            </div>
        `;
    }

    renderReviewsTab() {
        return `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Reviews Management</h3>
                <p class="text-white/60">Reviews management features coming soon...</p>
            </div>
        `;
    }

    renderCitationsTab() {
        return `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Citations & Directories</h3>
                <p class="text-white/60">Citation tracking coming soon...</p>
            </div>
        `;
    }

    renderCompetitorsTab() {
        return `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Competitor Analysis</h3>
                <p class="text-white/60">Competitor analysis coming soon...</p>
            </div>
        `;
    }

    renderInsightsTab() {
        return `
            <div class="glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">AI Insights & Recommendations</h3>
                <p class="text-white/60">AI-powered insights coming soon...</p>
            </div>
        `;
    }

    // Initialize GMB Tab Charts
    initGMBTabCharts() {
        // Views Chart
        const viewsCtx = document.getElementById('gmbViewsChart');
        if (viewsCtx && viewsCtx.getContext) {
            try {
                if (this.charts.gmbViewsChart) {
                    this.charts.gmbViewsChart.destroy();
                }
                
                this.charts.gmbViewsChart = new Chart(viewsCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                        datasets: [
                            {
                                label: 'Search Views',
                                data: [1200, 1350, 1400, 1520],
                                borderColor: '#4D9A88',
                                backgroundColor: 'rgba(77, 154, 136, 0.1)',
                                borderWidth: 2,
                                tension: 0.4
                            },
                            {
                                label: 'Maps Views',
                                data: [800, 850, 900, 980],
                                borderColor: '#E05E0F',
                                backgroundColor: 'rgba(224, 94, 15, 0.1)',
                                borderWidth: 2,
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11 } }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } },
                                grid: { color: 'rgba(255, 255, 255, 0.05)' }
                            },
                            x: {
                                ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } },
                                grid: { color: 'rgba(255, 255, 255, 0.05)' }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating GMB views chart:', error);
            }
        }

        // Discovery Chart
        const discoveryCtx = document.getElementById('discoveryChart');
        if (discoveryCtx && discoveryCtx.getContext) {
            try {
                if (this.charts.discoveryChart) {
                    this.charts.discoveryChart.destroy();
                }
                
                this.charts.discoveryChart = new Chart(discoveryCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Direct Search', 'Discovery Search', 'Branded Search'],
                        datasets: [{
                            data: [45, 35, 20],
                            backgroundColor: [
                                'rgba(77, 154, 136, 0.8)',
                                'rgba(224, 94, 15, 0.8)',
                                'rgba(59, 130, 246, 0.8)'
                            ],
                            borderColor: [
                                '#4D9A88',
                                '#E05E0F',
                                '#3B82F6'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 10 } }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': ' + context.parsed + '%';
                                    }
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating discovery chart:', error);
            }
        }
    }

    // GMB Action Handlers
    refreshGMBData() {
        this.showNotification('Refreshing GMB data...', 'info');
        setTimeout(() => {
            this.animateValue('gmbVisibilityScore', 87, 89, 1000);
            this.showNotification('GMB data refreshed successfully', 'success');
        }, 1500);
    }

    editGMBInfo() {
        this.showNotification('Opening GMB editor...', 'info');
    }

    downloadGMBReport() {
        this.showNotification('Generating GMB report...', 'info');
        setTimeout(() => {
            this.showNotification('Report downloaded successfully', 'success');
        }, 2000);
    }

    createGMBPost() {
        this.showNotification('Opening post creator...', 'info');
    }

    uploadGMBPhoto() {
        this.showNotification('Opening photo uploader...', 'info');
    }

    respondToReviews() {
        this.showNotification('Opening review manager...', 'info');
    }

    updateHours() {
        this.showNotification('Opening hours editor...', 'info');
    }

    addProducts() {
        this.showNotification('Opening products manager...', 'info');
    }

    messageCustomers() {
        this.showNotification('Opening messaging center...', 'info');
    }

    exportSearchQueries() {
        this.showNotification('Exporting search queries...', 'info');
        setTimeout(() => {
            this.showNotification('Search queries exported to CSV', 'success');
        }, 1500);
    }

    updateGMBPeriod() {
        const period = document.getElementById('gmbPeriod').value;
        this.showNotification(`Updating data for ${period}...`, 'info');
        setTimeout(() => {
            this.showNotification('Period updated successfully', 'success');
        }, 1000);
    }

    // Initialize other tab charts
    initRankingsCharts() {
        // Rankings charts initialization
    }

    initCompetitorCharts() {
        // Competitor charts initialization
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
        // Create comprehensive Local SEO dashboard functions
        if (!window.localSEODashboard) {
            window.localSEODashboard = {
                scanGMB: () => this.performGMBScan(),
                analyzeRankings: () => this.performRankingAnalysis(),
                findCitations: () => this.performCitationSearch()
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

    // Perform GMB Scan with animation and data updates
    async performGMBScan() {
        // Get the scan button
        const scanBtn = event.target.closest('button');
        const originalContent = scanBtn.innerHTML;
        
        // Show loading state
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Scanning...';
        scanBtn.style.opacity = '0.7';
        
        // Show notification
        this.showNotification('Scanning GMB profile for latest metrics...', 'info');
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate new random data for demonstration
        const newData = {
            gmbVisibility: Math.floor(Math.random() * 15) + 85, // 85-100
            profileViews: Math.floor(Math.random() * 500) + 2500, // 2500-3000
            searchQueries: Math.floor(Math.random() * 400) + 1300, // 1300-1700
            directionRequests: Math.floor(Math.random() * 100) + 380, // 380-480
            phoneCalls: Math.floor(Math.random() * 50) + 170, // 170-220
            change: (Math.random() * 5).toFixed(1) // 0-5%
        };
        
        // Update GMB visibility with animation
        this.animateValue('gmbVisibility', parseInt(document.getElementById('gmbVisibility').textContent), newData.gmbVisibility, 1000);
        
        // Update change indicator
        const gmbChange = document.getElementById('gmbChange');
        const changeValue = parseFloat(newData.change);
        if (changeValue > 0) {
            gmbChange.innerHTML = `<i class="fas fa-arrow-up"></i> +${changeValue}%`;
            gmbChange.style.color = '#4D9A88';
        } else if (changeValue < 0) {
            gmbChange.innerHTML = `<i class="fas fa-arrow-down"></i> ${changeValue}%`;
            gmbChange.style.color = '#E05E0F';
        } else {
            gmbChange.innerHTML = `<i class="fas fa-minus"></i> 0%`;
            gmbChange.style.color = '#ffffff80';
        }
        
        // Update all GMB metrics in the panel
        const metricsHTML = `
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-white/60">Profile Views</span>
                    <span class="text-white font-medium">${newData.profileViews.toLocaleString()}</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-1000" style="width: ${Math.min(95, newData.profileViews/30)}%; background-color: #4D9A88;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-white/60">Search Queries</span>
                    <span class="text-white font-medium">${newData.searchQueries.toLocaleString()}</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-1000" style="width: ${Math.min(95, newData.searchQueries/20)}%; background-color: #E05E0F;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-white/60">Direction Requests</span>
                    <span class="text-white font-medium">${newData.directionRequests}</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-1000" style="width: ${Math.min(95, newData.directionRequests/5)}%; background-color: #4D9A88;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-white/60">Phone Calls</span>
                    <span class="text-white font-medium">${newData.phoneCalls}</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-1000" style="width: ${Math.min(95, newData.phoneCalls/2.5)}%; background-color: #E05E0F;"></div>
                </div>
            </div>
        `;
        
        // Find and update the metrics container
        const metricsContainer = scanBtn.closest('.glass-card').querySelector('.space-y-4');
        if (metricsContainer) {
            metricsContainer.innerHTML = metricsHTML;
        }
        
        // Update the chart with new data
        this.updateGMBChart();
        
        // Flash success effect on the card
        const card = scanBtn.closest('.glass-card');
        card.style.transition = 'all 0.3s ease';
        card.style.boxShadow = '0 0 20px rgba(77, 154, 136, 0.5)';
        setTimeout(() => {
            card.style.boxShadow = '';
        }, 500);
        
        // Restore button state
        setTimeout(() => {
            scanBtn.disabled = false;
            scanBtn.innerHTML = originalContent;
            scanBtn.style.opacity = '1';
            
            // Show success notification
            this.showNotification('GMB scan complete! Metrics updated successfully.', 'success');
            
            // Update last update time
            const lastUpdate = document.getElementById('lastUpdate');
            if (lastUpdate) {
                lastUpdate.textContent = 'Just now';
            }
        }, 500);
    }

    // Animate value changes
    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const range = end - start;
        const increment = range / (duration / 10);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 10);
    }

    // Update GMB Chart with new data
    updateGMBChart() {
        const gmbCtx = document.getElementById('gmbTrendChart');
        if (!gmbCtx) return;
        
        // Generate new random data for the week
        const newData = [
            Math.floor(Math.random() * 200) + 300,
            Math.floor(Math.random() * 200) + 350,
            Math.floor(Math.random() * 200) + 400,
            Math.floor(Math.random() * 200) + 380,
            Math.floor(Math.random() * 200) + 420,
            Math.floor(Math.random() * 200) + 500,
            Math.floor(Math.random() * 200) + 450
        ];
        
        // Destroy existing chart if it exists
        if (this.charts.gmbChart) {
            this.charts.gmbChart.destroy();
        }
        
        // Create new chart with updated data
        this.charts.gmbChart = new Chart(gmbCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Profile Views',
                    data: newData,
                    borderColor: '#4D9A88',
                    backgroundColor: 'rgba(77, 154, 136, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4D9A88',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#4D9A88',
                    pointHoverBorderColor: '#fff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Views: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        display: false,
                        beginAtZero: false
                    },
                    x: {
                        display: false
                    }
                }
            }
        });
    }

    // Perform Ranking Analysis
    async performRankingAnalysis() {
        const btn = event.target.closest('button');
        const originalContent = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';
        
        this.showNotification('Analyzing local ranking opportunities...', 'info');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show analysis results
        this.showNotification('Found 15 new keyword opportunities!', 'success');
        
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }

    // Perform Citation Search
    async performCitationSearch() {
        const btn = event.target.closest('button');
        const originalContent = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Searching...';
        
        this.showNotification('Searching for citation opportunities...', 'info');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show search results
        this.showNotification('Found 8 new citation opportunities!', 'success');
        
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }

    // Show notification with toast
    showNotification(message, type = 'info') {
        const colors = {
            info: '#4D9A88',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444'
        };
        
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        
        // Create toast notification
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
                <div class="glass-card rounded-lg p-4 flex items-center space-x-3" style="border-left: 4px solid ${colors[type]};">
                    <i class="fas ${icons[type]} text-xl" style="color: ${colors[type]};"></i>
                    <div class="flex-1">
                        <p class="text-white text-sm font-medium">${message}</p>
                    </div>
                    <button onclick="document.getElementById('${toastId}').remove()" class="text-white/60 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add toast to body
        document.body.insertAdjacentHTML('beforeend', toastHTML);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            const toast = document.getElementById(toastId);
            if (toast) {
                toast.style.animation = 'slide-out 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
        
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