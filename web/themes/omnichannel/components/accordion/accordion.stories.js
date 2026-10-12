import template from './accordion.twig';
import './accordion.css';

const sampleFaqItems = [
  {
    title: 'What is the class size?',
    content:
      '<p>Cohorts are typically capped to ensure personal coaching and collaborative breakout sessions.</p>',
    open: false,
  },
  {
    title: 'Is the training customizable?',
    content:
      '<p>Yes, CivicActions tailors learning pathways and schedule cadences to meet agency acquisition objectives.</p>',
    open: false,
  },
  {
    title: 'How much does DITAP cost, and how do I pay?',
    content:
      '<p>Tuition details and government purchase card or interagency agreement payment options are available upon request.</p>',
    open: false,
  },
  {
    title: 'How was DITAP created?',
    content:
      '<p>The Digital IT Acquisition Program was designed by the U.S. Digital Service and the Federal Acquisition Institute to empower federal contracting officers with modern agile procurement practices.</p>',
    open: false,
  },
];

const meta = {
  title: 'Components/Accordion',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
    heading_level: { control: 'select', options: [2, 3, 4] },
    allow_multiple: { control: 'boolean' },
    items: { control: 'object' },
  },
  args: {
    title: 'Frequently asked questions',
    heading_level: 2,
    allow_multiple: false,
    items: sampleFaqItems,
  },
};

export default meta;

export const Default = {};

export const AllowMultiple = {
  args: {
    allow_multiple: true,
  },
};

export const OpenByDefault = {
  args: {
    items: [
      {
        ...sampleFaqItems[0],
        open: true,
      },
      ...sampleFaqItems.slice(1),
    ],
  },
};

export const WithoutTitle = {
  args: {
    title: '',
  },
};

export const HeadingLevel3 = {
  args: {
    heading_level: 3,
  },
};

export const CanvasProps = {
  args: {
    items: [],
    title: 'Frequently asked questions',
    heading_level: 2,
    allow_multiple: false,
    item_1_title: 'What is the class size?',
    item_1_content:
      '<p>Cohorts are typically capped at 25 participants to ensure personalized coaching.</p>',
    item_2_title: 'Is the training customizable?',
    item_2_content:
      '<p>Yes, CivicActions tailors learning pathways to agency acquisition objectives.</p>',
    item_3_title: 'How much does DITAP cost, and how do I pay?',
    item_3_content:
      '<p>Tuition details and payment options are available upon request.</p>',
  },
};
