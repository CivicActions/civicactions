import template from './accordion-container-preview.twig';
import '../accordion/accordion.css';
import './accordion-container.css';
import '../card/card.css';

const faqItems = [
  {
    title: 'What is the class size?',
    content:
      '<p>There is a minimum of 25 - 30 students per cohort. These could be all from one agency, or a blended group. When you apply, we will walk you through the steps to get you (or the people you are registering) into the right group.</p>',
  },
  {
    title: 'Is the training customizable?',
    content:
      '<p>Yes &ndash; we can help your agency achieve specific goals through DITAP as long as the training minimally meets the requirements for the Digital Services Credential (DITAP) from USDS. If you want a customized program that does not result in this credential, we are happy to discuss delivery of a specialized training that meets your needs.</p>',
  },
  {
    title: 'How much does DITAP cost, and how do I pay?',
    content:
      '<p>Tuition details and government purchase card or interagency agreement payment options are available upon request.</p>',
  },
  {
    title: 'How was DITAP created?',
    content:
      '<p>The Digital IT Acquisition Program was designed by the U.S. Digital Service and the Federal Acquisition Institute to empower federal contracting officers with modern agile procurement practices.</p>',
  },
  {
    title: 'Is this training required?',
    content:
      '<p>Federal contracting professionals managing major digital service investments above designated thresholds are required by OMB/OFPP guidance to hold the DITAP certification.</p>',
  },
  {
    title: 'When does the next DITAP training begin?',
    content:
      '<p>Cohorts launch quarterly throughout the fiscal year. Contact the DITAP team for current enrollment windows and scheduling options.</p>',
  },
  {
    title: 'What is the application process?',
    content:
      '<p>Applicants submit supervisory endorsement and warrant details through the online registration form.</p>',
  },
  {
    title: 'Terms of Service',
    content:
      '<p>Standard course participation policies and cohort completion requirements apply to all enrolled learners.</p>',
  },
  {
    title:
      "What if I don't have a full-cohort? What if I am an individual inquiring for a few colleagues at my agency?",
    content:
      '<p>CivicActions welcomes individual participants and small agency teams into open-enrollment multi-agency cohorts.</p>',
  },
];

const meta = {
  title: 'Components/Accordion Container',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
    heading_level: { control: 'select', options: [2, 3, 4] },
    single_open: { control: 'boolean' },
    items: { control: 'object' },
  },
  args: {
    title: 'Frequently asked questions',
    heading_level: 2,
    single_open: false,
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

export const LegacyOpenItems = {
  parameters: {
    docs: {
      description: {
        story:
          'Matches the legacy DITAP FAQ screenshot with the first two answers open at the same time.',
      },
    },
  },
  args: {
    items: [
      { ...faqItems[0], open: true },
      { ...faqItems[1], open: true },
      ...faqItems.slice(2),
    ],
  },
};

export const SingleOpen = {
  args: {
    single_open: true,
  },
};

export const DuplicateTitles = {
  args: {
    items: faqItems.map((item) => ({
      ...item,
      title: 'What is the class size?',
    })),
  },
};

export const RecommendedAuthoringComposition = {
  parameters: {
    docs: {
      description: {
        story:
          "Use an Accordion group for repeated questions. Add Accordion items to the group, then place Content or Card components inside each item's Answer content slot.",
      },
    },
  },
  args: {
    items: [
      faqItems[0],
      {
        title: 'Need help getting started?',
        card: {
          heading_level: 3,
          title: 'Request training',
          link: '/services/ditap/register/',
          icon: '',
          icon_alt: '',
          icon_name: 'certificate',
          body: 'Connect with the DITAP team about enrollment and scheduling.',
        },
      },
      faqItems[1],
    ],
  },
};
