import { withMermaid } from 'vitepress-plugin-mermaid'
import { defineConfig } from 'vitepress'

export default withMermaid(
  defineConfig({
    title: 'Wenex',
    description: 'Documentation for Wenex Platform v1.6.0',
    base: '/platform/',
    srcDir: 'docs',
    outDir: '.vitepress/dist',

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
      nav: [
        { text: 'Getting Started', link: '/getting-started' },
        { text: 'API', link: '/api/rest-reference' },
        { text: 'SDK', link: '/sdk/' },
        { text: 'MCP', link: '/mcp/overview' },
        { text: 'MLOps', link: '/mlops/' },
      ],

      sidebar: [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            {
              text: 'Setup',
              link: '/getting-started/setup',
              collapsed: true,
              items: [
                { text: 'Prerequisites', link: '/getting-started/setup#prerequisites' },
                {
                  text: 'Start Infrastructure',
                  link: '/getting-started/setup#start-infrastructure',
                  collapsed: true,
                  items: [
                    { text: 'Additional Compose', link: '/getting-started/setup#additional-compose' },
                    { text: 'MongoDB Replica Set', link: '/getting-started/setup#mongodb-replica-set' },
                  ],
                },
                {
                  text: 'Manually Setup',
                  link: '/getting-started/setup#manually-setup',
                  collapsed: true,
                  items: [
                    { text: 'Clone and Install', link: '/getting-started/setup#clone-and-install' },
                    { text: 'Initialization', link: '/getting-started/setup#initialization' },
                    { text: 'Kafka Connect', link: '/getting-started/setup#kafka-connect' },
                    { text: 'Start Platform', link: '/getting-started/setup#start-platform' },
                  ],
                },
                {
                  text: 'Docker Setup',
                  link: '/getting-started/setup#docker-setup',
                  collapsed: true,
                  items: [
                    { text: 'Prepare the Environment', link: '/getting-started/setup#prepare-the-environment' },
                    { text: 'Build the Platform Image', link: '/getting-started/setup#build-the-platform-image' },
                    { text: 'Initialize the Database', link: '/getting-started/setup#initialize-the-database' },
                    { text: 'Start the Platform', link: '/getting-started/setup#start-the-platform' },
                  ],
                },
                {
                  text: 'Gateway',
                  link: '/getting-started/setup#gateway',
                  collapsed: true,
                  items: [
                    { text: 'Health Check', link: '/getting-started/setup#health-check' },
                    { text: 'Exposed Endpoints', link: '/getting-started/setup#exposed-endpoints' },
                  ],
                },
              ],
            },
            { text: 'Deploy', link: '/getting-started/deploy' },
          ],
        },
        {
          text: 'API',
          collapsed: false,
          items: [
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'REST Reference', link: '/api/rest-reference' },
            { text: 'GraphQL Reference', link: '/api/graphql-reference' },
            { text: 'Filtering & Pagination', link: '/api/filtering' },
            { text: 'Streaming (SSE)', link: '/api/streaming' },
          ],
        },
        {
          text: 'SDK',
          collapsed: false,
          items: [
            { text: 'SDK Guide', link: '/sdk/' },
          ],
        },
        {
          text: 'Services',
          collapsed: false,
          items: [
            { text: 'Service Catalog', link: '/services/' },
          ],
        },
        {
          text: 'Architecture',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/architecture' },
            { text: 'Ecosystem & ABAC', link: '/ecosystem' },
            { text: 'Client Development', link: '/client-development' },
          ],
        },
        {
          text: 'MCP',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/mcp/overview' },
          ],
        },
        {
          text: 'MLOps',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/mlops/' },
          ],
        },
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/wenex-org/platform' },
      ],

      search: { provider: 'local' },

      outline: { level: [2, 3] },
    },
  })
)
