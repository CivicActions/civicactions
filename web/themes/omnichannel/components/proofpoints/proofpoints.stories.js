import template from './proofpoints.twig';
import './proofpoints.css';

const meta = {
  title: 'Components/Proofpoints',
  render: (args) => template(args),
  argTypes: {
    stat_1: { control: 'text' },
    label_1: { control: 'text' },
    stat_2: { control: 'text' },
    label_2: { control: 'text' },
    stat_3: { control: 'text' },
    label_3: { control: 'text' },
    card_style: { control: 'boolean' },
    alignment: { control: 'select', options: ['center', 'left'] },
  },
  args: {
    stat_1: '92%',
    label_1:
      'of CivicActions DITAP participants would recommend it to a colleague',
    stat_2: '438',
    label_2: 'contracting officers graduated from our program to date',
    stat_3: '100%',
    label_3: 'of learners reported they have “clear takeaways from the course”',
    card_style: false,
    alignment: 'center',
  },
};

export default meta;

export const Default = {};

export const TwoStats = {
  args: {
    stat_1: '12+',
    label_1: 'years of government digital transformation experience',
    stat_2: '99.9%',
    label_2: 'platform uptime delivered across federal agency partner systems',
    stat_3: '',
    label_3: '',
  },
};

export const SingleStat = {
  args: {
    stat_1: '100%',
    label_1: 'open source software and public-good engineering practices',
    stat_2: '',
    label_2: '',
    stat_3: '',
    label_3: '',
  },
};

export const CardStyle = {
  args: {
    card_style: true,
  },
};

export const LeftAligned = {
  args: {
    alignment: 'left',
  },
};
