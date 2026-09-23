import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { defineConfig, type DefaultTheme, type HeadConfig, type PageData } from 'vitepress'

// The GitHub Pages project site. Every absolute URL a page emits — canonical, Open Graph, JSON-LD,
// sitemap — is built from these, so a move to a custom domain changes ORIGIN (and BASE) and nothing else.
const ORIGIN = 'https://wenex-org.github.io'
const BASE = '/platform/'
const SITE_URL = ORIGIN + BASE
const SITE_NAME = 'Wenex Platform'
const SITE_DESCRIPTION =
  'Developer documentation for Wenex, an open-source TypeScript and NestJS microservice platform behind one REST, GraphQL and MCP gateway.'
const OG_IMAGE = `${SITE_URL}og-image.jpg`
const ORGANIZATION_ID = `${SITE_URL}#organization`
const WEBSITE_ID = `${SITE_URL}#website`

// vitepress-plugin-mermaid registers its <Mermaid> component through a static import in the app entry,
// which put mermaid (~145 KB gzipped) on every page, diagram or not. Resolve that one import to an async
// wrapper instead, so only a page that renders a diagram fetches mermaid; the plugin's component is unchanged.
const mermaidComponent = createRequire(import.meta.url).resolve('vitepress-plugin-mermaid/Mermaid.vue')
const lazyMermaid = {
  name: 'lazy-mermaid',
  enforce: 'pre' as const,
  resolveId: (id: string) => (id === 'vitepress-plugin-mermaid/Mermaid.vue' ? '\0lazy-mermaid' : undefined),
  load: (id: string) =>
    id === '\0lazy-mermaid'
      ? `import { defineAsyncComponent } from 'vue'\n` +
        `export default defineAsyncComponent(() => import(${JSON.stringify(mermaidComponent)}))`
      : undefined,
}

// A hub page is `<dir>/index.md`, served at `<dir>/` — so its links keep the trailing slash. Without it
// VitePress emits `<dir>.html`, which GitHub Pages answers with a 404 (the client router hides this on click).
const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Getting Started',
    link: '/getting-started/',
    collapsed: false,
    items: [
      {
        text: 'Overview',
        link: '/getting-started/overview/',
        collapsed: true,
        items: [
          {
            text: 'Ecosystem',
            link: '/getting-started/overview/ecosystem/',
            collapsed: true,
            items: [
              { text: 'Platform', link: '/getting-started/overview/ecosystem/platform' },
              { text: 'Client App', link: '/getting-started/overview/ecosystem/client-app' },
            ],
          },
          {
            text: 'Key Concepts',
            collapsed: true,
            link: '/getting-started/overview/key-concepts/',
            items: [
              { text: 'Core Schema', link: '/getting-started/overview/key-concepts/core-schema' },
              { text: 'Access Control', link: '/getting-started/overview/key-concepts/access-control' },
              { text: 'Coworkers Space', link: '/getting-started/overview/key-concepts/coworkers-space' },
            ],
          },
        ],
      },
      {
        text: 'Setup',
        link: '/getting-started/setup/',
        collapsed: true,
        items: [
          { text: 'Prerequisites', link: '/getting-started/setup/prerequisites' },
          {
            text: 'Start Infrastructure',
            link: '/getting-started/setup/start-infrastructure',
          },
          {
            text: 'Manually Setup',
            link: '/getting-started/setup/manually-setup',
          },
          {
            text: 'Docker Setup',
            link: '/getting-started/setup/docker-setup',
          },
          {
            text: 'Kubernetes Setup',
            link: '/getting-started/setup/kubernetes-setup',
          },
          {
            text: 'Configuration',
            link: '/getting-started/setup/configuration',
          },
        ],
      },
      { text: 'Gateway', link: '/getting-started/gateway' },
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
    ],
  },
  {
    text: 'API',
    link: '/api/',
    collapsed: false,
    items: [
      { text: 'Authentication', link: '/api/authentication' },
      { text: 'Authorization', link: '/api/authorization' },
      { text: 'REST Reference', link: '/api/rest-reference' },
      { text: 'Request Headers', link: '/api/headers' },
      { text: 'GraphQL Reference', link: '/api/graphql-reference' },
      { text: 'Filtering & Pagination', link: '/api/filtering' },
      { text: 'Streaming (SSE)', link: '/api/streaming' },
      { text: 'Realtime Data (MQTT)', link: '/api/realtime' },
    ],
  },
  {
    text: 'SDK',
    link: '/sdk/',
    collapsed: false,
    items: [{ text: 'Node SDK', link: '/sdk/node' }],
  },
  {
    text: 'MCP',
    link: '/mcp/',
    collapsed: false,
    items: [
      { text: 'Overview', link: '/mcp/overview' },
      { text: 'Tools Reference', link: '/mcp/tools' },
      { text: 'Integration Guide', link: '/mcp/integration' },
    ],
  },
  {
    text: 'MLOps',
    link: '/mlops/',
    collapsed: false,
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
]

