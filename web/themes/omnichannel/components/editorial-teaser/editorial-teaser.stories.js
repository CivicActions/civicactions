import template from './editorial-teaser.twig';
import './editorial-teaser.css';
import { placeholderImage } from '../../.storybook/fixtures';

const meta = {
  title: 'Components/Editorial Teaser',
  render: (args) => template(args),
  argTypes: {
    variant: { control: 'select', options: ['card', 'compact'] },
    teaserlink: { control: 'text' },
    image: { control: 'object' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    variant: 'card',
    teaserlink: '/press-releases/example',
    image: placeholderImage,
    title: 'CivicActions announces a public-sector partnership',
    description: 'Learn more about this announcement.',
  },
};

export default meta;

export const Card = {};

export const Compact = {
  args: {
    variant: 'compact',
  },
};
