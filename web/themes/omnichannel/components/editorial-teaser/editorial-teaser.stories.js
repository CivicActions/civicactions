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
    image: { control: 'object' },
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
    'CivicActions Appoints Mike Gifford as Open Standards & Practices Lead, Expanding Commitment to an Open Ecosystem of Vendors and Agencies',
  description:
    "CivicActions, a leading provider of digital services to the Federal government, is proud to announce the appointment of Mike Gifford to the newly created position of Open Standards & Practices Lead.",
  date: '2024-07-08',
  fullstorylink: '/press/2024-07-09-CivicActions-Appoints-Mike-Gifford/',
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

export const NewsReleaseList = {
  render: (args) => `<div style="max-width: 45rem; margin: 0 auto; padding: 0 1.5rem;">${[
    args,
    {
      ...args,
      title: 'CivicActions Announces 2023 Impact Report',
      description:
        'CivicActions is thrilled to present its 2023 Impact Report, spotlighting a year of exceptional achievements and contributions.',
      date: '2024-01-16',
      fullstorylink: '/press/2024-01-16-CivicActions-Announces-Impact-Report/',
    },
    {
      ...args,
      title:
        'Ryerson University partners with CivicActions to advance digital accessibility',
      description:
        'The G. Raymond Chang School of Continuing Education has partnered with us to support its Digital Accessibility Specialist Microcredential Program.',
      date: '2022-04-22',
      fullstorylink: '/press/2022-04-21-civicactions-announces-Ryerson-partnership/',
    },
  ]
    .map((item) => template(item))
    .join('')}</div>`,
  args: newsArgs,
};
