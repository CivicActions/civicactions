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
    icon_name: {
      control: 'select',
      options: [
        '',
        'check',
        'calendar',
        'certificate',
        'users',
        'arrow',
        'document',
        'star',
      ],
    },
    body: { control: 'text' },
  },
  args: {
    heading_level: 3,
    title: 'Web and CMS',
    link: '/services#web-cms',
    icon: placeholderIcon,
    icon_alt: 'Service category icon',
    icon_name: '',
    body: 'Accessible digital services for the public good.',
  },
};

export default meta;

export const Default = {};

export const WithIconSymbol = {
  args: {
    icon: '',
    icon_name: 'certificate',
    title: 'Certified Credential',
    body: 'Earn the official FAC-C (Core-Plus) DITAP specialization recognized across government.',
  },
};

export const NestedHeading = {
  args: {
    heading_level: 3,
  },
};
