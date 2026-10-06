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
    teaserlink: {
      control: 'text',
      if: { arg: 'variant', eq: 'press' },
    },
    date: {
      control: 'text',
      description: 'News date (YYYY-MM-DD).',
      if: { arg: 'variant', eq: 'news' },
    },
    fullstorylink: {
      control: 'text',
      if: { arg: 'variant', eq: 'news' },
    },
    image: {
      control: 'object',
      if: { arg: 'variant', eq: 'press' },
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    variant: 'press',
    layout: 'card',
    teaserlink: '/press-releases/example',
    date: '2024-07-08',
    fullstorylink: '/press/example',
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

const newsArgs = {
  variant: 'news',
  title:
    'Ryerson University partners with CivicActions to advance digital accessibility',
  description:
    'CivicActions is pleased to announce that The G. Raymond Chang School of Continuing Education (The Chang School) at Ryerson University has partnered with us to support its Digital Accessibility Specialist Microcredential Program.',
  date: '2024-07-08',
  fullstorylink: '#',
};

export const NewsRelease = {
  args: newsArgs,
};

export const NewsReleaseWithoutDate = {
  args: { ...newsArgs, date: '' },
};

export const NewsReleaseWithoutDescription = {
  args: { ...newsArgs, description: '' },
};
