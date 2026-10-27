import template from './outcome-card.twig';
import './outcome-card.css';

const meta = {
  title: 'Components/Outcome Card',
  render: (args) => template(args),
  argTypes: {
    heading: { control: 'text' },
    body: { control: 'text' },
    heading_level: { control: 'select', options: [2, 3, 4, 5, 6] },
  },
  args: {
    heading: 'More accessible experience',
    body: '<p>The new administration theme is cleaner, clearer, and more accessible for content editors.</p>',
    heading_level: 3,
  },
};

export default meta;

export const Default = {};

export const LongContent = {
  args: {
    heading: 'Improved human-centered design across every editing workflow',
    body: '<p>Drupal 10 introduces a modern rich text editor with many interface enhancements, helping editors create accessible content with fewer errors and a much clearer publishing experience.</p>',
  },
};
