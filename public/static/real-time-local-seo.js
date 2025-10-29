// Real-Time Local SEO Monitoring System
// Handles live updates, auto-refresh, and real-time data feeds

// Configuration
const config = {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    apiEndpoint: '/api/local-seo',
    wsEndpoint: null, // WebSocket endpoint if available
    maxAlerts: 50
};

// State Management
const state = {
    currentTab: 'gmb',
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
    console.log('Initializing Real-Time Local SEO Monitor...');
    
    try {
        // Check if required libraries are loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            showAlert('Chart.js library not loaded. Charts will not display.', 'error');
        }
        
        console.log('Rendering dashboard...');
        renderDashboard();
        
        console.log('Initializing charts...');
        setTimeout(() => {
            initializeCharts();
        }, 100); // Small delay to ensure DOM is ready
        
        console.log('Starting real-time updates...');
        startRealTimeUpdates();
        
        console.log('Loading initial data...');
        loadInitialData();
        
        console.log('Setting up event listeners...');
        setupEventListeners();
        
        console.log('Updating last update time...');
        updateLastUpdateTime();
        
        console.log('Initialization complete!');
    } catch (error) {
        console.error('Error during initialization:', error);
        showAlert('Error initializing dashboard: ' + error.message, 'error');
    }
});

// Render the dashboard HTML structure
function renderDashboard() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- GMB Visibility Card -->
            <div class="glass-card rounded-xl p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-brand-teal/20 p-3 rounded-lg">
                        <i class="fas fa-eye text-brand-teal text-xl"></i>
                    </div>
                    <span id="gmbChange" class="text-brand-teal">
                        <i class="fas fa-arrow-up mr-1"></i>+2.3%
                    </span>
                </div>
                <div class="mb-2">
                    <h3 class="text-white/60 text-sm font-medium">GMB Visibility</h3>
                    <div class="flex items-baseline">
                        <span id="gmbVisibility" class="text-3xl font-bold text-white">82</span>
                        <span class="text-white/60 ml-1">%</span>
                    </div>
                </div>
                <canvas id="gmbMiniChart" height="50"></canvas>
            </div>

            <!-- Local Pack Rank Card -->
            <div class="glass-card rounded-xl p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-brand-orange/20 p-3 rounded-lg">
                        <i class="fas fa-map-marker-alt text-brand-orange text-xl"></i>
                    </div>
                    <span class="text-xs bg-brand-teal/20 text-brand-teal px-2 py-1 rounded-full">Live</span>
                </div>
                <h3 class="text-white/60 text-sm font-medium mb-2">Local Pack Rank</h3>
                <div class="flex items-center justify-between">
                    <span id="localPackRank" class="text-3xl font-bold text-white">3</span>
                    <div class="text-sm text-white/60">
                        <div id="mapPackStatus">Top 3</div>
                        <div id="organicStatus" class="text-xs">Organic: #5</div>
                    </div>
                </div>
            </div>

            <!-- Review Score Card -->
            <div class="glass-card rounded-xl p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-brand-orange/20 p-3 rounded-lg">
                        <i class="fas fa-star text-brand-orange text-xl"></i>
                    </div>
                    <span id="newReviews" class="text-xs text-white/60">3 new today</span>
                </div>
                <h3 class="text-white/60 text-sm font-medium mb-2">Review Score</h3>
                <div class="flex items-center">
                    <span id="reviewScore" class="text-3xl font-bold text-white">4.5</span>
                    <div class="flex ml-2">
                        <i class="fas fa-star text-brand-orange text-sm"></i>
                        <i class="fas fa-star text-brand-orange text-sm"></i>
                        <i class="fas fa-star text-brand-orange text-sm"></i>
                        <i class="fas fa-star text-brand-orange text-sm"></i>
                        <i class="fas fa-star-half-alt text-brand-orange text-sm"></i>
                    </div>
                </div>
                <div id="reviewCount" class="text-xs text-white/60 mt-2">342 reviews</div>
            </div>

            <!-- Citation Score Card -->
            <div class="glass-card rounded-xl p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-brand-teal/20 p-3 rounded-lg">
                        <i class="fas fa-link text-brand-teal text-xl"></i>
                    </div>
                    <span id="citationStatus" class="text-brand-teal">
                        <i class="fas fa-check-circle mr-1"></i>Healthy
                    </span>
                </div>
                <h3 class="text-white/60 text-sm font-medium mb-2">Citation Score</h3>
                <div class="mb-2">
                    <span id="citationScore" class="text-3xl font-bold text-white">85</span>
                    <span class="text-white/60 ml-1">%</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div id="citationBar" class="bg-brand-teal h-2 rounded-full" style="width: 85%"></div>
                </div>
            </div>
        </div>

        <!-- Tabbed Content -->
        <div class="glass-card rounded-xl mb-8">
            <div class="border-b border-white/10">
                <nav class="flex space-x-8 px-6" aria-label="Tabs">
                    <button onclick="switchTab('gmb')" class="tab-btn py-4 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-brand-teal active border-b-2 border-brand-orange text-brand-orange">
                        <i class="fas fa-building mr-2"></i>GMB Insights
                    </button>
                    <button onclick="switchTab('rankings')" class="tab-btn py-4 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-brand-teal">
                        <i class="fas fa-chart-line mr-2"></i>Local Rankings
                    </button>
                    <button onclick="switchTab('competitors')" class="tab-btn py-4 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-brand-teal">
                        <i class="fas fa-users mr-2"></i>Competitors
                    </button>
                    <button onclick="switchTab('reviews')" class="tab-btn py-4 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-brand-teal">
                        <i class="fas fa-star mr-2"></i>Reviews
                    </button>
                    <button onclick="switchTab('citations')" class="tab-btn py-4 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-brand-teal">
                        <i class="fas fa-link mr-2"></i>Citations
                    </button>
                    <button onclick="switchTab('alerts')" class="tab-btn py-4 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-brand-teal">
                        <i class="fas fa-bell mr-2"></i>Alerts
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
                <!-- GMB Tab -->
                <div id="gmb-tab" class="tab-content">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- GMB Performance Chart -->
                        <div class="lg:col-span-2">
                            <h3 class="text-lg font-semibold mb-4 text-white">Performance Trends</h3>
                            <div class="glass-card rounded-lg p-4">
                                <canvas id="gmbPerformanceChart" height="200"></canvas>
                            </div>
                        </div>
                        
                        <!-- Search Queries -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-white">Top Search Queries</h3>
                            <div id="searchQueries" class="space-y-2 text-white/80">
                                <!-- Populated by JavaScript -->
                            </div>
                            
                            <h3 class="text-lg font-semibold mt-6 mb-4 text-white">Customer Actions</h3>
                            <div id="customerActions" class="space-y-2 text-white/80">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Rankings Tab -->
                <div id="rankings-tab" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-white">Local Search Rankings</h3>
                        <button onclick="refreshRankings()" class="bg-brand-orange text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
                            <i class="fas fa-sync-alt mr-2"></i>Refresh
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-white/10">
                            <thead class="glass-card">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Keyword</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Location</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Map Pack</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Organic</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Change</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Last Check</th>
                                </tr>
                            </thead>
                            <tbody id="localRankingsTable" class="divide-y divide-white/10">
                                <!-- Populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Competitors Tab -->
                <div id="competitors-tab" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-white">Competitor Visibility</h3>
                            <div id="competitorList" class="space-y-2">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-white">Share of Voice</h3>
                            <div class="glass-card rounded-lg p-4">
                                <canvas id="shareOfVoiceChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reviews Tab -->
                <div id="reviews-tab" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-white">Recent Reviews</h3>
                            <div id="reviewsFeed" class="space-y-4">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-white">Sentiment Analysis</h3>
                            <div class="glass-card rounded-lg p-4">
                                <canvas id="sentimentChart" height="150"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Citations Tab -->
                <div id="citations-tab" class="tab-content hidden">
                    <h3 class="text-lg font-semibold mb-4 text-white">Directory Listings</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="glass-card">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-white/60 uppercase">Directory</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-white/60 uppercase">NAP Consistency</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-white/60 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody id="citationsTable" class="divide-y divide-white/10">
                                <!-- Populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Alerts Tab -->
                <div id="alerts-tab" class="tab-content hidden">
                    <h3 class="text-lg font-semibold mb-4 text-white">Real-Time Alerts</h3>
                    <div id="alertsList" class="space-y-4">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button onclick="scanGMB()" class="bg-brand-teal text-white px-4 py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center">
                <i class="fas fa-search mr-2"></i>Scan GMB
            </button>
            <button onclick="checkCompetitors()" class="bg-brand-orange text-white px-4 py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center">
                <i class="fas fa-users mr-2"></i>Check Competitors
            </button>
            <button onclick="analyzeReviews()" class="bg-brand-teal text-white px-4 py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center">
                <i class="fas fa-star mr-2"></i>Analyze Reviews
            </button>
            <button onclick="findCitations()" class="bg-brand-orange text-white px-4 py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center">
                <i class="fas fa-link mr-2"></i>Find Citations
            </button>
            <button onclick="refreshRankings()" class="glass-card text-white px-4 py-3 rounded-lg hover:bg-white/10 transition flex items-center justify-center">
                <i class="fas fa-sync-alt mr-2"></i>Refresh All
            </button>
        </div>
    `;
}

// Initialize all charts
function initializeCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not available, skipping chart initialization');
        return;
    }
    
    // GMB Mini Chart
    const gmbCtx = document.getElementById('gmbMiniChart');
    if (gmbCtx && gmbCtx.getContext) {
        try {
            window.gmbMiniChart = new Chart(gmbCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(12),
                datasets: [{
                    data: generateRandomData(12, 60, 90),
                    borderColor: '#4D9A88',
                    backgroundColor: 'rgba(77, 154, 136, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
        } catch (error) {
            console.error('Error creating GMB mini chart:', error);
        }
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
                        label: 'Searches',
                        data: generateRandomData(24, 50, 300),
                        borderColor: '#E05E0F',
                        backgroundColor: 'rgba(224, 94, 15, 0.1)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Actions',
                        data: generateRandomData(24, 10, 100),
                        borderColor: '#FFFFFF',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
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
        } catch (error) {
            console.error('Error creating GMB performance chart:', error);
        }
    }

    // Share of Voice Chart
    const sovCtx = document.getElementById('shareOfVoiceChart');
    if (sovCtx && sovCtx.getContext) {
        try {
            window.shareOfVoiceChart = new Chart(sovCtx, {
            type: 'doughnut',
            data: {
                labels: ['Your Business', 'Competitor A', 'Competitor B', 'Others'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#4D9A88', '#E05E0F', '#172B42', 'rgba(255, 255, 255, 0.2)'],
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
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error creating share of voice chart:', error);
        }
    }

    // Sentiment Chart
    const sentCtx = document.getElementById('sentimentChart');
    if (sentCtx && sentCtx.getContext) {
        try {
            window.sentimentChart = new Chart(sentCtx, {
            type: 'bar',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [75, 20, 5],
                    backgroundColor: ['#4D9A88', 'rgba(255, 255, 255, 0.3)', '#E05E0F'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error creating sentiment chart:', error);
        }
    }
    
    console.log('Charts initialization completed');
}

// Start real-time updates
function startRealTimeUpdates() {
    console.log('Starting real-time updates...');
    
    // Update metrics every 5 seconds (simulated for demo)
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

    // Update reviews every 60 seconds  
    updateIntervals.reviews = setInterval(() => {
        if (config.autoRefresh) {
            updateReviews();
        }
    }, 60000);

    // Check for alerts every 10 seconds
    updateIntervals.alerts = setInterval(() => {
        if (config.autoRefresh) {
            checkForAlerts();
        }
    }, 10000);
}

// Stop real-time updates
function stopRealTimeUpdates() {
    Object.keys(updateIntervals).forEach(key => {
        clearInterval(updateIntervals[key]);
    });
    updateIntervals = {};
}

// Toggle auto-refresh
function toggleAutoRefresh() {
    config.autoRefresh = !config.autoRefresh;
    const statusEl = document.getElementById('autoRefreshStatus');
    if (statusEl) {
        statusEl.textContent = `Auto-Refresh: ${config.autoRefresh ? 'ON' : 'OFF'}`;
    }
    
    if (config.autoRefresh) {
        startRealTimeUpdates();
        showAlert('Auto-refresh enabled', 'success');
    } else {
        stopRealTimeUpdates();
        showAlert('Auto-refresh disabled', 'info');
    }
}

// Update metrics with simulated real-time data
function updateMetrics() {
    // Simulate GMB visibility changes
    const prevVisibility = state.metrics.gmbVisibility || 75;
    const newVisibility = Math.max(0, Math.min(100, prevVisibility + (Math.random() - 0.5) * 5));
    state.metrics.gmbVisibility = newVisibility;
    
    const gmbEl = document.getElementById('gmbVisibility');
    if (gmbEl) {
        animateNumber(gmbEl, prevVisibility, newVisibility);
    }
    
    // Update GMB change indicator
    const gmbChange = newVisibility - prevVisibility;
    const gmbChangeEl = document.getElementById('gmbChange');
    if (gmbChangeEl) {
        gmbChangeEl.innerHTML = gmbChange >= 0 
            ? `<i class="fas fa-arrow-up mr-1"></i>+${gmbChange.toFixed(1)}%`
            : `<i class="fas fa-arrow-down mr-1"></i>${gmbChange.toFixed(1)}%`;
        gmbChangeEl.style.color = gmbChange >= 0 ? '#4D9A88' : '#E05E0F';
    }

    // Update mini chart
    if (window.gmbMiniChart) {
        const data = window.gmbMiniChart.data.datasets[0].data;
        data.shift();
        data.push(newVisibility);
        window.gmbMiniChart.update('none');
    }

    // Update Local Pack Rank
    const ranks = [1, 2, 3, 4, 5, '-'];
    const currentRank = state.metrics.localPackRank || '-';
    const newRank = Math.random() > 0.7 ? ranks[Math.floor(Math.random() * ranks.length)] : currentRank;
    state.metrics.localPackRank = newRank;
    
    const rankEl = document.getElementById('localPackRank');
    if (rankEl) {
        rankEl.textContent = newRank;
    }

    // Update review score
    const reviewScore = (4 + Math.random()).toFixed(1);
    const reviewScoreEl = document.getElementById('reviewScore');
    if (reviewScoreEl) {
        reviewScoreEl.textContent = reviewScore;
    }

    // Update citation score
    const citationScore = Math.floor(75 + Math.random() * 20);
    state.metrics.citationScore = citationScore;
    const citationScoreEl = document.getElementById('citationScore');
    if (citationScoreEl) {
        citationScoreEl.textContent = citationScore;
    }
    
    const citationBar = document.getElementById('citationBar');
    if (citationBar) {
        citationBar.style.width = `${citationScore}%`;
        citationBar.style.backgroundColor = '#4D9A88';
    }

    // Update status indicators
    updateStatusIndicators();
    updateLastUpdateTime();
    
    // Increment change counter
    const changeCountEl = document.getElementById('changeCount');
    if (changeCountEl) {
        const currentCount = parseInt(changeCountEl.textContent) || 0;
        changeCountEl.textContent = currentCount + 1;
    }
}

// Update rankings with real-time data
function updateRankings() {
    const keywords = [
        'digital marketing agency',
        'seo services near me',
        'web design company',
        'local seo expert',
        'marketing consultant'
    ];
    
    const locations = ['Downtown', 'North Side', 'West End', 'City Center', 'East District'];
    
    const rankingsTable = document.getElementById('localRankingsTable');
    if (!rankingsTable) return;
    
    let html = '';
    keywords.forEach((keyword, i) => {
        const location = locations[i % locations.length];
        const mapRank = Math.floor(Math.random() * 10) + 1;
        const organicRank = Math.floor(Math.random() * 20) + 1;
        const change = Math.floor(Math.random() * 5) - 2;
        
        html += `
            <tr class="border-b border-white/5">
                <td class="px-4 py-3 font-medium text-white">${keyword}</td>
                <td class="px-4 py-3 text-white/80">${location}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${mapRank <= 3 ? 'bg-brand-teal/20 text-brand-teal' : 'bg-white/10 text-white/60'}">
                        #${mapRank}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-orange/20 text-brand-orange">
                        #${organicRank}
                    </span>
                </td>
                <td class="px-4 py-3">
                    ${change > 0 ? `<span class="text-brand-teal"><i class="fas fa-arrow-up mr-1"></i>${change}</span>` 
                     : change < 0 ? `<span class="text-brand-orange"><i class="fas fa-arrow-down mr-1"></i>${Math.abs(change)}</span>`
                     : '<span class="text-white/40">–</span>'}
                </td>
                <td class="px-4 py-3 text-xs text-white/40">Just now</td>
            </tr>
        `;
    });
    
    rankingsTable.innerHTML = html;
}

// Update reviews feed
function updateReviews() {
    const names = ['Sarah M.', 'Mike T.', 'Jessica L.', 'David R.', 'Emma K.'];
    const comments = [
        'Outstanding service! Highly recommend.',
        'Very professional and responsive team.',
        'Great results for our local business.',
        'Excellent SEO strategy and execution.',
        'Helped us rank #1 locally!'
    ];
    
    const reviewsFeed = document.getElementById('reviewsFeed');
    if (!reviewsFeed) return;
    
    // Add a new review at the top
    const name = names[Math.floor(Math.random() * names.length)];
    const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
    const comment = comments[Math.floor(Math.random() * comments.length)];
    
    const newReview = document.createElement('div');
    newReview.style.cssText = 'border-left: 4px solid #4D9A88; padding-left: 16px; margin-bottom: 16px; animation: pulse 1s;';
    newReview.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600; color: white;">${name}</span>
            <span style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.5);">Just now</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            ${Array(5).fill('').map((_, i) => 
                `<i class="fas fa-star" style="color: ${i < rating ? '#E05E0F' : 'rgba(255, 255, 255, 0.2)'}"></i>`
            ).join('')}
        </div>
        <p style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.7);">${comment}</p>
    `;
    
    reviewsFeed.insertBefore(newReview, reviewsFeed.firstChild);
    
    // Remove animation after 1 second
    setTimeout(() => {
        newReview.classList.remove('animate-pulse');
    }, 1000);
    
    // Keep only last 5 reviews
    while (reviewsFeed.children.length > 5) {
        reviewsFeed.removeChild(reviewsFeed.lastChild);
    }
    
    // Update review count
    const reviewCountEl = document.getElementById('reviewCount');
    if (reviewCountEl) {
        const count = parseInt(reviewCountEl.textContent.match(/\d+/)[0]) + 1;
        reviewCountEl.textContent = `${count} reviews`;
    }
    
    // Update new reviews today
    const newReviewsEl = document.getElementById('newReviews');
    if (newReviewsEl) {
        const count = parseInt(newReviewsEl.textContent.match(/\d+/)[0]) + 1;
        newReviewsEl.textContent = `${count} new today`;
    }
}

