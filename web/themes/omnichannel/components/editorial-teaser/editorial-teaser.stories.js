import template from './editorial-teaser.twig';
import './editorial-teaser.css';
import { placeholderImage } from '../../.storybook/fixtures';

const meta = {
  title: 'Components/Editorial Teaser',
  render: (args) => template(args),
  argTypes: {
    variant: { control: 'inline-radio', options: ['press', 'news'] },
    layout: {
      control: 'inline-radio',
      options: ['card', 'compact'],
      description: 'Press release layout. Ignored for news.',
      if: { arg: 'variant', eq: 'press' },
    },
    teaserlink: { control: 'text' },
    image: { control: 'object' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    variant: 'press',
    layout: 'card',
    teaserlink: '/press-releases/example',
    image: placeholderImage,
    title: 'CivicActions announces a public-sector partnership',
    description: 'Learn more about this announcement.',
  },
};

export default meta;

export const PressReleaseCard = {
  args: {
    layout: 'card',
    variant: 'press',
  },
};

export const PressReleaseCompact = {
  args: {
    layout: 'compact',
  },
};

export const PressReleaseCardWithoutImage = {
  args: {
    image: null,
  },
};

export const NewsRelease = {
  args: {
    variant: 'news',
    teaserlink: '/news/example',
  },
};
