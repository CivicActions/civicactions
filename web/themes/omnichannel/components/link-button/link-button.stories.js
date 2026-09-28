import template from './link-button.twig';
import './link-button.css';

const meta = {
  title: 'Components/Link Button',
  render: (args) => template(args),
  argTypes: {
    text: { control: 'text' },
    src: { control: 'text' },
    type: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['default', 'large'] },
  },
  args: {
    text: 'See our work',
    src: '/case-studies',
    type: 'primary',
    size: 'default',
  },
};

export default meta;

export const Primary = {};

export const Secondary = {
  args: {
    type: 'secondary',
  },
};

export const Large = {
  args: {
    size: 'large',
  },
};
