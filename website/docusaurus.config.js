module.exports = {
  title: 'ProtoCat',
  tagline: 'Modern, minimalist type-safe gRPC framework for Node.js',
  url: 'https://proto.cat',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'grissius',
  projectName: 'ProtoCat',
  onBrokenLinks: 'log',
  themeConfig: {
    navbar: {
      title: 'ProtoCat',
      logo: {
        alt: 'ProtoCat Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/docs/wiki/installation',
          activeBasePath: 'docs/wiki',
          label: 'Docs',
          position: 'left',
        },
        {
          to: '/docs/api/modules',
          label: 'API',
          activeBasePath: 'docs/api',
          position: 'left',
        },
        {
          href: 'https://github.com/grissius/protocat',
          position: 'right',
          className: 'header-github-link',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Jaroslav Šmolík. Docs built with Docusaurus.`,
    },
    colorMode: {
      disableSwitch: true,
    },
    prism: {
      additionalLanguages: ['protobuf'],
    },
  },
  plugins: [
    [
      'docusaurus-plugin-typedoc',

      // Plugin / TypeDoc options
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        exclude: ['../src/lib/misc/*'],
        excludeInternal: true
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