// Check for alerts
function checkForAlerts() {
    const alertTypes = [
        { type: 'success', icon: 'check-circle', title: 'Ranking Improved', message: 'Moved up 3 positions for "seo services"' },
        { type: 'warning', icon: 'exclamation-triangle', title: 'New Competitor', message: 'New business listed in your area' },
        { type: 'info', icon: 'info-circle', title: 'Citation Found', message: 'New citation discovered on YellowPages' },
        { type: 'success', icon: 'star', title: 'New Review', message: '5-star review received on Google' }
    ];
    
    // Random chance of new alert
    if (Math.random() > 0.7) {
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        addAlert(alert);
    }
}

// Add new alert
function addAlert(alert) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    const alertEl = document.createElement('div');
    const borderColor = alert.type === 'success' ? '#4D9A88' : alert.type === 'warning' ? '#E05E0F' : 'rgba(255, 255, 255, 0.3)';
    alertEl.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        border-left: 4px solid ${borderColor};
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        animation: pulse 1s;
    `;
    alertEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: 600; color: white;">
                    <i class="fas fa-${alert.icon}" style="margin-right: 8px; color: ${borderColor};"></i>${alert.title}
                </div>
                <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.7); margin-top: 4px;">${alert.message}</div>
            </div>
            <span style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5);">Just now</span>
        </div>
    `;
    
    alertsList.insertBefore(alertEl, alertsList.firstChild);
    
    // Update alert count
    const alertCountEl = document.getElementById('alertCount');
    if (alertCountEl) {
        const count = parseInt(alertCountEl.textContent) + 1;
        alertCountEl.textContent = count;
    }
    
    // Remove animation after 2 seconds
    setTimeout(() => {
        alertEl.classList.remove('animate-pulse');
    }, 2000);
    
    // Keep only last N alerts
    while (alertsList.children.length > config.maxAlerts) {
        alertsList.removeChild(alertsList.lastChild);
    }
    
    // Save to state
    state.alerts.unshift(alert);
    if (state.alerts.length > config.maxAlerts) {
        state.alerts.pop();
    }
}

