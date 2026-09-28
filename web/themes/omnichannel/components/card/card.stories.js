import template from './card.twig';
import './card.css';
import { placeholderIcon } from '../../.storybook/fixtures';

const meta = {
  title: 'Components/Card',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
    link: { control: 'text' },
    icon: { control: 'text' },
    icon_alt: { control: 'text' },
    body: { control: 'text' },
  },
  args: {
    title: 'Web and CMS',
    link: '/services#web-cms',
    icon: placeholderIcon,
    icon_alt: 'Service category icon',
    body: 'Accessible digital services for the public good.',
  },
};

export default meta;

export const Default = {};
