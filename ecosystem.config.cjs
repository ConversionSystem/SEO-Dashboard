// PM2 configuration for SEO Dashboard development
module.exports = {
  apps: [
    {
      name: 'seo-dashboard',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=DB=seo-dashboard-auth --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: false,
      max_memory_restart: '1G'
    }
  ]
}