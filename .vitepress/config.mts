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
        { text: 'Getting Started', link: '/getting-started/overview' },
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
              text: 'Overview',
              link: '/getting-started/overview',
              collapsed: true,
              items: [
                {
                  text: 'Ecosystem',
                  link: '/getting-started/overview/ecosystem',
                  collapsed: true,
                  items: [
                    { text: 'Platform', link: '/getting-started/overview/platform' },
                    { text: 'Client', link: '/getting-started/overview/client' },
                  ],
                },
                {
                  text: 'Concepts',
                  collapsed: true,
                  items: [
                    { text: 'Core Schema', link: '/concepts/core-schema' },
                    { text: 'Access Control', link: '/concepts/abac' },
                    { text: 'Coworkers Space', link: '/concepts/coworkers' },
                  ],
                },
              ],
            },
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
                  text: 'Kubernetes Setup',
                  link: '/getting-started/setup#kubernetes-setup',
                  collapsed: true,
                  items: [
                    { text: 'Using Helm Charts', link: '/getting-started/setup#using-helm-charts' },
                    { text: 'Install the Chart', link: '/getting-started/setup#install-the-chart' },
                    { text: 'Control Subcharts', link: '/getting-started/setup#control-subcharts' },
                  ],
                },
                {
                  text: 'Configuration',
                  link: '/getting-started/setup#configuration',
                  collapsed: true,
                  items: [
                    { text: 'Secrets', link: '/getting-started/setup#secrets' },
                    { text: 'General', link: '/getting-started/setup#general' },
                    { text: 'Internationalization', link: '/getting-started/setup#internationalization' },
                    { text: 'Redis', link: '/getting-started/setup#redis' },
                    { text: 'MinIO', link: '/getting-started/setup#minio' },
                    { text: 'MongoDB', link: '/getting-started/setup#mongodb' },
                    { text: 'PostgreSQL', link: '/getting-started/setup#postgresql' },
                    { text: 'Elasticsearch', link: '/getting-started/setup#elasticsearch' },
                    { text: 'Kafka', link: '/getting-started/setup#kafka' },
                    { text: 'EMQX', link: '/getting-started/setup#emqx' },
                    { text: 'OpenStreetMap', link: '/getting-started/setup#openstreetmap' },
                    { text: 'TURN / STUN', link: '/getting-started/setup#turn--stun' },
                    { text: 'OpenTelemetry', link: '/getting-started/setup#opentelemetry' },
                    { text: 'Elastic APM', link: '/getting-started/setup#elastic-apm' },
                    { text: 'Sentry', link: '/getting-started/setup#sentry' },
                    { text: 'Cleaner Worker', link: '/getting-started/setup#cleaner-worker' },
                  ],
                },
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
            {
              text: 'Services',
              link: '/services/',
              collapsed: true,
              items: [
                { text: 'Auth', link: '/services/auth' },
                { text: 'Identity', link: '/services/identity' },
                { text: 'Domain', link: '/services/domain' },
                { text: 'Context', link: '/services/context' },
                { text: 'Essential', link: '/services/essential' },
                { text: 'Financial', link: '/services/financial' },
                { text: 'Career', link: '/services/career' },
                { text: 'Special', link: '/services/special' },
                { text: 'Touch', link: '/services/touch' },
                { text: 'Logistic', link: '/services/logistic' },
                { text: 'Conjoint', link: '/services/conjoint' },
                { text: 'General', link: '/services/general' },
                { text: 'Thing', link: '/services/thing' },
                { text: 'Content', link: '/services/content' },
              ],
            },
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
