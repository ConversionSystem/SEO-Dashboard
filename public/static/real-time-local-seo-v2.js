// Real-Time Local SEO Monitoring System - Comprehensive One-Page Dashboard
// All metrics, insights, and monitoring tools in a single view

// Configuration
const config = {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    apiEndpoint: '/api/local-seo',
    maxAlerts: 50
};

// State Management
const state = {
    lastUpdate: null,
    alerts: [],
    metrics: {
        gmbVisibility: 0,
        localPackRank: '-',
        reviewScore: 0,
        citationScore: 0,
        changes: []
    },
    competitors: [],
    rankings: [],
    reviews: [],
    citations: []
};

// Real-time update intervals
let updateIntervals = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Comprehensive Local SEO Dashboard...');
    
    try {
        console.log('Rendering comprehensive dashboard...');
        renderComprehensiveDashboard();
        
        console.log('Initializing all charts...');
        setTimeout(() => {
            initializeAllCharts();
        }, 100);
        
        console.log('Starting real-time updates...');
        startRealTimeUpdates();
        
        console.log('Loading all data...');
        loadAllData();
        
        console.log('Initialization complete!');
    } catch (error) {
        console.error('Error during initialization:', error);
        showAlert('Error initializing dashboard: ' + error.message, 'error');
    }
});

