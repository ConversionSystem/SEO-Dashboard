import { Hono } from 'hono'
import { AdvancedSEOService } from './advanced-seo-service'

type Bindings = {
  DATAFORSEO_LOGIN: string
  DATAFORSEO_PASSWORD: string
  SEO_CACHE?: KVNamespace
}

export const advancedRoutes = new Hono<{ Bindings: Bindings }>()

// 1. Rank Tracking
advancedRoutes.post('/rank-tracking', async (c) => {
  try {
    const body = await c.req.json()
    const { keywords, domain, location = 'United States' } = body
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return c.json({ error: 'Keywords array is required' }, 400)
    }
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.trackRankings(keywords, domain, location)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Rank tracking error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 2. Content Analyzer
advancedRoutes.post('/content-analyzer', async (c) => {
  try {
    const body = await c.req.json()
    const { url } = body
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.analyzeContent(url)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Content analysis error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 3. Competitor Gap Analysis
advancedRoutes.post('/competitor-gap', async (c) => {
  try {
    const body = await c.req.json()
    const { domain, competitors } = body
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400)
    }
    
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return c.json({ error: 'Competitors array is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.analyzeCompetitorGap(domain, competitors)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Competitor gap error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 4. Technical SEO Audit
advancedRoutes.post('/technical-audit', async (c) => {
  try {
    const body = await c.req.json()
    const { domain } = body
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.performTechnicalAudit(domain)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Technical audit error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 5. Keyword Clustering
advancedRoutes.post('/keyword-clustering', async (c) => {
  try {
    const body = await c.req.json()
    const { keywords } = body
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return c.json({ error: 'Keywords array is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.clusterKeywords(keywords)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Keyword clustering error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 6. SERP Features Tracker
advancedRoutes.post('/serp-features', async (c) => {
  try {
    const body = await c.req.json()
    const { keywords } = body
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return c.json({ error: 'Keywords array is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.trackSERPFeatures(keywords)
    
    return c.json(result)
  } catch (error: any) {
    console.error('SERP features error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 7. Local SEO Analysis
advancedRoutes.post('/local-seo', async (c) => {
  try {
    const body = await c.req.json()
    const { business_name, location = 'United States' } = body
    
    if (!business_name) {
      return c.json({ error: 'Business name is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.analyzeLocalSEO(business_name, location)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Local SEO error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 8. Question Opportunities (PAA)
advancedRoutes.post('/question-opportunities', async (c) => {
  try {
    const body = await c.req.json()
    const { topic } = body
    
    if (!topic) {
      return c.json({ error: 'Topic is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.findQuestionOpportunities(topic)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Question opportunities error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 9. Bulk URL Analyzer
advancedRoutes.post('/bulk-urls', async (c) => {
  try {
    const body = await c.req.json()
    const { urls } = body
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return c.json({ error: 'URLs array is required' }, 400)
    }
    
    const service = new AdvancedSEOService(c.env.DATAFORSEO_LOGIN, c.env.DATAFORSEO_PASSWORD)
    const result = await service.analyzeBulkURLs(urls)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Bulk URL analysis error:', error)
    return c.json({ error: error.message }, 500)
  }
})