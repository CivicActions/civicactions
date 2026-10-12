import template from './content.twig';
import './content.css';

const meta = {
  title: 'Components/Content',
  render: (args) => template(args),
  argTypes: {
    body: { control: 'text' },
    narrow: { control: 'boolean' },
  },
  args: {
    body: '<p>CivicActions helps government teams build accessible digital services that work for everyone.</p>',
    narrow: false,
  },
};

export default meta;

export const Default = {};

export const NarrowColumn = {
  args: {
    narrow: true,
  },
};

export const RichProse = {
  args: {
    body: '<h2>Build for the public good</h2><p>Open practices make services easier to improve and easier to trust.</p><ul><li>Accessible by default</li><li>Designed with the people who use it</li></ul><blockquote>Good digital services respect people\'s time.</blockquote><p><a href="/about">Learn more about our approach</a>.</p>',
  },
};
