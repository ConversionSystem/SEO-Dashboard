import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('/*', cors())

// Real-time metrics endpoint
app.get('/metrics', async (c) => {
    // Simulate real-time metrics with some variation
    const baseMetrics = {
        gmbVisibility: 82,
        localPackRank: 3,
        reviewScore: 4.5,
        citationScore: 85
    };
    
    // Add some random variation to simulate real-time changes
    const metrics = {
        gmbVisibility: baseMetrics.gmbVisibility + (Math.random() - 0.5) * 5,
        localPackRank: Math.random() > 0.8 ? baseMetrics.localPackRank + Math.floor(Math.random() * 3) - 1 : baseMetrics.localPackRank,
        reviewScore: (baseMetrics.reviewScore + (Math.random() - 0.5) * 0.2).toFixed(1),
        citationScore: baseMetrics.citationScore + Math.floor((Math.random() - 0.5) * 10),
        lastUpdate: new Date().toISOString(),
        changes: {
            gmbVisibility: (Math.random() - 0.5) * 2,
            localPackRank: Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0,
            reviewCount: Math.floor(Math.random() * 3),
            newCitations: Math.floor(Math.random() * 2)
        }
    };
    
    return c.json(metrics);
});

// GMB insights endpoint
app.get('/gmb/insights', async (c) => {
    const insights = {
        searchQueries: [
            { query: 'seo services near me', count: 342 + Math.floor(Math.random() * 20), trend: 'up' },
            { query: 'digital marketing agency', count: 287 + Math.floor(Math.random() * 20), trend: 'stable' },
            { query: 'local seo company', count: 198 + Math.floor(Math.random() * 20), trend: 'up' },
            { query: 'web design services', count: 156 + Math.floor(Math.random() * 20), trend: 'down' },
            { query: 'marketing consultant', count: 124 + Math.floor(Math.random() * 20), trend: 'up' }
        ],
        customerActions: {
            calls: Math.floor(Math.random() * 50) + 20,
            directions: Math.floor(Math.random() * 100) + 50,
            websiteClicks: Math.floor(Math.random() * 200) + 100,
            photos: Math.floor(Math.random() * 500) + 200
        },
        views: {
            search: Math.floor(Math.random() * 1000) + 500,
            maps: Math.floor(Math.random() * 800) + 400,
            total: Math.floor(Math.random() * 2000) + 1000
        },
        performance: {
            hourly: generateHourlyData(24),
            daily: generateDailyData(7),
            monthly: generateMonthlyData(3)
        },
        lastUpdate: new Date().toISOString()
    };
    
    return c.json(insights);
});

// Local rankings endpoint
app.get('/rankings/local', async (c) => {
    const keywords = [
        'digital marketing agency',
        'seo services near me',
        'web design company',
        'local seo expert',
        'marketing consultant',
        'ppc management',
        'social media marketing',
        'content marketing agency'
    ];
    
    const locations = [
        { name: 'Downtown', lat: 40.7128, lng: -74.0060 },
        { name: 'North Side', lat: 40.7282, lng: -74.0776 },
        { name: 'West End', lat: 40.7489, lng: -74.0522 },
        { name: 'City Center', lat: 40.7589, lng: -73.9851 },
        { name: 'East District', lat: 40.7614, lng: -73.9776 }
    ];
    
    const rankings = keywords.map(keyword => {
        const location = locations[Math.floor(Math.random() * locations.length)];
        return {
            keyword,
            location: location.name,
            coordinates: { lat: location.lat, lng: location.lng },
            mapPackRank: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null,
            organicRank: Math.floor(Math.random() * 20) + 1,
            featuredSnippet: Math.random() > 0.9,
            peopleAlsoAsk: Math.random() > 0.7,
            localPackFeatures: {
                hasReviews: true,
                hasPhotos: Math.random() > 0.3,
                hasHours: true,
                hasWebsite: true
            },
            competitors: generateCompetitorRanks(5),
            lastChecked: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            change: Math.floor(Math.random() * 5) - 2
        };
    });
    
    return c.json({
        rankings,
        summary: {
            totalKeywords: keywords.length,
            top3Count: rankings.filter(r => r.mapPackRank && r.mapPackRank <= 3).length,
            averageRank: Math.round(rankings.reduce((acc, r) => acc + (r.mapPackRank || 20), 0) / rankings.length),
            improving: rankings.filter(r => r.change > 0).length,
            declining: rankings.filter(r => r.change < 0).length
        }
    });
});

