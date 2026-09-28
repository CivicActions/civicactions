import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import twig from 'vite-plugin-twig-drupal';

const themeRoot = dirname(fileURLToPath(import.meta.url));
const registerCanvasImageFilter = (twigInstance) =>
  twigInstance.extendFilter('toSrcSet', () => () => null);

const config = {
  stories: ['../components/**/*.stories.js'],
  staticDirs: [
    { from: '../images/canvas-assets', to: '/images/canvas-assets' },
    { from: '../images/icons', to: '/images/icons' },
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  viteFinal: async (viteConfig, { configType }) => ({
    ...viteConfig,
    base: configType === 'PRODUCTION' ? '/storybook/' : '/',
    plugins: [
      ...(viteConfig.plugins ?? []),
      twig({
        functions: {
          toSrcSet: registerCanvasImageFilter,
        },
        namespaces: {
          omnichannel: resolve(themeRoot, '../components'),
        },
      }),
    ],
  }),
};

export default config;
