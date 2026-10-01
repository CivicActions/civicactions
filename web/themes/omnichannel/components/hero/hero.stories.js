import template from './hero.twig';
import './hero.css';

const meta = {
  title: 'Components/Hero',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
    eyebrow: { control: 'text' },
    summary: { control: 'text' },
    variant: { control: 'select', options: ['card', 'flush'] },
    primary_button_text: { control: 'text' },
    primary_button_url: { control: 'text' },
    secondary_button_text: { control: 'text' },
    secondary_button_url: { control: 'text' },
  },
  args: {
    title: 'Government services that build public trust',
    eyebrow: 'CivicActions',
    summary:
      'We help government deliver trusted public services through open technology and design.',
    variant: 'card',
    primary_button_text: 'See our work',
    primary_button_url: '/case-studies',
    secondary_button_text: 'Contact us',
    secondary_button_url: '/contact',
  },
};

export default meta;

export const Default = {};

export const TextOnly = {
  args: {
    eyebrow: '',
    primary_button_text: '',
    primary_button_url: '',
    secondary_button_text: '',
    secondary_button_url: '',
  },
};

export const WithTwoButtons = {
  args: {
    primary_button_text: 'See our work',
    primary_button_url: '/case-studies',
    secondary_button_text: 'Contact us',
    secondary_button_url: '/contact',
  },
};

export const WithEyebrow = {
  args: {
    eyebrow: 'U.S. Department of Transportation',
    title: 'Modernizing the federal permitting dashboard',
    summary:
      'Increasing transparency and efficiency for complex multi-agency infrastructure approvals.',
  },
};

export const FlushVariant = {
  args: {
    variant: 'flush',
    title: 'Work for the public good.',
    summary:
      'Join our team of talented and open-minded people working to build modern and accessible government services for all.',
    primary_button_text: 'See open positions',
    primary_button_url: '/careers#open-positions',
  },
};