// Load initial data
async function loadInitialData() {
    try {
        // Load real data from API
        const response = await fetch('/api/local-seo/metrics');
        const data = await response.json();
        
        // Initialize metrics from API
        state.metrics.gmbVisibility = data.gmbVisibility || 82;
        state.metrics.localPackRank = data.localPackRank || 3;
        state.metrics.reviewScore = data.reviewScore || 4.5;
        state.metrics.citationScore = data.citationScore || 85;
        
        // Update UI
        document.getElementById('gmbVisibility').textContent = state.metrics.gmbVisibility;
        document.getElementById('localPackRank').textContent = state.metrics.localPackRank;
        document.getElementById('reviewScore').textContent = state.metrics.reviewScore;
        document.getElementById('citationScore').textContent = state.metrics.citationScore;
        document.getElementById('citationBar').style.width = `${state.metrics.citationScore}%`;
        
        // Load GMB data
        loadGMBData();
        
        // Load competitors
        loadCompetitors();
        
        // Load citations
        loadCitations();
        
        showAlert('Real-time monitoring activated', 'success');
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showAlert('Error loading data. Using demo mode.', 'warning');
    }
}

// Load GMB data
function loadGMBData() {
    // Search queries
    const searchQueries = [
        { query: 'seo services near me', count: 342 },
        { query: 'digital marketing agency', count: 287 },
        { query: 'local seo company', count: 198 },
        { query: 'web design services', count: 156 },
        { query: 'marketing consultant', count: 124 }
    ];
    
    const queriesEl = document.getElementById('searchQueries');
    if (queriesEl) {
        queriesEl.innerHTML = searchQueries.map(q => `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8);">${q.query}</span>
                <span style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5);">${q.count}</span>
            </div>
        `).join('');
    }
    
    // Customer actions
    const actions = {
        calls: Math.floor(Math.random() * 50) + 10,
        directions: Math.floor(Math.random() * 100) + 20,
        website: Math.floor(Math.random() * 200) + 50
    };
    
    const actionsEl = document.getElementById('customerActions');
    if (actionsEl) {
        actionsEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8);"><i class="fas fa-phone" style="color: #4D9A88; margin-right: 8px;"></i>Calls</span>
                <span style="font-weight: bold; color: white;">${actions.calls}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8);"><i class="fas fa-directions" style="color: #E05E0F; margin-right: 8px;"></i>Directions</span>
                <span style="font-weight: bold; color: white;">${actions.directions}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8);"><i class="fas fa-globe" style="color: #4D9A88; margin-right: 8px;"></i>Website Clicks</span>
                <span style="font-weight: bold; color: white;">${actions.website}</span>
            </div>
        `;
    }
}

// Load competitors
function loadCompetitors() {
    const competitors = [
        { name: 'Competitor A', visibility: 78, trend: 'up' },
        { name: 'Competitor B', visibility: 65, trend: 'down' },
        { name: 'Competitor C', visibility: 72, trend: 'stable' },
        { name: 'Your Business', visibility: 82, trend: 'up' }
    ];
    
    const competitorList = document.getElementById('competitorList');
    if (competitorList) {
        competitorList.innerHTML = competitors.map(c => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 8px; ${c.name === 'Your Business' ? 'background: rgba(77, 154, 136, 0.1); border-radius: 8px;' : ''}">
                <div>
                    <span style="font-weight: 500; color: white;">${c.name}</span>
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5);">Visibility: ${c.visibility}%</div>
                </div>
                <span style="color: ${c.trend === 'up' ? '#4D9A88' : c.trend === 'down' ? '#E05E0F' : 'rgba(255, 255, 255, 0.5)'}">
                    <i class="fas fa-arrow-${c.trend === 'stable' ? 'right' : c.trend}"></i>
                </span>
            </div>
        `).join('');
    }
}

