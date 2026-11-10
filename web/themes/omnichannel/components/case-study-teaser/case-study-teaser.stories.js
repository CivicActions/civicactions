import template from './case-study-teaser.twig';
import './case-study-teaser.css';
import { placeholderImage } from '../../.storybook/fixtures';

const meta = {
  title: 'Components/Case Study Teaser',
  render: (args) => template(args),
  argTypes: {
    heading_level: { control: 'select', options: [2, 3, 4, 5, 6] },
    teaserlink: { control: 'text' },
    image: { control: 'object' },
    client: { control: 'text' },
    title: { control: 'text' },
    summary: { control: 'text' },
  },
  args: {
    heading_level: 2,
    teaserlink: '/case-studies/example',
    image: placeholderImage,
    client: 'National Science Foundation',
    title: 'Designing a better public experience',
    summary: 'A digital service that helps people find what they need.',
  },
};

export default meta;

export const Default = {};

export const NestedHeading = {
  args: {
    heading_level: 3,
  },
};
