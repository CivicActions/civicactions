import template from './primary-page-cta.twig';
import './primary-page-cta.css';

const meta = {
  title: 'Components/Primary Page CTA',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    variant: { control: 'select', options: ['default', 'home'] },
    primary_button_text: { control: 'text' },
    primary_button_url: { control: 'text' },
    secondary_button_text: { control: 'text' },
    secondary_button_url: { control: 'text' },
  },
  args: {
    title: "Let's build a public success story.",
    subtitle: 'Get in touch to start.',
    variant: 'default',
    primary_button_text: 'Put us to work',
    primary_button_url: '/contact',
    secondary_button_text: 'Join our team',
    secondary_button_url: '/careers',
  },
};

export default meta;

export const Default = {};

export const Home = {
  args: {
    variant: 'home',
  },
};