// The path a page is served at, relative to BASE: `api/index.md` → `api/`, `api/headers.md` → `api/headers.html`.
const pagePath = (relativePath: string) => relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
const linkPath = (link: string) => pagePath(link.replace(/^\//, '').replace(/\/$/, '/index') + '.md')

// Each page's ancestors in the sidebar, itself included — the source of its BreadcrumbList.
type Crumb = { name: string; path: string }
const trails = new Map<string, Crumb[]>()
const collectTrails = (items: DefaultTheme.SidebarItem[], trail: Crumb[]) => {
  for (const item of items) {
    const here = item.link ? [...trail, { name: item.text!, path: linkPath(item.link) }] : trail
    if (item.link) trails.set(linkPath(item.link), here)
    if (item.items) collectTrails(item.items, here)
  }
}
collectTrails(sidebar, [])

// First prose paragraph of a page, stripped of Markdown: the description of a page whose frontmatter sets none.
const excerpt = (file: string) => {
  const body = fs.readFileSync(file, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
  const block = body.split(/\n\s*\n/).map((b) => b.trim()).find((b) => /^[A-Za-z*_`[]/.test(b))
  if (!block) return undefined
  const text = block
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
  return text.length <= 155 ? text : text.slice(0, text.lastIndexOf(' ', 154)) + '…'
}

const jsonLd = (pageData: PageData, url: string, description: string) => {
  const organization = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'Wenex',
    url: 'https://github.com/wenex-org',
    logo: `${SITE_URL}logo.svg`,
  }
  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-US',
    publisher: { '@id': ORGANIZATION_ID },
  }
  const graph: object[] = [organization, website]
  const path = pagePath(pageData.relativePath)
  if (path !== '') {
    const trail = [{ name: SITE_NAME, path: '' }, ...(trails.get(path) ?? [{ name: pageData.title, path }])]
    graph.push(
      {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        headline: pageData.title,
        description,
        url,
        mainEntityOfPage: url,
        image: OG_IMAGE,
        inLanguage: 'en-US',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: SITE_URL + crumb.path,
        })),
      },
    )
  }
  // `<` escaped so a string in the data can never close the <script> element early.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
}

export default withMermaid(
  defineConfig({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    base: BASE,
    srcDir: 'docs',
    // The docs repo's README.md describes the repo on GitHub; published, it duplicated the home page.
    srcExclude: ['README.md'],
    outDir: '.vitepress/dist',

    head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${BASE}logo.svg` }]],

    sitemap: { hostname: SITE_URL },

    // Canonical URL, social cards and structured data, per page. They ride on frontmatter.head, so the
    // client router swaps them on navigation as well as the server rendering them.
    transformPageData(pageData, { siteConfig }) {
      const url = SITE_URL + pagePath(pageData.relativePath)
      pageData.description ||= excerpt(path.join(siteConfig.srcDir, pageData.filePath)) ?? ''
      const description = pageData.description || SITE_DESCRIPTION
      const { titleTemplate } = pageData.frontmatter
      const title = typeof titleTemplate === 'string' ? `${pageData.title} | ${titleTemplate}` : pageData.title
      const head: HeadConfig[] = [
        ['link', { rel: 'canonical', href: url }],
        ['meta', { property: 'og:type', content: url === SITE_URL ? 'website' : 'article' }],
        ['meta', { property: 'og:site_name', content: SITE_NAME }],
        ['meta', { property: 'og:locale', content: 'en_US' }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:url', content: url }],
        ['meta', { property: 'og:image', content: OG_IMAGE }],
        ['meta', { property: 'og:image:width', content: '1200' }],
        ['meta', { property: 'og:image:height', content: '630' }],
        ['meta', { property: 'og:image:alt', content: `${SITE_NAME} — Application Production Factory` }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['script', { type: 'application/ld+json' }, jsonLd(pageData, url, description)],
      ]
      pageData.frontmatter.head = [...(pageData.frontmatter.head ?? []), ...head]
    },

    vite: {
      plugins: [lazyMermaid],
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
      // `title` is the full name for <title> and search results; the navbar keeps its short one.
      siteTitle: 'Wenex',
      logo: { src: '/logo.svg', width: 24, height: 24 },

      nav: [
        { text: 'Getting Started', link: '/getting-started/' },
        { text: 'API', link: '/api/' },
        { text: 'SDK', link: '/sdk/' },
        { text: 'MCP', link: '/mcp/' },
        { text: 'MLOps', link: '/mlops/' },
      ],

      sidebar,

      socialLinks: [
        { icon: 'github', link: 'https://github.com/wenex-org/platform' },
      ],

      search: { provider: 'local' },

      outline: { level: [2, 3] },
    },
  })
)
