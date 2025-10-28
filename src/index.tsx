import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { logger } from 'hono/logger'
import { DataForSEOService } from './dataforseo-service'

// Types
type Bindings = {
  DATAFORSEO_LOGIN: string
  DATAFORSEO_PASSWORD: string
  DASHBOARD_API_KEY: string
  SEO_CACHE?: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))

// API Routes

// Get SERP results for a keyword
app.post('/api/seo/serp', async (c) => {
  try {
    const body = await c.req.json()
    const { keyword, location = 'United States', language = 'English', device = 'desktop' } = body
    
    if (!keyword) {
      return c.json({ error: 'Keyword is required' }, 400)
    }
    
    // Check cache first if KV is available
    const cacheKey = `serp:${keyword}:${location}:${language}:${device}`
    if (c.env.SEO_CACHE) {
      const cached = await c.env.SEO_CACHE.get(cacheKey, 'json')
      if (cached) {
        return c.json({ ...cached, cached: true })
      }
    }
    
    // Initialize DataForSEO service
    const service = new DataForSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.getSERPResults(keyword, location, language)
    
    // Cache for 1 hour
    if (c.env.SEO_CACHE) {
      await c.env.SEO_CACHE.put(cacheKey, JSON.stringify(result), {
        expirationTtl: 3600
      })
    }
    
    return c.json(result)
  } catch (error: any) {
    console.error('SERP API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get keyword suggestions
app.post('/api/seo/keywords', async (c) => {
  try {
    const body = await c.req.json()
    const { seed, location = 'United States', language = 'English' } = body
    
    if (!seed) {
      return c.json({ error: 'Seed keyword is required' }, 400)
    }
    
    // Initialize DataForSEO service
    const service = new DataForSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.getKeywordSuggestions(seed, location, language)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Keywords API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get domain overview
app.post('/api/seo/domain', async (c) => {
  try {
    const body = await c.req.json()
    const { domain, location = 'United States', language = 'English' } = body
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400)
    }
    
    // Initialize DataForSEO service
    const service = new DataForSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.getDomainOverview(domain)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Domain API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get backlinks for a domain
app.post('/api/seo/backlinks', async (c) => {
  try {
    const body = await c.req.json()
    const { domain, limit = 100 } = body
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400)
    }
    
    // Initialize DataForSEO service
    const service = new DataForSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.getBacklinks(domain, limit)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Backlinks API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get search volume for multiple keywords
app.post('/api/seo/search-volume', async (c) => {
  try {
    const body = await c.req.json()
    const { keywords, location = 'United States', language = 'English' } = body
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return c.json({ error: 'Keywords array is required' }, 400)
    }
    
    // Initialize DataForSEO service
    const service = new DataForSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.getSearchVolume(keywords, location, language)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Search Volume API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SEO Dashboard API',
    version: '1.0.0'
  })
})

// Account info endpoint
app.get('/api/seo/account', async (c) => {
  try {
    const auth = btoa(`${c.env.DATAFORSEO_LOGIN}:${c.env.DATAFORSEO_PASSWORD}`)
    
    const response = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch account data')
    }
    
    const data = await response.json()
    
    if (data.tasks && data.tasks[0] && data.tasks[0].result) {
      const userData = data.tasks[0].result[0]
      return c.json({
        login: userData.login,
        balance: userData.money?.balance || 0,
        total_tasks: userData.rates?.total_tasks_count || 0,
        timestamp: new Date().toISOString()
      })
    }
    
    return c.json({ error: 'Unable to fetch account data' }, 500)
  } catch (error: any) {
    console.error('Account API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Main dashboard page
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Dashboard - Conversion System</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome Icons -->
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Custom Styles -->
    <style>
        :root {
            --deep-blue: #172B42;
            --orange-accent: #E05E0F;
            --teal-highlight: #4D9A88;
            --white: #FFFFFF;
        }
        
        body {
            background-color: var(--deep-blue);
            color: var(--white);
        }
        
        .bg-brand-blue { background-color: var(--deep-blue); }
        .bg-brand-orange { background-color: var(--orange-accent); }
        .bg-brand-teal { background-color: var(--teal-highlight); }
        .text-brand-orange { color: var(--orange-accent); }
        .text-brand-teal { color: var(--teal-highlight); }
        .border-brand-orange { border-color: var(--orange-accent); }
        .border-brand-teal { border-color: var(--teal-highlight); }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }
        
        .loading-spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .pulse-dot {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="min-h-screen">
    <div id="app"></div>
    
    <!-- Axios for HTTP requests -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    
    <!-- Main Application -->
    <script src="/static/app.js"></script>
    
    <!-- Initialize account info on load -->
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const response = await fetch('/api/seo/account');
                const data = await response.json();
                if (data.balance !== undefined) {
                    console.log('DataForSEO Account Connected:', data.login);
                    console.log('Balance: $' + data.balance.toFixed(2));
                }
            } catch (error) {
                console.error('Failed to fetch account info:', error);
            }
        });
    </script>
</body>
</html>
  `)
})

export default app