// Competitor tracking endpoint
app.get('/competitors', async (c) => {
    const competitors = [
        { id: 1, name: 'Digital Pro Marketing', domain: 'digitalpro.com' },
        { id: 2, name: 'Local SEO Experts', domain: 'localseoexperts.com' },
        { id: 3, name: 'City Marketing Group', domain: 'citymarketing.com' },
        { id: 4, name: 'Growth Digital Agency', domain: 'growthdigital.com' }
    ];
    
    const competitorData = competitors.map(comp => ({
        ...comp,
        metrics: {
            gmbVisibility: Math.floor(Math.random() * 100),
            avgReviewScore: (Math.random() * 2 + 3).toFixed(1),
            reviewCount: Math.floor(Math.random() * 500) + 50,
            citationCount: Math.floor(Math.random() * 100) + 20,
            localPackAppearances: Math.floor(Math.random() * 50),
            shareOfVoice: Math.floor(Math.random() * 30) + 10
        },
        rankings: generateCompetitorRanks(10),
        recentActivity: {
            newReviews: Math.floor(Math.random() * 10),
            newCitations: Math.floor(Math.random() * 5),
            rankingChanges: Math.floor(Math.random() * 10) - 5,
            gmbUpdates: Math.random() > 0.7
        },
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
        lastAnalyzed: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
    
    // Calculate share of voice
    const totalSoV = competitorData.reduce((acc, c) => acc + c.metrics.shareOfVoice, 0);
    const yourSoV = 100 - totalSoV;
    
    return c.json({
        competitors: competitorData,
        shareOfVoice: {
            yourBusiness: yourSoV,
            competitors: competitorData.map(c => ({
                name: c.name,
                percentage: c.metrics.shareOfVoice
            }))
        },
        alerts: generateCompetitorAlerts(competitorData)
    });
});

// Reviews monitoring endpoint
app.get('/reviews/monitor', async (c) => {
    const platforms = ['Google', 'Yelp', 'Facebook', 'TripAdvisor', 'BBB'];
    
    const reviews = {
        summary: {
            totalReviews: 342,
            averageRating: 4.5,
            responseRate: 87,
            averageResponseTime: '2 hours',
            sentiment: {
                positive: 75,
                neutral: 20,
                negative: 5
            }
        },
        recent: generateRecentReviews(10),
        platforms: platforms.map(platform => ({
            name: platform,
            rating: (Math.random() + 4).toFixed(1),
            reviewCount: Math.floor(Math.random() * 100) + 10,
            lastReview: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            responseRate: Math.floor(Math.random() * 40) + 60,
            needsResponse: Math.floor(Math.random() * 5)
        })),
        keywords: {
            positive: ['professional', 'excellent', 'responsive', 'results', 'recommend'],
            negative: ['slow', 'expensive', 'communication'],
            trending: ['local seo', 'google ranking', 'website']
        },
        alerts: [
            { type: 'new', count: 3, platform: 'Google' },
            { type: 'negative', count: 1, platform: 'Yelp' },
            { type: 'needsResponse', count: 5, platform: 'All' }
        ]
    };
    
    return c.json(reviews);
});

// Citations monitoring endpoint
app.get('/citations/monitor', async (c) => {
    const directories = [
        'Yelp', 'Yellow Pages', 'Facebook', 'Bing Places', 'Apple Maps',
        'Foursquare', 'TripAdvisor', 'BBB', 'Angie\'s List', 'Thumbtack',
        'Houzz', 'Nextdoor', 'Alignable', 'Manta', 'Merchant Circle'
    ];
    
    const citations = directories.map(directory => ({
        directory,
        status: Math.random() > 0.3 ? 'listed' : Math.random() > 0.5 ? 'pending' : 'missing',
        napConsistency: Math.random() > 0.2 ? Math.floor(Math.random() * 30) + 70 : 0,
        details: {
            name: Math.random() > 0.1,
            address: Math.random() > 0.1,
            phone: Math.random() > 0.15,
            website: Math.random() > 0.2,
            hours: Math.random() > 0.4,
            categories: Math.random() > 0.3,
            photos: Math.random() > 0.5,
            description: Math.random() > 0.4
        },
        lastVerified: new Date(Date.now() - Math.random() * 604800000).toISOString(),
        authority: Math.floor(Math.random() * 50) + 50,
        issues: generateCitationIssues()
    }));
    
    const summary = {
        total: citations.length,
        listed: citations.filter(c => c.status === 'listed').length,
        pending: citations.filter(c => c.status === 'pending').length,
        missing: citations.filter(c => c.status === 'missing').length,
        consistent: citations.filter(c => c.napConsistency >= 90).length,
        needsUpdate: citations.filter(c => c.napConsistency < 90 && c.napConsistency > 0).length,
        opportunities: directories.length + Math.floor(Math.random() * 10),
        averageConsistency: Math.round(
            citations.filter(c => c.napConsistency > 0).reduce((acc, c) => acc + c.napConsistency, 0) /
            citations.filter(c => c.napConsistency > 0).length
        )
    };
    
    return c.json({
        citations,
        summary,
        recommendations: [
            'Complete missing listings on high-authority directories',
            'Update inconsistent NAP information on Yellow Pages',
            'Add photos and business hours to all listings',
            'Claim and verify Bing Places listing',
            'Respond to questions on Google My Business'
        ]
    });
});

// Real-time alerts endpoint
app.get('/alerts', async (c) => {
    const alertTypes = [
        { type: 'ranking', severity: 'success', title: 'Ranking Improved', message: 'Moved up 3 positions for "seo services"' },
        { type: 'review', severity: 'info', title: 'New Review', message: '5-star review received on Google' },
        { type: 'competitor', severity: 'warning', title: 'Competitor Activity', message: 'Competitor A improved ranking for target keyword' },
        { type: 'citation', severity: 'success', title: 'Citation Added', message: 'Successfully listed on Bing Places' },
        { type: 'gmb', severity: 'info', title: 'GMB Update', message: 'Customer actions increased by 25% today' }
    ];
    
    const alerts = [];
    const count = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < count; i++) {
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        alerts.push({
            id: Date.now() + i,
            ...alert,
            timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            read: false,
            actionRequired: Math.random() > 0.7
        });
    }
    
    return c.json({
        alerts: alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        unreadCount: alerts.filter(a => !a.read).length,
        actionRequired: alerts.filter(a => a.actionRequired).length
    });
});

// WebSocket endpoint for real-time updates (simulated with SSE)
app.get('/stream', async (c) => {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();
            
            // Send updates every 5 seconds
            const interval = setInterval(() => {
                const update = {
                    type: 'metrics_update',
                    data: {
                        gmbVisibility: 82 + (Math.random() - 0.5) * 5,
                        newReview: Math.random() > 0.8,
                        rankingChange: Math.random() > 0.7 ? Math.floor(Math.random() * 3) - 1 : 0,
                        competitorAlert: Math.random() > 0.9
                    },
                    timestamp: new Date().toISOString()
                };
                
                const message = `data: ${JSON.stringify(update)}\n\n`;
                controller.enqueue(encoder.encode(message));
            }, 5000);
            
            // Clean up on close
            c.req.raw.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        }
    });
    
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
});

