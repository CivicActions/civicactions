import template from './quote.twig';
import './quote.css';
import { quotePortrait } from '../../.storybook/fixtures';

const meta = {
  title: 'Components/Quote',
  render: (args) => template(args),
  argTypes: {
    quote: { control: 'text' },
    name: { control: 'text' },
    role: { control: 'text' },
    image: { control: 'object' },
  },
  args: {
    quote:
      'We believe government works best when technology is built in the open with the people it serves.',
    name: 'Alex Rivera',
    role: 'Co-Founder & Government Solutions Lead',
  },
};

export default meta;

export const WithPortrait = {
  args: {
    image: quotePortrait,
  },
};

export const TextOnly = {
  args: {
    quote:
      'CivicActions transformed how our agency approaches digital service delivery and public cloud migration.',
    name: '',
    role: 'Senior Federal Program Director',
  },
};
