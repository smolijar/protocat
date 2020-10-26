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
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          homePageId: '/docs/wiki/installation',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