// Helper functions
function generateHourlyData(hours: number) {
    return Array(hours).fill(0).map((_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 100) + 20,
        actions: Math.floor(Math.random() * 20) + 5,
        calls: Math.floor(Math.random() * 10)
    }));
}

function generateDailyData(days: number) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    return Array(days).fill(0).map((_, i) => {
        const dayIndex = (today - days + i + 7) % 7;
        return {
            day: dayNames[dayIndex],
            views: Math.floor(Math.random() * 500) + 100,
            actions: Math.floor(Math.random() * 100) + 20,
            conversions: Math.floor(Math.random() * 50) + 10
        };
    });
}

function generateMonthlyData(months: number) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array(months).fill(0).map((_, i) => {
        const monthIndex = (currentMonth - months + i + 12) % 12;
        return {
            month: monthNames[monthIndex],
            views: Math.floor(Math.random() * 5000) + 2000,
            actions: Math.floor(Math.random() * 1000) + 500,
            conversions: Math.floor(Math.random() * 500) + 100
        };
    });
}

function generateCompetitorRanks(count: number) {
    const keywords = ['seo services', 'digital marketing', 'web design', 'local seo', 'ppc management'];
    return keywords.slice(0, count).map(keyword => ({
        keyword,
        rank: Math.floor(Math.random() * 20) + 1,
        change: Math.floor(Math.random() * 5) - 2
    }));
}

function generateRecentReviews(count: number) {
    const names = ['Sarah M.', 'John D.', 'Emily R.', 'Michael T.', 'Jessica L.', 'David K.', 'Amanda S.', 'Robert H.'];
    const platforms = ['Google', 'Yelp', 'Facebook'];
    const comments = [
        'Excellent service! Our rankings improved significantly.',
        'Very professional team. Great results.',
        'Helped us dominate local search. Highly recommend!',
        'Outstanding SEO strategy and execution.',
        'Best digital marketing agency in town.',
        'Great communication and results.',
        'Our business has grown thanks to their efforts.',
        'Professional, responsive, and effective.'
    ];
    
    return Array(count).fill(0).map((_, i) => ({
        id: Date.now() + i,
        author: names[Math.floor(Math.random() * names.length)],
        rating: Math.floor(Math.random() * 2) + 4,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        comment: comments[Math.floor(Math.random() * comments.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        responded: Math.random() > 0.3,
        sentiment: Math.random() > 0.2 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative'
    }));
}

function generateCitationIssues() {
    const issues = [];
    if (Math.random() > 0.7) issues.push('Incorrect phone number');
    if (Math.random() > 0.8) issues.push('Old address listed');
    if (Math.random() > 0.9) issues.push('Missing website');
    if (Math.random() > 0.85) issues.push('Wrong business hours');
    return issues;
}

function generateCompetitorAlerts(competitors: any[]) {
    const alerts = [];
    
    competitors.forEach(comp => {
        if (comp.recentActivity.newReviews > 5) {
            alerts.push({
                competitor: comp.name,
                type: 'reviews',
                message: `${comp.name} received ${comp.recentActivity.newReviews} new reviews`
            });
        }
        if (comp.recentActivity.rankingChanges > 3) {
            alerts.push({
                competitor: comp.name,
                type: 'rankings',
                message: `${comp.name} improved rankings by ${comp.recentActivity.rankingChanges} positions`
            });
        }
    });
    
    return alerts;
}

export default app