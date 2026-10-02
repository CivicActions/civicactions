const imagePath = 'canvas-assets/editorial-teaser-img.jpg';
const iconPath = 'icons/check.svg';

export const placeholderImage = {
  src: `${import.meta.env.PROD ? '/storybook' : ''}/images/${imagePath}`,
  alt: 'Traffic light against the sky',
  width: 354,
  height: 220,
};

export const placeholderIcon = `${import.meta.env.PROD ? '/storybook' : ''}/images/${iconPath}`;

export const quotePortrait = {
  src: `${import.meta.env.PROD ? '/storybook' : ''}/images/canvas-assets/quote-portrait.png`,
  alt: 'Portrait of Alex Rivera',
  width: 346,
  height: 446,
};
