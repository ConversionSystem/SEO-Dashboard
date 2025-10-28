import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { logger } from 'hono/logger'

// Types
type Bindings = {
  DATAFORSEO_LOGIN: string
  DATAFORSEO_PASSWORD: string
  DASHBOARD_API_KEY: string
  SEO_CACHE?: KVNamespace
}

type Variables = {
  dataforseoAuth: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

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

// DataForSEO Auth Middleware
app.use('/api/seo/*', async (c, next) => {
  const { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } = c.env
  
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    return c.json({ error: 'DataForSEO credentials not configured' }, 500)
  }
  
  // Store base64 encoded credentials for API calls
  const auth = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`)
  c.set('dataforseoAuth', auth)
  
  await next()
})

// Helper function for DataForSEO API calls
async function callDataForSEO(endpoint: string, data: any, auth: string) {
  const response = await fetch(`https://api.dataforseo.com/v3${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([data])
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DataForSEO API error: ${error}`)
  }
  
  return await response.json()
}

// API Routes

// Get SERP results for a keyword
app.post('/api/seo/serp', async (c) => {
  try {
    const body = await c.req.json()
    const { keyword, location = 'United States', language = 'en', device = 'desktop' } = body
    
    if (!keyword) {
      return c.json({ error: 'Keyword is required' }, 400)
    }
    
    const auth = c.get('dataforseoAuth')
    
    // Check cache first if KV is available
    const cacheKey = `serp:${keyword}:${location}:${language}:${device}`
    if (c.env.SEO_CACHE) {
      const cached = await c.env.SEO_CACHE.get(cacheKey, 'json')
      if (cached) {
        return c.json({ ...cached, cached: true })
      }
    }
    
    const data = {
      keyword,
      location_name: location,
      language_name: language,
      device,
      depth: 10
    }
    
    const result = await callDataForSEO('/serp/google/organic/live/advanced', data, auth)
    
    // Parse and format the response
    const formattedResult = {
      keyword,
      timestamp: new Date().toISOString(),
      results: result?.tasks?.[0]?.result?.[0]?.items || [],
      total_results: result?.tasks?.[0]?.result?.[0]?.se_results_count || 0
    }
    
    // Cache for 1 hour
    if (c.env.SEO_CACHE) {
      await c.env.SEO_CACHE.put(cacheKey, JSON.stringify(formattedResult), {
        expirationTtl: 3600
      })
    }
    
    return c.json(formattedResult)
  } catch (error: any) {
    console.error('SERP API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get keyword suggestions
app.post('/api/seo/keywords', async (c) => {
  try {
    const body = await c.req.json()
    const { seed, location = 'United States', language = 'en' } = body
    
    if (!seed) {
      return c.json({ error: 'Seed keyword is required' }, 400)
    }
    
    const auth = c.get('dataforseoAuth')
    
    const data = {
      keywords: [seed],
      location_name: location,
      language_name: language,
      include_seed_keyword: true,
      sort_by: 'search_volume',
      limit: 100
    }
    
    const result = await callDataForSEO('/keywords_data/google_ads/keywords_for_keywords/live', data, auth)
    
    const formattedResult = {
      seed,
      timestamp: new Date().toISOString(),
      keywords: result?.tasks?.[0]?.result || [],
      total_keywords: result?.tasks?.[0]?.result?.length || 0
    }
    
    return c.json(formattedResult)
  } catch (error: any) {
    console.error('Keywords API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get domain overview
app.post('/api/seo/domain', async (c) => {
  try {
    const body = await c.req.json()
    const { domain, location = 'United States', language = 'en' } = body
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400)
    }
    
    const auth = c.get('dataforseoAuth')
    
    // Get domain metrics
    const data = {
      target: domain,
      location_name: location,
      language_name: language,
      include_subdomains: false
    }
    
    const result = await callDataForSEO('/domain_analytics/ahrefs/domain_metrics/live', data, auth)
    
    const formattedResult = {
      domain,
      timestamp: new Date().toISOString(),
      metrics: result?.tasks?.[0]?.result?.[0] || {}
    }
    
    return c.json(formattedResult)
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
    
    const auth = c.get('dataforseoAuth')
    
    const data = {
      target: domain,
      mode: 'as_is',
      filters: ['dofollow', '=', true],
      limit
    }
    
    const result = await callDataForSEO('/backlinks/backlinks/live', data, auth)
    
    const formattedResult = {
      domain,
      timestamp: new Date().toISOString(),
      backlinks: result?.tasks?.[0]?.result?.[0]?.items || [],
      total_backlinks: result?.tasks?.[0]?.result?.[0]?.total_count || 0
    }
    
    return c.json(formattedResult)
  } catch (error: any) {
    console.error('Backlinks API error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get search volume for multiple keywords
app.post('/api/seo/search-volume', async (c) => {
  try {
    const body = await c.req.json()
    const { keywords, location = 'United States', language = 'en' } = body
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return c.json({ error: 'Keywords array is required' }, 400)
    }
    
    const auth = c.get('dataforseoAuth')
    
    const data = {
      keywords,
      location_name: location,
      language_name: language
    }
    
    const result = await callDataForSEO('/keywords_data/google/search_volume/live', data, auth)
    
    const formattedResult = {
      keywords,
      timestamp: new Date().toISOString(),
      data: result?.tasks?.[0]?.result || [],
      total: result?.tasks?.[0]?.result?.length || 0
    }
    
    return c.json(formattedResult)
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
    service: 'SEO Dashboard API'
  })
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
    </style>
</head>
<body class="min-h-screen">
    <div id="app"></div>
    
    <!-- Axios for HTTP requests -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    
    <!-- Main Application -->
    <script src="/static/app.js"></script>
</body>
</html>
  `)
})

export default app