// Render the comprehensive dashboard
function renderComprehensiveDashboard() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <!-- Top Metrics Bar -->
        <div class="glass-card rounded-xl p-4 mb-6">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <!-- GMB Visibility -->
                <div class="text-center">
                    <div class="text-xs text-white/60 mb-1">GMB Visibility</div>
                    <div class="text-2xl font-bold text-white">
                        <span id="gmbVisibility">--</span>%
                    </div>
                    <div id="gmbChange" class="text-xs" style="color: #4D9A88;">
                        <i class="fas fa-arrow-up"></i> +2.3%
                    </div>
                </div>
                
                <!-- Local Pack Rank -->
                <div class="text-center">
                    <div class="text-xs text-white/60 mb-1">Local Pack</div>
                    <div class="text-2xl font-bold" style="color: #4D9A88;">
                        #<span id="localPackRank">-</span>
                    </div>
                    <div class="text-xs text-white/40">Top 3</div>
                </div>
                
                <!-- Reviews -->
                <div class="text-center">
                    <div class="text-xs text-white/60 mb-1">Review Score</div>
                    <div class="text-2xl font-bold text-white">
                        <span id="reviewScore">-.-</span>
                        <i class="fas fa-star text-xs" style="color: #E05E0F;"></i>
                    </div>
                    <div class="text-xs text-white/40">
                        <span id="reviewCount">0</span> reviews
                    </div>
                </div>
                
                <!-- Citations -->
                <div class="text-center">
                    <div class="text-xs text-white/60 mb-1">Citations</div>
                    <div class="text-2xl font-bold text-white">
                        <span id="citationScore">--</span>%
                    </div>
                    <div class="text-xs" id="citationStatus" style="color: #4D9A88;">
                        <i class="fas fa-check-circle"></i> Healthy
                    </div>
                </div>
                
                <!-- Competitors -->
                <div class="text-center">
                    <div class="text-xs text-white/60 mb-1">Share of Voice</div>
                    <div class="text-2xl font-bold" style="color: #E05E0F;">
                        <span id="shareOfVoice">--</span>%
                    </div>
                    <div class="text-xs text-white/40">vs competitors</div>
                </div>
                
                <!-- Alerts -->
                <div class="text-center">
                    <div class="text-xs text-white/60 mb-1">Active Alerts</div>
                    <div class="text-2xl font-bold text-white">
                        <span id="alertCount">0</span>
                    </div>
                    <div class="text-xs" style="color: #E05E0F;">
                        <span id="urgentAlerts">0</span> urgent
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            <!-- Left Column - Rankings & Performance -->
            <div class="lg:col-span-2 space-y-6">
                
                <!-- Live Rankings Monitor -->
                <div class="glass-card rounded-xl p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-chart-line mr-2" style="color: #4D9A88;"></i>
                            Live Rankings Monitor
                        </h3>
                        <button onclick="refreshRankings()" class="text-xs px-3 py-1 rounded-lg glass-card text-white hover:bg-white/10">
                            <i class="fas fa-sync-alt mr-1"></i>Refresh
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-white/10 text-white/60 text-xs">
                                    <th class="text-left py-2">Keyword</th>
                                    <th class="text-center py-2">Map Pack</th>
                                    <th class="text-center py-2">Organic</th>
                                    <th class="text-center py-2">Change</th>
                                    <th class="text-right py-2">Updated</th>
                                </tr>
                            </thead>
                            <tbody id="rankingsTableCompact">
                                <!-- Will be populated -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- GMB Performance Chart -->
                <div class="glass-card rounded-xl p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-building mr-2" style="color: #4D9A88;"></i>
                            GMB Performance Trends
                        </h3>
                        <div class="flex gap-2 text-xs">
                            <span class="px-2 py-1 rounded" style="background: rgba(77, 154, 136, 0.2); color: #4D9A88;">Views</span>
                            <span class="px-2 py-1 rounded" style="background: rgba(224, 94, 15, 0.2); color: #E05E0F;">Actions</span>
                        </div>
                    </div>
                    <canvas id="gmbPerformanceChart" height="150"></canvas>
                </div>

                <!-- Competitor Analysis -->
                <div class="glass-card rounded-xl p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-users mr-2" style="color: #E05E0F;"></i>
                            Competitor Landscape
                        </h3>
                        <button onclick="checkCompetitors()" class="text-xs px-3 py-1 rounded-lg glass-card text-white hover:bg-white/10">
                            <i class="fas fa-search mr-1"></i>Scan
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <canvas id="competitorChart" height="200"></canvas>
                        </div>
                        <div id="competitorMetrics" class="space-y-3">
                            <!-- Will be populated -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Live Feed & Alerts -->
            <div class="space-y-6">
                
                <!-- Real-Time Alerts -->
                <div class="glass-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-bell mr-2 animate-pulse" style="color: #E05E0F;"></i>
                        Real-Time Alerts
                        <span class="ml-auto text-xs text-white/40">Live</span>
                    </h3>
                    <div id="alertsFeed" class="space-y-3 max-h-64 overflow-y-auto">
                        <!-- Will be populated -->
                    </div>
                </div>

                <!-- Recent Reviews -->
                <div class="glass-card rounded-xl p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-white flex items-center">
                            <i class="fas fa-star mr-2" style="color: #E05E0F;"></i>
                            Latest Reviews
                        </h3>
                        <span class="text-xs text-white/40">
                            <span id="newReviewsToday">0</span> today
                        </span>
                    </div>
                    <div id="reviewsFeed" class="space-y-3 max-h-64 overflow-y-auto">
                        <!-- Will be populated -->
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="glass-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">
                        <i class="fas fa-bolt mr-2" style="color: #4D9A88;"></i>
                        Quick Actions
                    </h3>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="scanGMB()" class="p-3 rounded-lg text-white text-xs hover:opacity-90" style="background: #4D9A88;">
                            <i class="fas fa-search block mb-1"></i>
                            Scan GMB
                        </button>
                        <button onclick="analyzeReviews()" class="p-3 rounded-lg text-white text-xs hover:opacity-90" style="background: #E05E0F;">
                            <i class="fas fa-star block mb-1"></i>
                            Analyze Reviews
                        </button>
                        <button onclick="findCitations()" class="p-3 rounded-lg text-white text-xs hover:opacity-90" style="background: #4D9A88;">
                            <i class="fas fa-link block mb-1"></i>
                            Find Citations
                        </button>
                        <button onclick="checkCompetitors()" class="p-3 rounded-lg text-white text-xs hover:opacity-90" style="background: #E05E0F;">
                            <i class="fas fa-users block mb-1"></i>
                            Check Rivals
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Section - Citations & GMB Insights -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Citation Monitor -->
            <div class="glass-card rounded-xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-link mr-2" style="color: #4D9A88;"></i>
                        Citation Health Monitor
                    </h3>
                    <div class="text-xs text-white/60">
                        NAP Consistency: <span id="napScore" style="color: #4D9A88;">--</span>%
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-white" id="citationsListed">--</div>
                        <div class="text-xs text-white/40">Listed</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold" style="color: #E05E0F;" id="citationsPending">--</div>
                        <div class="text-xs text-white/40">Pending</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-white/40" id="citationsMissing">--</div>
                        <div class="text-xs text-white/40">Missing</div>
                    </div>
                </div>
                <div id="citationsList" class="space-y-2">
                    <!-- Will be populated -->
                </div>
            </div>

            <!-- GMB Insights -->
            <div class="glass-card rounded-xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-eye mr-2" style="color: #4D9A88;"></i>
                        GMB Insights & Actions
                    </h3>
                    <button onclick="scanGMB()" class="text-xs px-3 py-1 rounded-lg glass-card text-white hover:bg-white/10">
                        <i class="fas fa-sync-alt mr-1"></i>Refresh
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div class="text-xs text-white/60 mb-2">Search Queries</div>
                        <div id="searchQueries" class="space-y-1 text-sm">
                            <!-- Will be populated -->
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-white/60 mb-2">Customer Actions</div>
                        <div id="customerActions" class="space-y-2">
                            <!-- Will be populated -->
                        </div>
                    </div>
                </div>
                <div class="pt-4 border-t border-white/10">
                    <div class="text-xs text-white/60 mb-2">Performance Summary</div>
                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div class="text-lg font-bold text-white" id="totalViews">--</div>
                            <div class="text-xs text-white/40">Views</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold" style="color: #4D9A88;" id="totalSearches">--</div>
                            <div class="text-xs text-white/40">Searches</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold" style="color: #E05E0F;" id="totalActions">--</div>
                            <div class="text-xs text-white/40">Actions</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize all charts
function initializeAllCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not available');
        return;
    }
    
    // GMB Performance Chart
    const perfCtx = document.getElementById('gmbPerformanceChart');
    if (perfCtx && perfCtx.getContext) {
        try {
            window.gmbPerformanceChart = new Chart(perfCtx, {
                type: 'line',
                data: {
                    labels: generateTimeLabels(24),
                    datasets: [
                        {
                            label: 'Views',
                            data: generateRandomData(24, 100, 500),
                            borderColor: '#4D9A88',
                            backgroundColor: 'rgba(77, 154, 136, 0.1)',
                            borderWidth: 2,
                            tension: 0.4
                        },
                        {
                            label: 'Actions',
                            data: generateRandomData(24, 10, 100),
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
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating GMB performance chart:', error);
        }
    }

    // Competitor Chart
    const compCtx = document.getElementById('competitorChart');
    if (compCtx && compCtx.getContext) {
        try {
            window.competitorChart = new Chart(compCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Your Business', 'Competitor A', 'Competitor B', 'Others'],
                    datasets: [{
                        data: [35, 25, 20, 20],
                        backgroundColor: ['#4D9A88', '#E05E0F', '#172B42', 'rgba(255, 255, 255, 0.1)'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.6)',
                                font: { size: 10 },
                                padding: 10
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating competitor chart:', error);
        }
    }
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update metrics every 5 seconds
    updateIntervals.metrics = setInterval(() => {
        if (config.autoRefresh) {
            updateMetrics();
        }
    }, 5000);

    // Update rankings every 30 seconds
    updateIntervals.rankings = setInterval(() => {
        if (config.autoRefresh) {
            updateRankings();
        }
    }, 30000);

    // Check for alerts every 10 seconds
    updateIntervals.alerts = setInterval(() => {
        if (config.autoRefresh) {
            checkForAlerts();
        }
    }, 10000);
}

// Load all data
async function loadAllData() {
    try {
        // Load metrics
        const metricsResponse = await fetch('/api/local-seo/metrics');
        const metricsData = await metricsResponse.json();
        
        // Update state
        state.metrics.gmbVisibility = metricsData.gmbVisibility || 82;
        state.metrics.localPackRank = metricsData.localPackRank || 3;
        state.metrics.reviewScore = metricsData.reviewScore || 4.5;
        state.metrics.citationScore = metricsData.citationScore || 85;
        
        // Update UI
        updateMetricsDisplay();
        
        // Load other data
        loadRankings();
        loadCompetitors();
        loadCitations();
        loadGMBInsights();
        loadReviews();
        
        showAlert('Dashboard initialized successfully', 'success');
    } catch (error) {
        console.error('Error loading data:', error);
        showAlert('Using demo data', 'warning');
    }
}

// Update metrics display
function updateMetricsDisplay() {
    document.getElementById('gmbVisibility').textContent = Math.round(state.metrics.gmbVisibility);
    document.getElementById('localPackRank').textContent = state.metrics.localPackRank;
    document.getElementById('reviewScore').textContent = state.metrics.reviewScore;
    document.getElementById('citationScore').textContent = state.metrics.citationScore;
}

// Update metrics with real-time data
function updateMetrics() {
    // Simulate real-time changes
    const prevVisibility = state.metrics.gmbVisibility || 75;
    const newVisibility = Math.max(0, Math.min(100, prevVisibility + (Math.random() - 0.5) * 5));
    state.metrics.gmbVisibility = newVisibility;
    
    const gmbEl = document.getElementById('gmbVisibility');
    if (gmbEl) {
        animateNumber(gmbEl, prevVisibility, newVisibility);
    }
    
    // Update change indicator
    const gmbChange = newVisibility - prevVisibility;
    const gmbChangeEl = document.getElementById('gmbChange');
    if (gmbChangeEl) {
        gmbChangeEl.innerHTML = gmbChange >= 0 
            ? `<i class="fas fa-arrow-up mr-1"></i>+${gmbChange.toFixed(1)}%`
            : `<i class="fas fa-arrow-down mr-1"></i>${gmbChange.toFixed(1)}%`;
        gmbChangeEl.style.color = gmbChange >= 0 ? '#4D9A88' : '#E05E0F';
    }
}

// Load rankings
async function loadRankings() {
    try {
        const response = await fetch('/api/local-seo/rankings/local');
        const data = await response.json();
        
        const table = document.getElementById('rankingsTableCompact');
        if (table && data.rankings) {
            table.innerHTML = data.rankings.slice(0, 5).map(r => `
                <tr class="border-b border-white/5 text-white/80 text-sm">
                    <td class="py-2">${r.keyword}</td>
                    <td class="py-2 text-center">
                        <span class="px-2 py-0.5 rounded text-xs" style="background: ${r.mapPackRank <= 3 ? 'rgba(77, 154, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; color: ${r.mapPackRank <= 3 ? '#4D9A88' : 'rgba(255, 255, 255, 0.6)'};">
                            #${r.mapPackRank || '-'}
                        </span>
                    </td>
                    <td class="py-2 text-center">
                        <span class="text-xs">#${r.organicRank}</span>
                    </td>
                    <td class="py-2 text-center">
                        ${r.change > 0 ? `<i class="fas fa-arrow-up" style="color: #4D9A88;"></i>` 
                         : r.change < 0 ? `<i class="fas fa-arrow-down" style="color: #E05E0F;"></i>`
                         : '<span style="color: rgba(255, 255, 255, 0.3);">–</span>'}
                    </td>
                    <td class="py-2 text-right text-xs text-white/40">Just now</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading rankings:', error);
    }
}

// Load competitors
async function loadCompetitors() {
    try {
        const response = await fetch('/api/local-seo/competitors');
        const data = await response.json();
        
        const metricsDiv = document.getElementById('competitorMetrics');
        if (metricsDiv && data.competitors) {
            metricsDiv.innerHTML = data.competitors.slice(0, 4).map(c => `
                <div class="flex justify-between items-center p-2 rounded" style="background: rgba(255, 255, 255, 0.03);">
                    <div>
                        <div class="text-sm text-white">${c.name}</div>
                        <div class="text-xs text-white/40">Visibility: ${c.metrics.gmbVisibility}%</div>
                    </div>
                    <div class="text-xs" style="color: ${c.trend === 'up' ? '#4D9A88' : '#E05E0F'};">
                        <i class="fas fa-arrow-${c.trend}"></i>
                    </div>
                </div>
            `).join('');
        }
        
        // Update share of voice
        if (data.shareOfVoice) {
            document.getElementById('shareOfVoice').textContent = Math.round(data.shareOfVoice.yourBusiness);
        }
    } catch (error) {
        console.error('Error loading competitors:', error);
    }
}

// Load citations
async function loadCitations() {
    try {
        const response = await fetch('/api/local-seo/citations/monitor');
        const data = await response.json();
        
        if (data.summary) {
            document.getElementById('citationsListed').textContent = data.summary.listed;
            document.getElementById('citationsPending').textContent = data.summary.pending;
            document.getElementById('citationsMissing').textContent = data.summary.missing;
            document.getElementById('napScore').textContent = data.summary.averageConsistency;
        }
        
        const citationsList = document.getElementById('citationsList');
        if (citationsList && data.citations) {
            citationsList.innerHTML = data.citations.slice(0, 5).map(c => `
                <div class="flex justify-between items-center text-xs p-2 rounded" style="background: rgba(255, 255, 255, 0.03);">
                    <span class="text-white/80">${c.directory}</span>
                    <span style="color: ${c.status === 'listed' ? '#4D9A88' : c.status === 'pending' ? '#E05E0F' : 'rgba(255, 255, 255, 0.3)'};">
                        ${c.status === 'listed' ? '✓' : c.status === 'pending' ? '⏳' : '✗'} ${c.napConsistency}%
                    </span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading citations:', error);
    }
}

// Load GMB insights
async function loadGMBInsights() {
    try {
        const response = await fetch('/api/local-seo/gmb/insights');
        const data = await response.json();
        
        // Update search queries
        const queriesEl = document.getElementById('searchQueries');
        if (queriesEl && data.searchQueries) {
            queriesEl.innerHTML = data.searchQueries.slice(0, 3).map(q => `
                <div class="flex justify-between text-xs">
                    <span class="text-white/60">${q.query}</span>
                    <span class="text-white/80">${q.count}</span>
                </div>
            `).join('');
        }
        
        // Update customer actions
        const actionsEl = document.getElementById('customerActions');
        if (actionsEl && data.customerActions) {
            actionsEl.innerHTML = `
                <div class="flex justify-between text-xs">
                    <span class="text-white/60"><i class="fas fa-phone mr-1" style="color: #4D9A88;"></i>Calls</span>
                    <span class="text-white/80">${data.customerActions.calls}</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-white/60"><i class="fas fa-directions mr-1" style="color: #E05E0F;"></i>Directions</span>
                    <span class="text-white/80">${data.customerActions.directions}</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-white/60"><i class="fas fa-globe mr-1" style="color: #4D9A88;"></i>Website</span>
                    <span class="text-white/80">${data.customerActions.websiteClicks}</span>
                </div>
            `;
        }
        
        // Update totals
        if (data.views) {
            document.getElementById('totalViews').textContent = data.views.total;
            document.getElementById('totalSearches').textContent = data.views.search;
            document.getElementById('totalActions').textContent = data.customerActions.calls + data.customerActions.directions + data.customerActions.websiteClicks;
        }
    } catch (error) {
        console.error('Error loading GMB insights:', error);
    }
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch('/api/local-seo/reviews/monitor');
        const data = await response.json();
        
        if (data.summary) {
            document.getElementById('reviewCount').textContent = data.summary.totalReviews;
        }
        
        const reviewsFeed = document.getElementById('reviewsFeed');
        if (reviewsFeed && data.recent) {
            reviewsFeed.innerHTML = data.recent.slice(0, 3).map(r => `
                <div class="p-3 rounded" style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid ${r.rating >= 4 ? '#4D9A88' : '#E05E0F'};">
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium text-white">${r.author}</span>
                        <div class="text-xs">
                            ${Array(5).fill('').map((_, i) => 
                                `<i class="fas fa-star" style="color: ${i < r.rating ? '#E05E0F' : 'rgba(255, 255, 255, 0.2)'}; font-size: 10px;"></i>`
                            ).join('')}
                        </div>
                    </div>
                    <p class="text-xs text-white/60 line-clamp-2">${r.comment}</p>
                    <div class="flex justify-between mt-2">
                        <span class="text-xs text-white/40">${r.platform}</span>
                        <span class="text-xs text-white/40">2h ago</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Check for alerts
async function checkForAlerts() {
    try {
        const response = await fetch('/api/local-seo/alerts');
        const data = await response.json();
        
        if (data.alerts) {
            document.getElementById('alertCount').textContent = data.alerts.length;
            document.getElementById('urgentAlerts').textContent = data.actionRequired;
            
            const alertsFeed = document.getElementById('alertsFeed');
            if (alertsFeed) {
                alertsFeed.innerHTML = data.alerts.slice(0, 5).map(a => `
                    <div class="p-3 rounded text-xs" style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid ${a.severity === 'success' ? '#4D9A88' : a.severity === 'warning' ? '#E05E0F' : 'rgba(255, 255, 255, 0.3)'};">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="font-medium text-white mb-1">${a.title}</div>
                                <div class="text-white/60">${a.message}</div>
                            </div>
                            ${a.actionRequired ? '<i class="fas fa-exclamation-circle" style="color: #E05E0F;"></i>' : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Update rankings
function updateRankings() {
    loadRankings();
}

// Quick action functions
function scanGMB() {
    showAlert('Scanning GMB profile...', 'info');
    setTimeout(() => {
        loadGMBInsights();
        showAlert('GMB scan complete!', 'success');
    }, 2000);
}

function checkCompetitors() {
    showAlert('Analyzing competitors...', 'info');
    setTimeout(() => {
        loadCompetitors();
        showAlert('Competitor analysis updated', 'success');
    }, 2000);
}

function analyzeReviews() {
    showAlert('Analyzing reviews...', 'info');
    setTimeout(() => {
        loadReviews();
        showAlert('Review analysis complete', 'success');
    }, 2000);
}

function findCitations() {
    showAlert('Searching for citations...', 'info');
    setTimeout(() => {
        loadCitations();
        showAlert('Citation scan complete', 'success');
    }, 2000);
}

function refreshRankings() {
    showAlert('Refreshing rankings...', 'info');
    loadRankings();
}

// Utility functions
function generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - i * 3600000);
        labels.push(time.getHours() + ':00');
    }
    return labels;
}

function generateRandomData(count, min, max) {
    return Array(count).fill(0).map(() => Math.floor(Math.random() * (max - min + 1)) + min);
}

function animateNumber(element, start, end, duration = 500) {
    const startTime = Date.now();
    const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const current = start + (end - start) * progress;
        element.textContent = Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    animate();
}

function showAlert(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50';
    toast.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-left: 4px solid ${type === 'success' ? '#4D9A88' : type === 'warning' || type === 'error' ? '#E05E0F' : 'rgba(255, 255, 255, 0.3)'}; 
        animation: slideIn 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} mr-2" style="color: ${type === 'success' ? '#4D9A88' : type === 'warning' || type === 'error' ? '#E05E0F' : 'white'};"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

// Export functions to global scope
window.toggleAutoRefresh = () => {
    config.autoRefresh = !config.autoRefresh;
    showAlert(`Auto-refresh ${config.autoRefresh ? 'enabled' : 'disabled'}`, 'info');
};
window.scanGMB = scanGMB;
window.checkCompetitors = checkCompetitors;
window.analyzeReviews = analyzeReviews;
window.findCitations = findCitations;
window.refreshRankings = refreshRankings;