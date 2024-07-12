// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Snow Datepicker',
  tagline: 'Pure (vanilla) javascript datepicker',
  // Set the production url of your site here
  url: 'https://janghye0k.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.NODE_ENV === 'development' ? '/' : '/snow-datepicker',
  favicon: '/img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'janghye0k', // Usually your GitHub org/user name.
  projectName: 'snow-datepicker', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          remarkPlugins: [
            [
              require('@docusaurus/remark-plugin-npm2yarn'),
              {
                sync: true,
                converters: ['yarn', 'pnpm'],
              },
            ],
          ],
        },
        theme: {
          customCss: ['./src/css/custom.css'],
        },
      }),
    ],
  ],

  scripts: [{ src: '/js/font.js' }],

  plugins: [
    [
      require.resolve('docusaurus-lunr-search'),
      {
        languages: ['en', 'ko'], // language codes
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      metadata: [
        {
          name: 'keywords',
          content:
            'pure, datepicker, javascript, vanilla, date, picker, snow, snow-datepicker',
        },
      ],
      navbar: {
        style: 'primary',
        logo: {
          src: '/img/logo.svg',
          style: {
            width: '20px',
            height: '20px',
            margin: '6px',
          },
        },
        title: 'Snow Datepicker',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'documentations',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'docSidebar',
            sidebarId: 'api',
            position: 'left',
            label: 'API',
          },
          {
            type: 'docSidebar',
            sidebarId: 'temp',
            position: 'left',
            label: 'Temp',
          },
          {
            href: 'https://github.com/janghye0k/snow-datepicker',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
            position: 'right',
          },
          { type: 'localeDropdown', position: 'right' },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
