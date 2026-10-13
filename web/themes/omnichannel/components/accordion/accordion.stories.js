import template from './accordion-preview.twig';
import './accordion.css';

const meta = {
  title: 'Components/Accordion Item',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
    item_id: { control: 'text' },
    heading_level: { control: 'select', options: [2, 3, 4] },
    open_by_default: { control: 'boolean' },
    accordion_content: { control: 'text' },
  },
  args: {
    title: 'What is the class size?',
    item_id: '',
    heading_level: 2,
    open_by_default: false,
    accordion_content:
      '<p>Cohorts are typically capped to ensure personal coaching and collaborative breakout sessions.</p>',
  },
};

export default meta;

export const Default = {};

export const OpenByDefault = {
  args: {
    open_by_default: true,
  },
};

export const LongContent = {
  args: {
    title: 'How was DITAP created?',
    accordion_content:
      '<p>The Digital IT Acquisition Program was designed by the U.S. Digital Service and the Federal Acquisition Institute to empower federal contracting officers with modern agile procurement practices.</p>',
  },
};

export const HeadingLevel3 = {
  args: {
    heading_level: 3,
  },
};

export const CustomItemId = {
  args: {
    title: 'What is the class size?',
    item_id: 'ditap-class-size',
  },
};
