import { withMermaid } from 'vitepress-plugin-mermaid'
import { generateSidebar } from 'vitepress-sidebar'
import { defineConfig } from 'vitepress'

export default withMermaid(
  defineConfig({
    title: 'Wenex Platform',
    description: 'Documentation for Wenex Platform v1.6.0',
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
        { text: 'Services', link: '/services/' },
        { text: 'MCP', link: '/mcp/overview' },
      ],

      sidebar: generateSidebar({
        documentRootPath: 'docs',
        collapsed: false,
        capitalizeFirst: true,
        excludePattern: ['README.md', 'LICENSE'],
      }),

      socialLinks: [
        { icon: 'github', link: 'https://github.com/wenex-org/platform' },
      ],

      search: { provider: 'local' },
    },
  })
)
