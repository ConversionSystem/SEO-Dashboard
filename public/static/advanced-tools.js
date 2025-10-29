// Advanced SEO Tools Module
class AdvancedSEOTools {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.currentTool = null;
        this.data = {};
    }

    // Render advanced tools section
    renderTools(container) {
        container.innerHTML = `
            <div class="glass-card rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-6">Advanced SEO Tools</h2>
                
                <!-- Tool Selection Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    ${this.renderToolCards()}
                </div>
                
                <!-- Tool Content Area -->
                <div id="advancedToolContent" class="mt-8">
                    <!-- Tool interface will be loaded here -->
                </div>
            </div>
        `;

        this.attachToolListeners();
    }

    renderToolCards() {
        const tools = [
            {
                id: 'rank-tracker',
                icon: 'fa-chart-line',
                title: 'Rank Tracker',
                description: 'Monitor keyword positions over time',
                color: 'text-brand-teal'
            },
            {
                id: 'content-analyzer',
                icon: 'fa-file-alt',
                title: 'Content Analyzer',
                description: 'On-page SEO optimization analysis',
                color: 'text-brand-orange'
            },
            {
                id: 'competitor-gap',
                icon: 'fa-users',
                title: 'Competitor Gap',
                description: 'Find keyword opportunities from competitors',
                color: 'text-purple-400'
            },
            {
                id: 'technical-audit',
                icon: 'fa-cogs',
                title: 'Technical Audit',
                description: 'Complete technical SEO site audit',
                color: 'text-red-400'
            },
            {
                id: 'keyword-clustering',
                icon: 'fa-project-diagram',
                title: 'Keyword Clustering',
                description: 'Group keywords by topic and intent',
                color: 'text-green-400'
            },
            {
                id: 'serp-features',
                icon: 'fa-trophy',
                title: 'SERP Features',
                description: 'Track featured snippets and PAA',
                color: 'text-yellow-400'
            },
            {
                id: 'local-seo',
                icon: 'fa-map-marker-alt',
                title: 'Local SEO',
                description: 'Google My Business and local rankings',
                color: 'text-blue-400'
            },
            {
                id: 'question-finder',
                icon: 'fa-question-circle',
                title: 'Question Finder',
                description: 'Find "People Also Ask" opportunities',
                color: 'text-indigo-400'
            },
            {
                id: 'bulk-analyzer',
                icon: 'fa-list',
                title: 'Bulk URL Analyzer',
                description: 'Analyze multiple URLs at once',
                color: 'text-pink-400'
            }
        ];

        return tools.map(tool => `
            <div class="tool-card glass-card p-4 cursor-pointer hover-lift" data-tool="${tool.id}">
                <div class="flex items-center space-x-3 mb-2">
                    <i class="fas ${tool.icon} text-2xl ${tool.color}"></i>
                    <h3 class="font-bold">${tool.title}</h3>
                </div>
                <p class="text-sm text-gray-400">${tool.description}</p>
            </div>
        `).join('');
    }

    attachToolListeners() {
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const toolId = e.currentTarget.dataset.tool;
                this.loadTool(toolId);
            });
        });
    }

    loadTool(toolId) {
        this.currentTool = toolId;
        const contentArea = document.getElementById('advancedToolContent');
        
        // Highlight selected tool
        document.querySelectorAll('.tool-card').forEach(card => {
            card.classList.remove('border-2', 'border-brand-orange');
            if (card.dataset.tool === toolId) {
                card.classList.add('border-2', 'border-brand-orange');
            }
        });

        switch(toolId) {
            case 'rank-tracker':
                this.renderRankTracker(contentArea);
                break;
            case 'content-analyzer':
                this.renderContentAnalyzer(contentArea);
                break;
            case 'competitor-gap':
                this.renderCompetitorGap(contentArea);
                break;
            case 'technical-audit':
                this.renderTechnicalAudit(contentArea);
                break;
            case 'keyword-clustering':
                this.renderKeywordClustering(contentArea);
                break;
            case 'serp-features':
                this.renderSERPFeatures(contentArea);
                break;
            case 'local-seo':
                this.renderLocalSEO(contentArea);
                break;
            case 'question-finder':
                this.renderQuestionFinder(contentArea);
                break;
            case 'bulk-analyzer':
                this.renderBulkAnalyzer(contentArea);
                break;
        }
    }

    // 1. RANK TRACKER
    renderRankTracker(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-chart-line text-brand-teal mr-2"></i>
                    Rank Tracker
                </h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm mb-2">Domain to Track</label>
                        <input type="text" id="rankDomain" placeholder="example.com" 
                               class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                    </div>
                    
                    <div>
                        <label class="block text-sm mb-2">Keywords (one per line)</label>
                        <textarea id="rankKeywords" rows="4" placeholder="keyword 1\nkeyword 2\nkeyword 3"
                                  class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal"></textarea>
                    </div>
                </div>
                
                <button onclick="advancedTools.trackRankings()" 
                        class="mt-4 px-6 py-2 bg-brand-orange text-white rounded hover:opacity-90">
                    <i class="fas fa-search mr-2"></i>Track Rankings
                </button>
                
                <div id="rankResults" class="mt-6"></div>
            </div>
        `;
    }

    async trackRankings() {
        const domain = document.getElementById('rankDomain').value.trim();
        const keywords = document.getElementById('rankKeywords').value
            .split('\n')
            .map(k => k.trim())
            .filter(k => k);
        
        if (!domain || keywords.length === 0) {
            alert('Please enter a domain and at least one keyword');
            return;
        }

        const resultsDiv = document.getElementById('rankResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Tracking rankings...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/rank-tracking', {
                domain,
                keywords: keywords.slice(0, 10) // Limit to 10 keywords
            });

            const data = response.data;
            
            // Add summary stats
            const rankedCount = data.rankings.filter(r => r.position !== null).length;
            const avgPosition = data.rankings.filter(r => r.position).reduce((sum, r) => sum + r.position, 0) / rankedCount || 0;
            
            resultsDiv.innerHTML = `
                <div class="space-y-4">
                    <!-- Summary Stats -->
                    <div class="grid grid-cols-3 gap-4">
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-brand-teal">${rankedCount}/${data.rankings.length}</div>
                            <div class="text-sm text-gray-400">Keywords Ranking</div>
                        </div>
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-brand-orange">${avgPosition.toFixed(1)}</div>
                            <div class="text-sm text-gray-400">Average Position</div>
                        </div>
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-green-400">${data.rankings.filter(r => r.position && r.position <= 10).length}</div>
                            <div class="text-sm text-gray-400">Top 10 Rankings</div>
                        </div>
                    </div>
                    
                    <!-- Rankings Table -->
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">Rankings for ${data.domain}</h4>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-700">
                                    <th class="text-left py-2">Keyword</th>
                                    <th class="text-left py-2">Position</th>
                                    <th class="text-left py-2">URL</th>
                                    <th class="text-left py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.rankings.map(r => `
                                    <tr class="border-b border-gray-800">
                                        <td class="py-2">${r.keyword}</td>
                                        <td class="py-2">
                                            ${r.position ? `
                                                <span class="px-2 py-1 rounded text-xs ${
                                                    r.position <= 3 ? 'bg-green-500' :
                                                    r.position <= 10 ? 'bg-yellow-500' :
                                                    r.position <= 30 ? 'bg-orange-500' : 'bg-red-500'
                                                } bg-opacity-20">
                                                    #${r.position}
                                                </span>
                                            ` : '<span class="text-gray-500">Not ranking</span>'}
                                        </td>
                                        <td class="py-2 text-sm">
                                            ${r.url ? `<a href="${r.url}" target="_blank" class="text-brand-teal hover:underline">${r.url.substring(0, 50)}...</a>` : '-'}
                                        </td>
                                        <td class="py-2">
                                            ${r.position ? 
                                                '<i class="fas fa-check text-green-400"></i>' : 
                                                '<i class="fas fa-times text-red-400"></i>'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Rank tracking error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    // 2. CONTENT ANALYZER
    renderContentAnalyzer(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-file-alt text-brand-orange mr-2"></i>
                    Content Analyzer
                </h3>
                
                <div class="mb-4">
                    <label class="block text-sm mb-2">Page URL to Analyze</label>
                    <div class="flex space-x-2">
                        <input type="url" id="contentUrl" placeholder="https://example.com/page" 
                               class="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                        <button onclick="advancedTools.analyzeContent()" 
                                class="px-6 py-2 bg-brand-orange text-white rounded hover:opacity-90">
                            <i class="fas fa-search mr-2"></i>Analyze
                        </button>
                    </div>
                </div>
                
                <div id="contentResults"></div>
            </div>
        `;
    }

    async analyzeContent() {
        const url = document.getElementById('contentUrl').value.trim();
        
        if (!url) {
            alert('Please enter a URL to analyze');
            return;
        }

        const resultsDiv = document.getElementById('contentResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Analyzing content...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/content-analyzer', { url });
            const data = response.data;

            resultsDiv.innerHTML = `
                <div class="space-y-6">
                    <!-- SEO Score -->
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">SEO Score</h4>
                        <div class="flex items-center space-x-4">
                            <div class="text-4xl font-bold ${
                                data.seo_score >= 80 ? 'text-green-400' :
                                data.seo_score >= 60 ? 'text-yellow-400' :
                                'text-red-400'
                            }">
                                ${data.seo_score || 0}/100
                            </div>
                            <div class="flex-1">
                                <div class="h-4 bg-gray-700 rounded-full overflow-hidden">
                                    <div class="h-full ${
                                        data.seo_score >= 80 ? 'bg-green-400' :
                                        data.seo_score >= 60 ? 'bg-yellow-400' :
                                        'bg-red-400'
                                    }" style="width: ${data.seo_score || 0}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Page Details -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                            <h4 class="font-bold mb-2">Meta Information</h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <span class="text-gray-400">Title:</span>
                                    <div class="text-white">${data.title || 'No title'}</div>
                                </div>
                                <div>
                                    <span class="text-gray-400">Description:</span>
                                    <div class="text-white">${data.description || 'No description'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                            <h4 class="font-bold mb-2">Content Metrics</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span class="text-gray-400">Word Count:</span>
                                    <span class="ml-2">${data.word_count || 0}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">H1 Tags:</span>
                                    <span class="ml-2">${data.h1?.length || 0}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">Internal Links:</span>
                                    <span class="ml-2">${data.internal_links || 0}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">External Links:</span>
                                    <span class="ml-2">${data.external_links || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recommendations -->
                    ${data.recommendations && data.recommendations.length > 0 ? `
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                            <h4 class="font-bold mb-2">Recommendations</h4>
                            <ul class="space-y-1">
                                ${data.recommendations.map(rec => `
                                    <li class="flex items-start">
                                        <i class="fas fa-exclamation-triangle text-yellow-400 mt-1 mr-2"></i>
                                        <span class="text-sm">${rec}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('Content analysis error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    // 3. COMPETITOR GAP
    renderCompetitorGap(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-users text-purple-400 mr-2"></i>
                    Competitor Gap Analysis
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm mb-2">Your Domain</label>
                        <input type="text" id="gapDomain" placeholder="yourdomain.com" 
                               class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                    </div>
                    
                    <div>
                        <label class="block text-sm mb-2">Competitors (one per line)</label>
                        <textarea id="gapCompetitors" rows="3" placeholder="competitor1.com\ncompetitor2.com"
                                  class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal"></textarea>
                    </div>
                </div>
                
                <button onclick="advancedTools.analyzeCompetitorGap()" 
                        class="px-6 py-2 bg-purple-500 text-white rounded hover:opacity-90">
                    <i class="fas fa-search mr-2"></i>Find Keyword Gaps
                </button>
                
                <div id="gapResults" class="mt-6"></div>
            </div>
        `;
    }

    async analyzeCompetitorGap() {
        const domain = document.getElementById('gapDomain').value.trim();
        const competitors = document.getElementById('gapCompetitors').value
            .split('\n')
            .map(c => c.trim())
            .filter(c => c);
        
        if (!domain || competitors.length === 0) {
            alert('Please enter your domain and at least one competitor');
            return;
        }

        const resultsDiv = document.getElementById('gapResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Analyzing competitor gaps...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/competitor-gap', {
                domain,
                competitors: competitors.slice(0, 3) // Limit to 3 competitors
            });

            const data = response.data;
            resultsDiv.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-2">Gap Analysis Summary</h4>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold text-purple-400">${data.total_gaps || 0}</div>
                                <div class="text-sm text-gray-400">Total Keyword Gaps</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-green-400">${data.opportunities?.filter(o => o.difficulty < 40).length || 0}</div>
                                <div class="text-sm text-gray-400">Easy Opportunities</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-yellow-400">${data.opportunities?.filter(o => o.search_volume > 1000).length || 0}</div>
                                <div class="text-sm text-gray-400">High Volume Gaps</div>
                            </div>
                        </div>
                    </div>

                    ${data.opportunities && data.opportunities.length > 0 ? `
                        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                            <h4 class="font-bold mb-4">Top Keyword Opportunities</h4>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="border-b border-gray-700">
                                            <th class="text-left py-2">Keyword</th>
                                            <th class="text-left py-2">Competitor</th>
                                            <th class="text-left py-2">Position</th>
                                            <th class="text-left py-2">Volume</th>
                                            <th class="text-left py-2">Difficulty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.opportunities.slice(0, 20).map(opp => `
                                            <tr class="border-b border-gray-800">
                                                <td class="py-2">${opp.keyword}</td>
                                                <td class="py-2 text-sm">${opp.competitor}</td>
                                                <td class="py-2">
                                                    <span class="px-2 py-1 rounded text-xs bg-purple-500 bg-opacity-20">
                                                        #${opp.position}
                                                    </span>
                                                </td>
                                                <td class="py-2">${opp.search_volume}</td>
                                                <td class="py-2">
                                                    <span class="px-2 py-1 rounded text-xs ${
                                                        opp.difficulty < 40 ? 'bg-green-500' :
                                                        opp.difficulty < 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                    } bg-opacity-20">
                                                        ${opp.difficulty}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : '<div class="text-gray-400">No keyword gaps found</div>'}
                </div>
            `;
        } catch (error) {
            console.error('Competitor gap error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    // 4. TECHNICAL AUDIT
    renderTechnicalAudit(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-cogs text-red-400 mr-2"></i>
                    Technical SEO Audit
                </h3>
                
                <div class="mb-4">
                    <label class="block text-sm mb-2">Domain to Audit</label>
                    <div class="flex space-x-2">
                        <input type="text" id="auditDomain" placeholder="example.com" 
                               class="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                        <button onclick="advancedTools.performAudit()" 
                                class="px-6 py-2 bg-red-500 text-white rounded hover:opacity-90">
                            <i class="fas fa-search mr-2"></i>Start Audit
                        </button>
                    </div>
                </div>
                
                <div id="auditResults"></div>
            </div>
        `;
    }

    async performAudit() {
        const domain = document.getElementById('auditDomain').value.trim();
        
        if (!domain) {
            alert('Please enter a domain to audit');
            return;
        }

        const resultsDiv = document.getElementById('auditResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Performing technical audit (this may take a moment)...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/technical-audit', { domain });
            const data = response.data;

            const totalIssues = (data.issues?.errors || 0) + (data.issues?.warnings || 0) + (data.issues?.notices || 0);

            resultsDiv.innerHTML = `
                <div class="space-y-6">
                    <!-- Audit Summary -->
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">Audit Summary for ${domain}</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="text-3xl font-bold text-green-400">${data.crawled_pages || 0}</div>
                                <div class="text-sm text-gray-400">Pages Crawled</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-red-400">${data.issues?.errors || 0}</div>
                                <div class="text-sm text-gray-400">Errors</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-yellow-400">${data.issues?.warnings || 0}</div>
                                <div class="text-sm text-gray-400">Warnings</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-blue-400">${data.issues?.notices || 0}</div>
                                <div class="text-sm text-gray-400">Notices</div>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Issues -->
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">Performance Issues</h4>
                        <div class="space-y-2">
                            ${data.performance?.average_load_time ? `
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Average Load Time:</span>
                                    <span class="${data.performance.average_load_time > 3 ? 'text-red-400' : 'text-green-400'}">
                                        ${data.performance.average_load_time.toFixed(2)}s
                                    </span>
                                </div>
                            ` : ''}
                            <div class="flex justify-between">
                                <span class="text-gray-400">Pages with Duplicate Titles:</span>
                                <span class="${data.performance?.pages_with_duplicate_title > 0 ? 'text-yellow-400' : 'text-green-400'}">
                                    ${data.performance?.pages_with_duplicate_title || 0}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Pages with No Description:</span>
                                <span class="${data.performance?.pages_with_no_description > 0 ? 'text-yellow-400' : 'text-green-400'}">
                                    ${data.performance?.pages_with_no_description || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Technical Issues -->
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">Technical Issues</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Broken Links:</span>
                                <span class="${data.technical?.broken_links > 0 ? 'text-red-400' : 'text-green-400'}">
                                    ${data.technical?.broken_links || 0}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">4xx Errors:</span>
                                <span class="${data.technical?.pages_with_4xx_status > 0 ? 'text-red-400' : 'text-green-400'}">
                                    ${data.technical?.pages_with_4xx_status || 0}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">5xx Errors:</span>
                                <span class="${data.technical?.pages_with_5xx_status > 0 ? 'text-red-400' : 'text-green-400'}">
                                    ${data.technical?.pages_with_5xx_status || 0}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Redirect Chains:</span>
                                <span class="${data.technical?.redirect_chains > 0 ? 'text-yellow-400' : 'text-green-400'}">
                                    ${data.technical?.redirect_chains || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    ${data.note ? `
                        <div class="text-sm text-gray-400 italic">
                            Note: ${data.note}
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('Technical audit error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    // Add other tool implementations...
    renderKeywordClustering(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-project-diagram text-green-400 mr-2"></i>
                    Keyword Clustering
                </h3>
                
                <div class="mb-4">
                    <label class="block text-sm mb-2">Keywords to Cluster (one per line)</label>
                    <textarea id="clusterKeywords" rows="6" 
                              placeholder="marketing automation\nemail marketing software\nCRM tools\nlead generation\nsales automation"
                              class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal"></textarea>
                </div>
                
                <button onclick="advancedTools.clusterKeywords()" 
                        class="px-6 py-2 bg-green-500 text-white rounded hover:opacity-90">
                    <i class="fas fa-sitemap mr-2"></i>Create Clusters
                </button>
                
                <div id="clusterResults" class="mt-6"></div>
            </div>
        `;
    }

    renderSERPFeatures(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-trophy text-yellow-400 mr-2"></i>
                    SERP Features Tracker
                </h3>
                
                <div class="mb-4">
                    <label class="block text-sm mb-2">Keywords to Analyze (one per line)</label>
                    <textarea id="serpFeatureKeywords" rows="4" 
                              placeholder="what is SEO\nhow to improve conversion rate\nmarketing tools"
                              class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal"></textarea>
                </div>
                
                <button onclick="advancedTools.trackSERPFeatures()" 
                        class="px-6 py-2 bg-yellow-500 text-white rounded hover:opacity-90">
                    <i class="fas fa-search mr-2"></i>Analyze SERP Features
                </button>
                
                <div id="serpFeatureResults" class="mt-6"></div>
            </div>
        `;
    }
    
    async trackSERPFeatures() {
        const keywords = document.getElementById('serpFeatureKeywords').value
            .split('\n')
            .map(k => k.trim())
            .filter(k => k);
        
        if (keywords.length === 0) {
            alert('Please enter keywords to analyze');
            return;
        }

        const resultsDiv = document.getElementById('serpFeatureResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Analyzing SERP features...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/serp-features', { 
                keywords: keywords.slice(0, 5) // Limit to 5 for cost
            });
            const data = response.data;
            
            resultsDiv.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">SERP Features Analysis</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-yellow-400">${data.summary?.with_featured_snippets || 0}</div>
                                <div class="text-sm text-gray-400">Featured Snippets</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-400">${data.summary?.with_people_also_ask || 0}</div>
                                <div class="text-sm text-gray-400">People Also Ask</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-400">${data.summary?.with_knowledge_panel || 0}</div>
                                <div class="text-sm text-gray-400">Knowledge Panels</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-400">${data.summary?.with_local_pack || 0}</div>
                                <div class="text-sm text-gray-400">Local Packs</div>
                            </div>
                        </div>
                        
                        ${data.features && data.features.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="border-b border-gray-700">
                                            <th class="text-left py-2">Keyword</th>
                                            <th class="text-center py-2">Featured</th>
                                            <th class="text-center py-2">PAA</th>
                                            <th class="text-center py-2">Knowledge</th>
                                            <th class="text-center py-2">Local</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.features.map(f => `
                                            <tr class="border-b border-gray-800">
                                                <td class="py-2">${f.keyword}</td>
                                                <td class="text-center py-2">
                                                    ${f.has_featured_snippet ? '<i class="fas fa-check text-green-400"></i>' : '-'}
                                                </td>
                                                <td class="text-center py-2">
                                                    ${f.people_also_ask_count > 0 ? `<span class="text-blue-400">${f.people_also_ask_count}</span>` : '-'}
                                                </td>
                                                <td class="text-center py-2">
                                                    ${f.has_knowledge_panel ? '<i class="fas fa-check text-green-400"></i>' : '-'}
                                                </td>
                                                <td class="text-center py-2">
                                                    ${f.has_local_pack ? '<i class="fas fa-check text-green-400"></i>' : '-'}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('SERP features error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    renderLocalSEO(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-map-marker-alt text-blue-400 mr-2"></i>
                    Local SEO Analysis
                </h3>
                
                <!-- New Full Local SEO Tool Button -->
                <div class="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-lg font-semibold text-white mb-2">
                                <i class="fas fa-rocket mr-2"></i>Enhanced Local SEO Tool Available!
                            </h4>
                            <p class="text-gray-300 text-sm">
                                Access our comprehensive Local SEO tool with advanced features:
                            </p>
                            <ul class="mt-2 space-y-1 text-sm text-gray-400">
                                <li><i class="fas fa-check text-green-500 mr-1"></i> Google Map Pack analysis</li>
                                <li><i class="fas fa-check text-green-500 mr-1"></i> Competitor tracking</li>
                                <li><i class="fas fa-check text-green-500 mr-1"></i> Citation management</li>
                                <li><i class="fas fa-check text-green-500 mr-1"></i> Review monitoring</li>
                                <li><i class="fas fa-check text-green-500 mr-1"></i> GMB optimization</li>
                                <li><i class="fas fa-check text-green-500 mr-1"></i> Schema markup generator</li>
                            </ul>
                        </div>
                        <div class="text-center">
                            <button onclick="window.location.href='/local-seo'" 
                                    class="px-6 py-3 bg-brand-teal text-white rounded-lg hover:opacity-90 transition transform hover:scale-105 font-semibold">
                                <i class="fas fa-external-link-alt mr-2"></i>Open Full Tool
                            </button>
                        </div>
                    </div>
                </div>
                
                <p class="text-gray-400 mb-4">Or use the quick analysis below:</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm mb-2">Business Name</label>
                        <input type="text" id="localBusinessName" placeholder="Conversion System" 
                               class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                    </div>
                    <div>
                        <label class="block text-sm mb-2">Location</label>
                        <input type="text" id="localLocation" placeholder="San Francisco" value="United States"
                               class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                    </div>
                </div>
                
                <button onclick="advancedTools.analyzeLocalSEO()" 
                        class="px-6 py-2 bg-blue-500 text-white rounded hover:opacity-90">
                    <i class="fas fa-map mr-2"></i>Quick Analysis
                </button>
                
                <div id="localSEOResults" class="mt-6"></div>
            </div>
        `;
    }
    
    async analyzeLocalSEO() {
        const businessName = document.getElementById('localBusinessName').value.trim();
        const location = document.getElementById('localLocation').value.trim();
        
        if (!businessName) {
            alert('Please enter a business name');
            return;
        }

        const resultsDiv = document.getElementById('localSEOResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Analyzing local SEO...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/local-seo', { 
                business_name: businessName,
                location 
            });
            const data = response.data;
            
            resultsDiv.innerHTML = `
                <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                    <h4 class="font-bold mb-4">Local SEO Results</h4>
                    ${data.found && data.data ? `
                        <div class="space-y-2">
                            <div><span class="text-gray-400">Business:</span> ${data.data.title}</div>
                            <div><span class="text-gray-400">Rating:</span> ${data.data.rating}/5 (${data.data.reviews_count} reviews)</div>
                            <div><span class="text-gray-400">Address:</span> ${data.data.address || 'N/A'}</div>
                            <div><span class="text-gray-400">Phone:</span> ${data.data.phone || 'N/A'}</div>
                            <div><span class="text-gray-400">Category:</span> ${data.data.category || 'N/A'}</div>
                        </div>
                    ` : `
                        <div class="text-gray-400">Business not found in local results. Try adding your business to Google My Business.</div>
                    `}
                    
                    ${data.competitors && data.competitors.length > 0 ? `
                        <div class="mt-4">
                            <h5 class="font-bold mb-2">Top Local Competitors:</h5>
                            <ul class="space-y-1">
                                ${data.competitors.slice(0, 5).map(comp => `
                                    <li class="text-sm">• ${comp.title} - Rating: ${comp.rating?.value || 'N/A'}/5</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('Local SEO error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    renderQuestionFinder(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-question-circle text-indigo-400 mr-2"></i>
                    Question Finder
                </h3>
                
                <div class="mb-4">
                    <label class="block text-sm mb-2">Topic to Find Questions About</label>
                    <input type="text" id="questionTopic" placeholder="e.g., conversion optimization, email marketing" 
                           class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal">
                </div>
                
                <button onclick="advancedTools.findQuestions()" 
                        class="px-6 py-2 bg-indigo-500 text-white rounded hover:opacity-90">
                    <i class="fas fa-search mr-2"></i>Find Questions
                </button>
                
                <div id="questionResults" class="mt-6"></div>
            </div>
        `;
    }
    
    async findQuestions() {
        const topic = document.getElementById('questionTopic').value.trim();
        
        if (!topic) {
            alert('Please enter a topic');
            return;
        }

        const resultsDiv = document.getElementById('questionResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Finding questions...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/question-opportunities', { topic });
            const data = response.data;
            
            resultsDiv.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">Questions Found: ${data.total_questions}</h4>
                        ${data.questions && data.questions.length > 0 ? `
                            <div class="space-y-2">
                                ${data.questions.slice(0, 20).map(q => `
                                    <div class="p-3 bg-gray-900 bg-opacity-50 rounded">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1">
                                                <i class="fas fa-question-circle text-indigo-400 mr-2"></i>
                                                <span>${q.question}</span>
                                            </div>
                                            <div class="text-right text-sm">
                                                ${q.search_volume > 0 ? `
                                                    <span class="text-brand-teal">${q.search_volume.toLocaleString()} vol</span>
                                                ` : ''}
                                                ${q.cpc > 0 ? `
                                                    <span class="text-brand-orange ml-2">$${q.cpc.toFixed(2)}</span>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-gray-400">No questions found for this topic. Try a different topic.</div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Question finder error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    renderBulkAnalyzer(container) {
        container.innerHTML = `
            <div class="border-t border-gray-700 pt-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-list text-pink-400 mr-2"></i>
                    Bulk URL Analyzer
                </h3>
                
                <div class="mb-4">
                    <label class="block text-sm mb-2">URLs to Analyze (one per line, max 10)</label>
                    <textarea id="bulkUrls" rows="5" 
                              placeholder="https://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3"
                              class="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-brand-teal"></textarea>
                </div>
                
                <button onclick="advancedTools.analyzeBulkURLs()" 
                        class="px-6 py-2 bg-pink-500 text-white rounded hover:opacity-90">
                    <i class="fas fa-search mr-2"></i>Analyze URLs
                </button>
                
                <div id="bulkUrlResults" class="mt-6"></div>
            </div>
        `;
    }
    
    async analyzeBulkURLs() {
        const urls = document.getElementById('bulkUrls').value
            .split('\n')
            .map(u => u.trim())
            .filter(u => u && u.startsWith('http'));
        
        if (urls.length === 0) {
            alert('Please enter valid URLs to analyze');
            return;
        }

        const resultsDiv = document.getElementById('bulkUrlResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Analyzing ${urls.length} URLs...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/bulk-urls', { 
                urls: urls.slice(0, 10) // Limit to 10
            });
            const data = response.data;
            
            resultsDiv.innerHTML = `
                <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                    <h4 class="font-bold mb-4">Bulk URL Analysis Results</h4>
                    ${data.results && data.results.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-700">
                                        <th class="text-left py-2">URL</th>
                                        <th class="text-left py-2">Title</th>
                                        <th class="text-center py-2">Status</th>
                                        <th class="text-center py-2">Words</th>
                                        <th class="text-center py-2">Load Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.results.map(r => `
                                        <tr class="border-b border-gray-800">
                                            <td class="py-2 text-sm">
                                                <a href="${r.url}" target="_blank" class="text-brand-teal hover:underline">
                                                    ${r.url.length > 30 ? r.url.substring(0, 30) + '...' : r.url}
                                                </a>
                                            </td>
                                            <td class="py-2 text-sm">${r.title || 'No title'}</td>
                                            <td class="text-center py-2">
                                                <span class="px-2 py-1 rounded text-xs ${
                                                    r.status_code === 200 ? 'bg-green-500' :
                                                    r.status_code === 301 || r.status_code === 302 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                } bg-opacity-20">
                                                    ${r.status_code || 'N/A'}
                                                </span>
                                            </td>
                                            <td class="text-center py-2">${r.word_count || 0}</td>
                                            <td class="text-center py-2">${r.load_time ? r.load_time.toFixed(2) + 's' : 'N/A'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-gray-400">No results available. Note: This feature requires page analysis API access.</div>
                    `}
                </div>
            `;
        } catch (error) {
            console.error('Bulk URL analysis error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }

    async clusterKeywords() {
        const keywords = document.getElementById('clusterKeywords').value
            .split('\n')
            .map(k => k.trim())
            .filter(k => k);
        
        if (keywords.length === 0) {
            alert('Please enter keywords to cluster');
            return;
        }

        const resultsDiv = document.getElementById('clusterResults');
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner loading-spinner text-2xl"></i>
                <div class="mt-2">Creating clusters...</div>
            </div>
        `;

        try {
            const response = await axios.post('/api/seo/advanced/keyword-clustering', { keywords });
            const data = response.data;
            
            resultsDiv.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <h4 class="font-bold mb-4">Keyword Clusters</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${data.clusters.map(cluster => `
                                <div class="bg-gray-900 bg-opacity-50 rounded p-3">
                                    <div class="font-bold text-brand-teal mb-2">
                                        ${cluster.cluster_name} (${cluster.count})
                                    </div>
                                    <div class="text-sm">
                                        ${cluster.keywords.map(kw => `
                                            <span class="inline-block px-2 py-1 m-1 bg-gray-700 rounded">${kw}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Clustering error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded">
                    Error: ${error.response?.data?.error || error.message}
                </div>
            `;
        }
    }
}

// Initialize advanced tools when needed
window.advancedTools = null;