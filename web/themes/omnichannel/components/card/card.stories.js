import template from './card.twig';
import './card.css';
import { placeholderIcon } from '../../.storybook/fixtures';

const meta = {
  title: 'Components/Card',
  render: (args) => template(args),
  argTypes: {
    heading_level: { control: 'select', options: [2, 3, 4, 5, 6] },
    title: { control: 'text' },
    link: { control: 'text' },
    icon: { control: 'text' },
    icon_alt: { control: 'text' },
    body: { control: 'text' },
  },
  args: {
    heading_level: 3,
    title: 'Web and CMS',
    link: '/services#web-cms',
    icon: placeholderIcon,
    icon_alt: 'Service category icon',
    body: 'Accessible digital services for the public good.',
  },
};

export default meta;

export const Default = {};

export const NestedHeading = {
  args: {
    heading_level: 3,
  },
};
