import '../css/global.css';

const preview = {
  parameters: {
    viewport: {
      options: {
        mobile: {
          name: 'Mobile',
          styles: { width: '480px', height: '900px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '900px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1024px', height: '900px' },
        },
        wide: {
          name: 'Wide desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
};

export default preview;
