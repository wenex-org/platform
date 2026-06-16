import { withMermaid } from 'vitepress-plugin-mermaid'
import { defineConfig } from 'vitepress'

export default withMermaid(
  defineConfig({
    title: 'Wenex',
    description: 'Documentation for Wenex Platform v1.6.0',
    base: '/platform/',
    srcDir: 'docs',
    outDir: '.vitepress/dist',

    head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/platform/logo.svg' }]],

    vite: {
      build: {
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
          onwarn(warning: any, warn: (_: any) => void) {
            if (warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('node_modules')) return
            warn(warning)
          },
        },
      },
    },

    themeConfig: {
      logo: '/logo.svg',

      nav: [
        { text: 'Getting Started', link: '/getting-started' },
        { text: 'Concepts', link: '/getting-started/overview/' },
        { text: 'API', link: '/api/' },
        { text: 'Services', link: '/getting-started/services/' },
        { text: 'Workers', link: '/getting-started/workers/' },
        { text: 'SDK', link: '/sdk/' },
        { text: 'MCP', link: '/mcp/' },
        { text: 'MLOps', link: '/mlops/' },
      ],

      sidebar: [
        {
          text: 'Getting Started',
          link: '/getting-started',
          collapsed: false,
          items: [
            {
              text: 'Setup',
              link: '/getting-started/setup/',
              collapsed: true,
              items: [
                { text: 'Prerequisites', link: '/getting-started/setup/prerequisites' },
                { text: 'Start Infrastructure', link: '/getting-started/setup/start-infrastructure' },
                { text: 'Manually Setup', link: '/getting-started/setup/manually-setup' },
                { text: 'Docker Setup', link: '/getting-started/setup/docker-setup' },
                { text: 'Kubernetes Setup', link: '/getting-started/setup/kubernetes-setup' },
                { text: 'Configuration', link: '/getting-started/setup/configuration' },
              ],
            },
            { text: 'Gateway', link: '/getting-started/gateway' },
          ],
        },
        {
          text: 'Concepts',
          link: '/getting-started/overview/',
          collapsed: false,
          items: [
            { text: 'Ecosystem Overview', link: '/getting-started/overview/ecosystem/' },
            { text: 'Platform Architecture', link: '/getting-started/overview/ecosystem/platform' },
            { text: 'Client Applications', link: '/getting-started/overview/ecosystem/client-app' },
            { text: 'Core Schema', link: '/getting-started/overview/key-concepts/core-schema' },
            { text: 'Access Control (ABAC)', link: '/getting-started/overview/key-concepts/access-control' },
            { text: 'Coworkers Space', link: '/getting-started/overview/key-concepts/coworkers-space' },
          ],
        },
        {
          text: 'API',
          link: '/api/',
          collapsed: false,
          items: [
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Authorization', link: '/api/authorization' },
            { text: 'Request Headers', link: '/api/headers' },
            { text: 'REST Reference', link: '/api/rest-reference' },
            { text: 'GraphQL Reference', link: '/api/graphql-reference' },
            { text: 'Filtering & Pagination', link: '/api/filtering' },
            { text: 'Streaming (SSE)', link: '/api/streaming' },
          ],
        },
        {
          text: 'Services',
          link: '/getting-started/services/',
          collapsed: true,
          items: [
            { text: 'Auth', link: '/getting-started/services/auth' },
            { text: 'Domain', link: '/getting-started/services/domain' },
            { text: 'Context', link: '/getting-started/services/context' },
            { text: 'Essential', link: '/getting-started/services/essential' },
            { text: 'Identity', link: '/getting-started/services/identity' },
            { text: 'Financial', link: '/getting-started/services/financial' },
            { text: 'Career', link: '/getting-started/services/career' },
            { text: 'Special', link: '/getting-started/services/special' },
            { text: 'Touch', link: '/getting-started/services/touch' },
            { text: 'Content', link: '/getting-started/services/content' },
            { text: 'Logistic', link: '/getting-started/services/logistic' },
            { text: 'Conjoint', link: '/getting-started/services/conjoint' },
            { text: 'General', link: '/getting-started/services/general' },
            { text: 'Thing', link: '/getting-started/services/thing' },
          ],
        },
        {
          text: 'Workers',
          link: '/getting-started/workers/',
          collapsed: true,
          items: [
            { text: 'Dispatcher', link: '/getting-started/workers/dispatcher' },
            { text: 'Observer', link: '/getting-started/workers/observer' },
            { text: 'Preserver', link: '/getting-started/workers/preserver' },
            { text: 'Watcher', link: '/getting-started/workers/watcher' },
            { text: 'Publisher', link: '/getting-started/workers/publisher' },
            { text: 'Logger', link: '/getting-started/workers/logger' },
            { text: 'Cleaner', link: '/getting-started/workers/cleaner' },
          ],
        },
        {
          text: 'SDK',
          link: '/sdk/',
          collapsed: true,
          items: [
            { text: 'Node SDK', link: '/sdk/node' },
          ],
        },
        {
          text: 'MCP',
          link: '/mcp/',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/mcp/overview' },
            { text: 'Tools Reference', link: '/mcp/tools' },
            { text: 'Integration Guide', link: '/mcp/integration' },
          ],
        },
        {
          text: 'MLOps',
          link: '/mlops/',
          collapsed: true,
          items: [
            { text: 'Quickstart', link: '/mlops/quickstart' },
            { text: 'Architecture', link: '/mlops/architecture' },
            { text: 'Scripts', link: '/mlops/scripts' },
            { text: 'Airflow DAGs', link: '/mlops/dags' },
            { text: 'Model Training', link: '/mlops/model-training' },
            { text: 'Deployment', link: '/mlops/deployment' },
          ],
        },
        { text: 'Changelog', link: '/changelog' },
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/wenex-org/platform' },
      ],

      search: { provider: 'local' },

      outline: { level: [2, 3] },
    },
  })
)
