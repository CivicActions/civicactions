import template from './page-title.twig';
import './page-title.css';

const meta = {
  title: 'Components/Page Title',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    heading_level: { control: 'select', options: [1, 2] },
    alignment: { control: 'select', options: ['left', 'center'] },
  },
  args: {
    title: 'Government services that build public trust',
    subtitle: '',
    heading_level: 1,
    alignment: 'left',
  },
};

export default meta;

export const DefaultH1 = {};

export const WithSubtitle = {
  args: {
    subtitle: 'Digital services for the public good.',
  },
};

export const Centered = {
  args: {
    alignment: 'center',
    subtitle: 'Digital services for the public good.',
  },
};
