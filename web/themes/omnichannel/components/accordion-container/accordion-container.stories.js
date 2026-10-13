import template from './accordion-container-preview.twig';
import '../accordion/accordion.css';
import './accordion-container.css';

const faqItems = [
  {
    title: 'What is the class size?',
    content:
      '<p>Cohorts are typically capped to ensure personal coaching and collaborative breakout sessions.</p>',
  },
  {
    title: 'Is the training customizable?',
    content:
      '<p>Yes, CivicActions tailors learning pathways and schedule cadences to meet agency acquisition objectives.</p>',
  },
  {
    title: 'How much does DITAP cost, and how do I pay?',
    content:
      '<p>Tuition details and government purchase card or interagency agreement payment options are available upon request.</p>',
  },
];

const meta = {
  title: 'Components/Accordion Container',
  render: (args) => template(args),
  argTypes: {
    heading_level: { control: 'select', options: [2, 3, 4] },
    items: { control: 'object' },
  },
  args: {
    heading_level: 2,
    items: faqItems,
  },
};

export default meta;

export const Default = {};

export const WithOpenItem = {
  args: {
    items: [
      {
        ...faqItems[0],
        open: true,
      },
      ...faqItems.slice(1),
    ],
  },
};
