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
    renderDashboard();
    initializeCharts();
    startRealTimeUpdates();
    loadInitialData();
    setupEventListeners();
    updateLastUpdateTime();
});

// Render the dashboard HTML structure
function renderDashboard() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- GMB Visibility Card -->
            <div class="bg-white rounded-xl shadow-lg p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-blue-100 p-3 rounded-lg">
                        <i class="fas fa-eye text-blue-600 text-xl"></i>
                    </div>
                    <span id="gmbChange" class="text-green-600">
                        <i class="fas fa-arrow-up mr-1"></i>+2.3%
                    </span>
                </div>
                <div class="mb-2">
                    <h3 class="text-gray-500 text-sm font-medium">GMB Visibility</h3>
                    <div class="flex items-baseline">
                        <span id="gmbVisibility" class="text-3xl font-bold text-gray-800">82</span>
                        <span class="text-gray-500 ml-1">%</span>
                    </div>
                </div>
                <canvas id="gmbMiniChart" height="50"></canvas>
            </div>

            <!-- Local Pack Rank Card -->
            <div class="bg-white rounded-xl shadow-lg p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-green-100 p-3 rounded-lg">
                        <i class="fas fa-map-marker-alt text-green-600 text-xl"></i>
                    </div>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live</span>
                </div>
                <h3 class="text-gray-500 text-sm font-medium mb-2">Local Pack Rank</h3>
                <div class="flex items-center justify-between">
                    <span id="localPackRank" class="text-3xl font-bold text-gray-800">3</span>
                    <div class="text-sm text-gray-500">
                        <div id="mapPackStatus">Top 3</div>
                        <div id="organicStatus" class="text-xs">Organic: #5</div>
                    </div>
                </div>
            </div>

            <!-- Review Score Card -->
            <div class="bg-white rounded-xl shadow-lg p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-yellow-100 p-3 rounded-lg">
                        <i class="fas fa-star text-yellow-600 text-xl"></i>
                    </div>
                    <span id="newReviews" class="text-xs text-gray-500">3 new today</span>
                </div>
                <h3 class="text-gray-500 text-sm font-medium mb-2">Review Score</h3>
                <div class="flex items-center">
                    <span id="reviewScore" class="text-3xl font-bold text-gray-800">4.5</span>
                    <div class="flex ml-2">
                        <i class="fas fa-star text-yellow-400 text-sm"></i>
                        <i class="fas fa-star text-yellow-400 text-sm"></i>
                        <i class="fas fa-star text-yellow-400 text-sm"></i>
                        <i class="fas fa-star text-yellow-400 text-sm"></i>
                        <i class="fas fa-star-half-alt text-yellow-400 text-sm"></i>
                    </div>
                </div>
                <div id="reviewCount" class="text-xs text-gray-500 mt-2">342 reviews</div>
            </div>

            <!-- Citation Score Card -->
            <div class="bg-white rounded-xl shadow-lg p-6 hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-purple-100 p-3 rounded-lg">
                        <i class="fas fa-link text-purple-600 text-xl"></i>
                    </div>
                    <span id="citationStatus" class="text-green-600">
                        <i class="fas fa-check-circle mr-1"></i>Healthy
                    </span>
                </div>
                <h3 class="text-gray-500 text-sm font-medium mb-2">Citation Score</h3>
                <div class="mb-2">
                    <span id="citationScore" class="text-3xl font-bold text-gray-800">85</span>
                    <span class="text-gray-500 ml-1">%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div id="citationBar" class="bg-purple-600 h-2 rounded-full" style="width: 85%"></div>
                </div>
            </div>
        </div>

        <!-- Tabbed Content -->
        <div class="bg-white rounded-xl shadow-lg mb-8">
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8 px-6" aria-label="Tabs">
                    <button onclick="switchTab('gmb')" class="tab-btn py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 active border-b-2 border-blue-600 text-blue-600">
                        <i class="fas fa-building mr-2"></i>GMB Insights
                    </button>
                    <button onclick="switchTab('rankings')" class="tab-btn py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                        <i class="fas fa-chart-line mr-2"></i>Local Rankings
                    </button>
                    <button onclick="switchTab('competitors')" class="tab-btn py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                        <i class="fas fa-users mr-2"></i>Competitors
                    </button>
                    <button onclick="switchTab('reviews')" class="tab-btn py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                        <i class="fas fa-star mr-2"></i>Reviews
                    </button>
                    <button onclick="switchTab('citations')" class="tab-btn py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                        <i class="fas fa-link mr-2"></i>Citations
                    </button>
                    <button onclick="switchTab('alerts')" class="tab-btn py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
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
                            <h3 class="text-lg font-semibold mb-4">Performance Trends</h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <canvas id="gmbPerformanceChart" height="200"></canvas>
                            </div>
                        </div>
                        
                        <!-- Search Queries -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Top Search Queries</h3>
                            <div id="searchQueries" class="space-y-2">
                                <!-- Populated by JavaScript -->
                            </div>
                            
                            <h3 class="text-lg font-semibold mt-6 mb-4">Customer Actions</h3>
                            <div id="customerActions" class="space-y-2">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Rankings Tab -->
                <div id="rankings-tab" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Local Search Rankings</h3>
                        <button onclick="refreshRankings()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-sync-alt mr-2"></i>Refresh
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Map Pack</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organic</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                                </tr>
                            </thead>
                            <tbody id="localRankingsTable" class="bg-white divide-y divide-gray-200">
                                <!-- Populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Competitors Tab -->
                <div id="competitors-tab" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Competitor Visibility</h3>
                            <div id="competitorList" class="space-y-2">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Share of Voice</h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <canvas id="shareOfVoiceChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reviews Tab -->
                <div id="reviews-tab" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Recent Reviews</h3>
                            <div id="reviewsFeed" class="space-y-4">
                                <!-- Populated by JavaScript -->
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Sentiment Analysis</h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <canvas id="sentimentChart" height="150"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Citations Tab -->
                <div id="citations-tab" class="tab-content hidden">
                    <h3 class="text-lg font-semibold mb-4">Directory Listings</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Directory</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NAP Consistency</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody id="citationsTable" class="bg-white">
                                <!-- Populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Alerts Tab -->
                <div id="alerts-tab" class="tab-content hidden">
                    <h3 class="text-lg font-semibold mb-4">Real-Time Alerts</h3>
                    <div id="alertsList" class="space-y-4">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button onclick="scanGMB()" class="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                <i class="fas fa-search mr-2"></i>Scan GMB
            </button>
            <button onclick="checkCompetitors()" class="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center">
                <i class="fas fa-users mr-2"></i>Check Competitors
            </button>
            <button onclick="analyzeReviews()" class="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center">
                <i class="fas fa-star mr-2"></i>Analyze Reviews
            </button>
            <button onclick="findCitations()" class="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition flex items-center justify-center">
                <i class="fas fa-link mr-2"></i>Find Citations
            </button>
            <button onclick="refreshRankings()" class="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition flex items-center justify-center">
                <i class="fas fa-sync-alt mr-2"></i>Refresh All
            </button>
        </div>
    `;
}

// Initialize all charts
function initializeCharts() {
    // GMB Mini Chart
    const gmbCtx = document.getElementById('gmbMiniChart');
    if (gmbCtx) {
        window.gmbMiniChart = new Chart(gmbCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(12),
                datasets: [{
                    data: generateRandomData(12, 60, 90),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    }

    // GMB Performance Chart
    const perfCtx = document.getElementById('gmbPerformanceChart');
    if (perfCtx) {
        window.gmbPerformanceChart = new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(24),
                datasets: [
                    {
                        label: 'Views',
                        data: generateRandomData(24, 100, 500),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Searches',
                        data: generateRandomData(24, 50, 300),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Actions',
                        data: generateRandomData(24, 10, 100),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Share of Voice Chart
    const sovCtx = document.getElementById('shareOfVoiceChart');
    if (sovCtx) {
        window.shareOfVoiceChart = new Chart(sovCtx, {
            type: 'doughnut',
            data: {
                labels: ['Your Business', 'Competitor A', 'Competitor B', 'Others'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#3B82F6', '#EF4444', '#F59E0B', '#6B7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Sentiment Chart
    const sentCtx = document.getElementById('sentimentChart');
    if (sentCtx) {
        window.sentimentChart = new Chart(sentCtx, {
            type: 'bar',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [75, 20, 5],
                    backgroundColor: ['#10B981', '#6B7280', '#EF4444'],
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
                        max: 100
                    }
                }
            }
        });
    }
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
        gmbChangeEl.className = gmbChange >= 0 ? 'text-green-600' : 'text-red-600';
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
            <tr>
                <td class="px-4 py-3 font-medium">${keyword}</td>
                <td class="px-4 py-3">${location}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${mapRank <= 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        #${mapRank}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #${organicRank}
                    </span>
                </td>
                <td class="px-4 py-3">
                    ${change > 0 ? `<span class="text-green-600"><i class="fas fa-arrow-up mr-1"></i>${change}</span>` 
                     : change < 0 ? `<span class="text-red-600"><i class="fas fa-arrow-down mr-1"></i>${Math.abs(change)}</span>`
                     : '<span class="text-gray-500">–</span>'}
                </td>
                <td class="px-4 py-3 text-xs text-gray-500">Just now</td>
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
    newReview.className = 'border-l-4 border-green-500 pl-4 animate-pulse';
    newReview.innerHTML = `
        <div class="flex items-center justify-between mb-1">
            <span class="font-semibold">${name}</span>
            <span class="text-sm text-gray-500">Just now</span>
        </div>
        <div class="flex items-center mb-2">
            ${Array(5).fill('').map((_, i) => 
                `<i class="fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`
            ).join('')}
        </div>
        <p class="text-sm text-gray-700">${comment}</p>
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
    alertEl.className = `bg-${alert.type === 'success' ? 'green' : alert.type === 'warning' ? 'yellow' : 'blue'}-50 border-l-4 border-${alert.type === 'success' ? 'green' : alert.type === 'warning' ? 'yellow' : 'blue'}-500 p-4 rounded animate-pulse mb-4`;
    alertEl.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <div class="font-semibold text-${alert.type === 'success' ? 'green' : alert.type === 'warning' ? 'yellow' : 'blue'}-800">
                    <i class="fas fa-${alert.icon} mr-2"></i>${alert.title}
                </div>
                <div class="text-sm text-${alert.type === 'success' ? 'green' : alert.type === 'warning' ? 'yellow' : 'blue'}-600 mt-1">${alert.message}</div>
            </div>
            <span class="text-xs text-gray-500">Just now</span>
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
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize metrics
        state.metrics.gmbVisibility = 82;
        state.metrics.localPackRank = 3;
        state.metrics.reviewScore = 4.5;
        state.metrics.citationScore = 85;
        
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
            <div class="flex justify-between items-center">
                <span class="text-sm">${q.query}</span>
                <span class="text-xs text-gray-500">${q.count}</span>
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
            <div class="flex justify-between items-center">
                <span class="text-sm"><i class="fas fa-phone text-green-600 mr-2"></i>Calls</span>
                <span class="font-bold">${actions.calls}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm"><i class="fas fa-directions text-blue-600 mr-2"></i>Directions</span>
                <span class="font-bold">${actions.directions}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm"><i class="fas fa-globe text-purple-600 mr-2"></i>Website Clicks</span>
                <span class="font-bold">${actions.website}</span>
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
            <div class="flex justify-between items-center p-2 ${c.name === 'Your Business' ? 'bg-blue-50 rounded' : ''}">
                <div>
                    <span class="font-medium">${c.name}</span>
                    <div class="text-xs text-gray-500">Visibility: ${c.visibility}%</div>
                </div>
                <span class="${c.trend === 'up' ? 'text-green-600' : c.trend === 'down' ? 'text-red-600' : 'text-gray-500'}">
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
            <tr class="border-b">
                <td class="py-2">${c.directory}</td>
                <td class="py-2"><span class="text-${c.statusColor}-600">${c.status === 'Listed' ? '✓' : '⏳'} ${c.status}</span></td>
                <td class="py-2"><span class="text-${c.consistency >= 90 ? 'green' : c.consistency >= 70 ? 'yellow' : 'red'}-600">${c.consistency}%</span></td>
                <td class="py-2"><button class="text-blue-600 hover:text-blue-800">View</button></td>
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
        btn.classList.remove('active', 'border-b-2', 'border-blue-600', 'text-blue-600');
    });
    
    event.target.classList.add('active', 'border-b-2', 'border-blue-600', 'text-blue-600');
    
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
            mapPackEl.className = 'font-semibold text-gray-500';
        } else if (rank <= 3) {
            mapPackEl.textContent = `#${rank} ✓`;
            mapPackEl.className = 'font-semibold text-green-600';
        } else {
            mapPackEl.textContent = `#${rank}`;
            mapPackEl.className = 'font-semibold text-yellow-600';
        }
    }
    
    // Organic Status
    const organicEl = document.getElementById('organicStatus');
    if (organicEl) {
        const organicRank = Math.floor(Math.random() * 10) + 1;
        organicEl.textContent = `#${organicRank}`;
        organicEl.className = organicRank <= 5 ? 'font-semibold text-green-600' : 'font-semibold text-blue-600';
    }
    
    // Citation Status
    const citationStatusEl = document.getElementById('citationStatus');
    if (citationStatusEl) {
        const score = state.metrics.citationScore;
        if (score >= 80) {
            citationStatusEl.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Healthy';
            citationStatusEl.className = 'text-green-600';
        } else if (score >= 60) {
            citationStatusEl.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i>Fair';
            citationStatusEl.className = 'text-yellow-600';
        } else {
            citationStatusEl.innerHTML = '<i class="fas fa-times-circle mr-1"></i>Needs Attention';
            citationStatusEl.className = 'text-red-600';
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
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-pulse
        ${type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-yellow-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} mr-2"></i>
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