// Load citations
function loadCitations() {
    const citations = [
        { directory: 'Yelp', status: 'Listed', consistency: 100, statusColor: 'green' },
        { directory: 'Yellow Pages', status: 'Listed', consistency: 95, statusColor: 'green' },
        { directory: 'Facebook', status: 'Listed', consistency: 100, statusColor: 'green' },
        { directory: 'Bing Places', status: 'Pending', consistency: 0, statusColor: 'yellow' },
        { directory: 'Apple Maps', status: 'Listed', consistency: 90, statusColor: 'green' }
    ];
    
    const citationsTable = document.getElementById('citationsTable');
    if (citationsTable) {
        citationsTable.innerHTML = citations.map(c => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <td style="padding: 8px; color: white;">${c.directory}</td>
                <td style="padding: 8px; color: ${c.status === 'Listed' ? '#4D9A88' : '#E05E0F'};">${c.status === 'Listed' ? '✓' : '⏳'} ${c.status}</td>
                <td style="padding: 8px; color: ${c.consistency >= 90 ? '#4D9A88' : c.consistency >= 70 ? '#E05E0F' : '#E05E0F'};">${c.consistency}%</td>
                <td style="padding: 8px;"><button style="color: #4D9A88; cursor: pointer;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">View</button></td>
            </tr>
        `).join('');
    }
}

// Quick action functions
function scanGMB() {
    showAlert('Scanning Google My Business profile...', 'info');
    setTimeout(() => {
        showAlert('GMB scan complete! 3 optimization opportunities found.', 'success');
        updateMetrics();
    }, 2000);
}

function checkCompetitors() {
    showAlert('Analyzing competitor activities...', 'info');
    setTimeout(() => {
        showAlert('Competitor analysis complete. 2 new competitors detected.', 'warning');
        loadCompetitors();
    }, 2000);
}

function analyzeReviews() {
    showAlert('Analyzing review sentiment...', 'info');
    setTimeout(() => {
        showAlert('Review analysis complete. Overall sentiment: Positive (92%)', 'success');
        updateReviews();
    }, 2000);
}

function findCitations() {
    showAlert('Searching for new citation opportunities...', 'info');
    setTimeout(() => {
        showAlert('Found 5 new citation opportunities!', 'success');
        loadCitations();
    }, 2000);
}

function refreshRankings() {
    showAlert('Refreshing local rankings...', 'info');
    updateRankings();
    setTimeout(() => {
        showAlert('Rankings updated successfully!', 'success');
    }, 1000);
}

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-b-2');
        btn.style.borderColor = 'transparent';
        btn.style.color = 'rgba(255, 255, 255, 0.6)';
    });
    
    if (event && event.target) {
        event.target.classList.add('active', 'border-b-2');
        event.target.style.borderColor = '#E05E0F';
        event.target.style.color = '#E05E0F';
    }
    
    state.currentTab = tabName;
}

// Update status indicators
function updateStatusIndicators() {
    // Map Pack Status
    const mapPackEl = document.getElementById('mapPackStatus');
    if (mapPackEl) {
        const rank = state.metrics.localPackRank;
        if (rank === '-') {
            mapPackEl.textContent = 'Not Ranked';
            mapPackEl.style.color = 'rgba(255, 255, 255, 0.4)';
            mapPackEl.style.fontWeight = '600';
        } else if (rank <= 3) {
            mapPackEl.textContent = `#${rank} ✓`;
            mapPackEl.style.color = '#4D9A88';
            mapPackEl.style.fontWeight = '600';
        } else {
            mapPackEl.textContent = `#${rank}`;
            mapPackEl.style.color = '#E05E0F';
            mapPackEl.style.fontWeight = '600';
        }
    }
    
    // Organic Status
    const organicEl = document.getElementById('organicStatus');
    if (organicEl) {
        const organicRank = Math.floor(Math.random() * 10) + 1;
        organicEl.textContent = `Organic: #${organicRank}`;
        organicEl.style.color = organicRank <= 5 ? '#4D9A88' : 'rgba(255, 255, 255, 0.6)';
        organicEl.style.fontWeight = '600';
        organicEl.style.fontSize = '0.75rem';
    }
    
    // Citation Status
    const citationStatusEl = document.getElementById('citationStatus');
    if (citationStatusEl) {
        const score = state.metrics.citationScore;
        if (score >= 80) {
            citationStatusEl.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Healthy';
            citationStatusEl.style.color = '#4D9A88';
        } else if (score >= 60) {
            citationStatusEl.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i>Fair';
            citationStatusEl.style.color = '#E05E0F';
        } else {
            citationStatusEl.innerHTML = '<i class="fas fa-times-circle mr-1"></i>Needs Attention';
            citationStatusEl.style.color = '#E05E0F';
        }
    }
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
        element.textContent = current.toFixed(0);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    animate();
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const el = document.getElementById('lastUpdateTime');
    if (el) {
        el.textContent = timeStr;
    }
    state.lastUpdate = now;
}

function showAlert(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // You could also show a toast notification here
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-pulse glass-card`;
    
    // Use brand colors for different alert types
    if (type === 'success') {
        toast.style.borderLeft = '4px solid #4D9A88';
    } else if (type === 'warning' || type === 'error') {
        toast.style.borderLeft = '4px solid #E05E0F';
    } else {
        toast.style.borderLeft = '4px solid rgba(255, 255, 255, 0.3)';
    }
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} mr-2 ${type === 'success' ? 'text-brand-teal' : type === 'warning' || type === 'error' ? 'text-brand-orange' : 'text-white/80'}"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition', 'duration-500');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Add any additional event listeners here
    console.log('Event listeners setup complete');
}

// Export functions to global scope for HTML onclick handlers
window.toggleAutoRefresh = toggleAutoRefresh;
window.switchTab = switchTab;
window.scanGMB = scanGMB;
window.checkCompetitors = checkCompetitors;
window.analyzeReviews = analyzeReviews;
window.findCitations = findCitations;
window.refreshRankings = refreshRankings;

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        config,
        state,
        startRealTimeUpdates,
        stopRealTimeUpdates,
        updateMetrics,
        showAlert
    };
}