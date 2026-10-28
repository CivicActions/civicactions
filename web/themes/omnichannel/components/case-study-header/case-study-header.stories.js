import template from './case-study-header.twig';
import '../../css/layout.css';
import './case-study-header.css';

const meta = {
  title: 'Components/Case Study Header',
  render: (args) => template(args),
  argTypes: {
    title: {
      control: 'text',
      description: 'The primary page heading, rendered as an h1.',
    },
    client: {
      control: 'text',
      description: 'Optional client name. Leave empty to hide.',
    },
    description: {
      control: 'text',
      description: 'Optional plain-text summary. Leave empty to hide.',
    },
    narrow_width: {
      control: 'boolean',
      description:
        'Optional flag to render the header with a narrow container.',
    },
  },
  args: {
    title: 'Modernizing public services with open technology',
    client: 'Public sector partner',
    description:
      'Building accessible digital services that help people find the information and support they need.',
    narrow_width: false,
  },
};

export default meta;

export const Default = {};

export const NarrowWidth = {
  args: {
    narrow_width: true,
  },
};

export const TitleOnly = {
  args: {
    client: '',
    description: '',
  },
};

export const WithoutClient = {
  args: {
    client: '',
  },
};

export const WithoutDescription = {
  args: {
    description: '',
  },
};

export const LongContent = {
  args: {
    title:
      'Building accessible government services that meet the needs of every community through open technology and human-centered design',
    client:
      'Public sector partner - Office of Digital Services and Community Engagement',
    description:
      'Working alongside government teams, we modernize complex systems and make essential information easier to find and understand. This case study explores how research, accessible design, and open technology can help people confidently access the public services they depend on.',
  },
};
